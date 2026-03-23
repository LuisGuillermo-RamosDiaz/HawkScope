"""
HawkScope SOC Platform - Agente de Monitoreo
=============================================
Recolecta telemetría del sistema y la transmite al backend cada SEND_INTERVAL segundos.
Estrategia: PUSH unidireccional. El backend JAMÁS solicita datos al agente.

Resiliencia ante caídas de red:
  - Los payloads que no pueden enviarse se guardan en un buffer persistente en disco
    (buffer.jsonl junto al script). Al restaurarse la conexión, se reenvían en orden
    antes de continuar con telemetría nueva.
  - Backoff exponencial entre ciclos fallidos para no saturar la red ni el backend.

Autor: HawkScope Dev Team
"""

import collections
import json
import logging
import logging.handlers
import os
import platform
import psutil
import requests
import signal
import socket
import sys
import time

from datetime import datetime, timezone
from dotenv import load_dotenv
from typing import Optional

# ---------------------------------------------------------------------------
# Versión del agente — debe coincidir con el campo `agent_version` en servers
# ---------------------------------------------------------------------------
__version__ = "2.1.0"

# ---------------------------------------------------------------------------
# Rutas base — relativas al directorio donde vive monitor.py
# ---------------------------------------------------------------------------
_BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
_LOG_DIR     = os.path.join(_BASE_DIR, "logs")
_BUFFER_FILE = os.path.join(_LOG_DIR, "buffer.jsonl")

os.makedirs(_LOG_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# Logging robusto: stdout (journald) + archivo rotativo
# ---------------------------------------------------------------------------
_formatter = logging.Formatter(
    fmt="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S"
)
_stream_handler = logging.StreamHandler(sys.stdout)
_stream_handler.setFormatter(_formatter)

_file_handler = logging.handlers.RotatingFileHandler(
    filename=os.path.join(_LOG_DIR, "hawkscope-agent.log"),
    maxBytes=5 * 1024 * 1024,   # 5 MB por archivo
    backupCount=5,
    encoding="utf-8"
)
_file_handler.setFormatter(_formatter)

logger = logging.getLogger("hawkscope.agent")
logger.setLevel(logging.INFO)
logger.addHandler(_stream_handler)
logger.addHandler(_file_handler)

# ---------------------------------------------------------------------------
# Carga .env
# Cuando el agente corre bajo systemd con EnvironmentFile=, las variables ya
# están inyectadas por el proceso padre (root) antes de que el proceso hijo
# (hawkscope) arranque. load_dotenv() es para ejecución directa/debug; si el
# archivo .env es 600 root:root y el proceso es hawkscope, falla en silencio,
# lo cual es el comportamiento correcto.
# ---------------------------------------------------------------------------
load_dotenv(dotenv_path=os.path.join(_BASE_DIR, ".env"))


# ===========================================================================
# Utilidades de red
# ===========================================================================

def _get_internal_ip() -> str:
    """
    Obtiene la IP interna abriendo un socket UDP hacia 8.8.8.8 (sin tráfico real).
    Fallback: primera IP no-loopback de cualquier interfaz.
    Fallback final: 127.0.0.1.
    """
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.settimeout(2)
            s.connect(("8.8.8.8", 80))
            return s.getsockname()[0]
    except Exception:
        pass

    try:
        for _iface, addr_list in psutil.net_if_addrs().items():
            for addr in addr_list:
                if addr.family == socket.AF_INET and not addr.address.startswith("127."):
                    return addr.address
    except Exception:
        pass

    return "127.0.0.1"


# ===========================================================================
# Recolectores — nunca lanzan excepción; retornan None ante cualquier fallo
# ===========================================================================

def _safe(fn, *args, default=None, **kwargs):
    """Envuelve una llamada psutil; retorna `default` si falla."""
    try:
        return fn(*args, **kwargs)
    except Exception as exc:
        logger.debug("Métrica no disponible (%s): %s", fn.__name__, exc)
        return default


def collect_resources() -> dict:
    """
    Mapeo exhaustivo hacia la tabla `metrics`:
        cpu_usage, ram_usage, disk_usage,
        network_bytes_in/out, network_packets_in/out, network_errors_in/out,
        processes_count, tcp_connections, established_connections,
        cpu_temp_celsius, memory_available_mb, swap_used_mb.

    Nota: response_time_ms, request_count y error_count son calculados por el
    backend desde su propio tráfico HTTP — no se emiten desde el agente.
    """

    # --- CPU (interval=1 da lectura precisa sin bloquear el loop) ---
    cpu_usage: Optional[float] = _safe(psutil.cpu_percent, interval=1)

    # --- RAM ---
    mem = _safe(psutil.virtual_memory)
    ram_usage:        Optional[float] = mem.percent                    if mem else None
    mem_available_mb: Optional[int]   = mem.available // (1024 * 1024) if mem else None

    # --- Disco (partición raíz, con fallback a primera partición real) ---
    disk = _safe(psutil.disk_usage, "/")
    if disk is None:
        try:
            for part in psutil.disk_partitions(all=False):
                if part.fstype not in ("tmpfs", "devtmpfs", "squashfs", ""):
                    disk = _safe(psutil.disk_usage, part.mountpoint)
                    if disk:
                        break
        except Exception:
            pass
    disk_usage: Optional[float] = disk.percent if disk else None

    # --- Red (contadores acumulados del SO) ---
    net = _safe(psutil.net_io_counters)
    net_bytes_in:    Optional[int] = net.bytes_recv   if net else None
    net_bytes_out:   Optional[int] = net.bytes_sent   if net else None
    net_packets_in:  Optional[int] = net.packets_recv if net else None
    net_packets_out: Optional[int] = net.packets_sent if net else None
    net_errors_in:   Optional[int] = net.errin        if net else None
    net_errors_out:  Optional[int] = net.errout       if net else None

    # --- Procesos ---
    procs = _safe(psutil.process_iter, ["pid"], default=[])
    processes_count: Optional[int] = len(list(procs)) if procs is not None else None

    # --- Conexiones TCP ---
    tcp_connections:   Optional[int] = None
    established_conns: Optional[int] = None
    try:
        conns = psutil.net_connections(kind="tcp")
        tcp_connections   = len(conns)
        established_conns = sum(1 for c in conns if c.status == "ESTABLISHED")
    except (psutil.AccessDenied, PermissionError):
        logger.debug("net_connections: acceso denegado; se omite el campo.")
    except Exception as exc:
        logger.debug("net_connections: %s", exc)

    # --- Temperatura CPU ---
    # Prioridad: coretemp (Intel) → k10temp/zenpower (AMD) →
    #            cpu_thermal (ARM) → acpitz → primer sensor disponible
    cpu_temp: Optional[float] = None
    try:
        temps = psutil.sensors_temperatures()
        if temps:
            for key in ("coretemp", "k10temp", "zenpower", "cpu_thermal", "acpitz"):
                if key in temps and temps[key]:
                    cpu_temp = temps[key][0].current
                    break
            if cpu_temp is None:
                first = next(iter(temps.values()), [])
                if first:
                    cpu_temp = first[0].current
    except Exception:
        pass  # VMs y algunos kernels no exponen sensores de temperatura

    # --- Swap ---
    swap = _safe(psutil.swap_memory)
    swap_used_mb: Optional[int] = swap.used // (1024 * 1024) if swap else None

    return {
        "cpu_usage":               cpu_usage,
        "ram_usage":               ram_usage,
        "disk_usage":              disk_usage,
        "network_bytes_in":        net_bytes_in,
        "network_bytes_out":       net_bytes_out,
        "network_packets_in":      net_packets_in,
        "network_packets_out":     net_packets_out,
        "network_errors_in":       net_errors_in,
        "network_errors_out":      net_errors_out,
        "processes_count":         processes_count,
        "tcp_connections":         tcp_connections,
        "established_connections": established_conns,
        "cpu_temp_celsius":        cpu_temp,
        "memory_available_mb":     mem_available_mb,
        "swap_used_mb":            swap_used_mb,
    }


def collect_security() -> dict:
    """
    Mapeo hacia los campos de la tabla `security_events`:
        active_connections  →  source_ip, source_port, process_pid
        logged_users        →  user_name
    """
    connections = []
    try:
        for conn in psutil.net_connections(kind="inet"):
            if conn.status == "ESTABLISHED" and conn.raddr:
                rip = conn.raddr.ip
                if not rip.startswith("127.") and rip != "::1":
                    connections.append({
                        "remote": f"{rip}:{conn.raddr.port}",
                        "local":  f"{conn.laddr.ip}:{conn.laddr.port}" if conn.laddr else None,
                        "pid":    conn.pid,
                        "status": conn.status,
                    })
    except (psutil.AccessDenied, PermissionError):
        logger.debug("net_connections (security): acceso denegado.")
    except Exception as exc:
        logger.debug("net_connections (security): %s", exc)

    logged_users = []
    try:
        logged_users = [u.name for u in psutil.users()]
    except Exception as exc:
        logger.debug("users(): %s", exc)

    return {
        "active_connections": connections,
        "logged_users":       logged_users,
    }


def collect_system_info() -> dict:
    """
    Metadatos del host para que el backend actualice la fila en `servers`:
        os_name, os_version, os_arch, uptime_seconds.
    """
    uptime: Optional[int] = None
    try:
        uptime = int(time.time() - psutil.boot_time())
    except Exception:
        pass

    return {
        "os_name":        platform.system(),
        "os_version":     platform.release(),
        "os_arch":        platform.machine(),
        "uptime_seconds": uptime,
    }


# ===========================================================================
# Buffer persistente en disco
# ===========================================================================

class DiskBuffer:
    """
    Buffer FIFO persistente en disco (archivo JSONL) para almacenar payloads
    que no pudieron enviarse por caída de red o backend no disponible.

    Capacidad: MAX_SIZE entradas. Si se supera, la deque descarta automáticamente
    los payloads más antiguos (política FIFO nativa de collections.deque con maxlen).

    Escritura atómica: se escribe a un archivo .tmp y luego se renombra, lo que
    garantiza que no haya corrupción ante un crash o SIGKILL entre escrituras.
    """

    MAX_SIZE = 500  # ~83 min offline a 10s/ciclo

    def __init__(self, path: str) -> None:
        self._path = path
        self._queue: collections.deque = collections.deque(maxlen=self.MAX_SIZE)
        self._load()

    def _load(self) -> None:
        """Lee el JSONL al arrancar y restaura el buffer en memoria."""
        if not os.path.exists(self._path):
            return
        loaded = 0
        try:
            with open(self._path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line:
                        try:
                            self._queue.append(json.loads(line))
                            loaded += 1
                        except json.JSONDecodeError:
                            pass   # línea corrupta — se ignora silenciosamente
            if loaded:
                logger.info(
                    "Buffer restaurado desde disco: %d payload(s) pendiente(s) de envío.",
                    loaded
                )
        except Exception as exc:
            logger.warning("No se pudo leer el buffer en disco (%s): %s", self._path, exc)

    def _save(self) -> None:
        """Persiste el buffer en disco de forma atómica (tmp → rename)."""
        tmp = self._path + ".tmp"
        try:
            with open(tmp, "w", encoding="utf-8") as f:
                for item in self._queue:
                    f.write(json.dumps(item, ensure_ascii=False) + "\n")
            os.replace(tmp, self._path)
        except Exception as exc:
            logger.warning("No se pudo guardar el buffer en disco: %s", exc)
            try:
                os.unlink(tmp)
            except Exception:
                pass

    def push(self, payload: dict) -> None:
        """Agrega un payload y persiste en disco."""
        self._queue.append(payload)
        self._save()

    def pop(self) -> Optional[dict]:
        """Extrae el payload más antiguo. Llamar flush_to_disk() tras envío exitoso."""
        return self._queue.popleft() if self._queue else None

    def peek(self) -> Optional[dict]:
        """Consulta el más antiguo sin extraerlo."""
        return self._queue[0] if self._queue else None

    def flush_to_disk(self) -> None:
        """Persiste el estado actual. Si el buffer quedó vacío, elimina el archivo."""
        self._save()
        if not self._queue and os.path.exists(self._path):
            try:
                os.unlink(self._path)
            except Exception:
                pass

    def __len__(self) -> int:
        return len(self._queue)

    def __bool__(self) -> bool:
        return bool(self._queue)


# ===========================================================================
# Agente principal
# ===========================================================================

class HawkScopeAgent:
    """
    Agente de monitoreo HawkScope v2.1.

    Variables de entorno requeridas:
        API_URL       — Endpoint del backend
        API_KEY       — api_key de la organización (tabla organizations.api_key)

    Variables opcionales:
        SEND_INTERVAL — Segundos entre envíos (default: 10, mínimo: 5)
        LOG_LEVEL     — DEBUG | INFO | WARNING | ERROR (default: INFO)
    """

    # Backoff exponencial entre ciclos fallidos (segundos)
    _BACKOFF = (10, 20, 40, 80, 120, 120)   # cap en 2 min

    def __init__(self) -> None:
        self.api_url:  Optional[str] = os.getenv("API_URL",  "").strip() or None
        self.api_key:  Optional[str] = os.getenv("API_KEY",  "").strip() or None
        self.interval: int           = self._parse_interval()

        log_level = os.getenv("LOG_LEVEL", "INFO").upper()
        logger.setLevel(getattr(logging, log_level, logging.INFO))

        self.hostname:    str  = socket.gethostname()
        self.local_ip:    str  = _get_internal_ip()
        self._shutdown:   bool = False
        self._fail_count: int  = 0

        self._buffer = DiskBuffer(_BUFFER_FILE)

        signal.signal(signal.SIGTERM, self._handle_signal)
        signal.signal(signal.SIGINT,  self._handle_signal)

        self._log_startup()

    # ------------------------------------------------------------------

    def _parse_interval(self) -> int:
        raw = os.getenv("SEND_INTERVAL", "10")
        try:
            val = int(raw)
            if val < 5:
                logger.warning("SEND_INTERVAL=%s es demasiado bajo; se usa 5s mínimo.", val)
                return 5
            return val
        except ValueError:
            logger.warning("SEND_INTERVAL='%s' no es un entero válido; se usa 10s.", raw)
            return 10

    def _log_startup(self) -> None:
        logger.info("=" * 60)
        logger.info("HawkScope Agent v%s arrancando", __version__)
        logger.info("Hostname      : %s", self.hostname)
        logger.info("IP interna    : %s", self.local_ip)
        logger.info("API URL       : %s", self.api_url or "[MODO DEBUG — sin API_URL]")
        logger.info("API Key       : %s***", (self.api_key or "")[:6])
        logger.info("Intervalo     : %ss", self.interval)
        logger.info("Buffer disco  : %s (%d pendientes)", _BUFFER_FILE, len(self._buffer))
        logger.info("Python        : %s", sys.version.split()[0])
        logger.info("psutil        : %s", psutil.__version__)
        logger.info("=" * 60)

        if not self.api_url:
            logger.warning(
                "API_URL no definida. El agente imprimirá el payload en stdout "
                "pero NO enviará datos al backend."
            )
        if not self.api_key:
            logger.warning("API_KEY no definida. Todos los envíos recibirán 401.")

    def _handle_signal(self, signum, _frame) -> None:
        logger.info("Señal %s recibida. Apagando agente limpiamente…", signum)
        self._shutdown = True

    # ------------------------------------------------------------------
    # Construcción del payload
    # ------------------------------------------------------------------

    def _build_payload(self) -> dict:
        return {
            "version":   __version__,
            "host":      self.hostname,
            "ip":        self.local_ip,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "system":    collect_system_info(),
            "resources": collect_resources(),
            "security":  collect_security(),
        }

    # ------------------------------------------------------------------
    # Envío HTTP — un intento por llamada, sin reintentos internos.
    # El loop principal es responsable del backoff y la gestión del buffer.
    # ------------------------------------------------------------------

    def _try_send(self, payload: dict) -> bool:
        """
        Intenta enviar un payload al backend.
        Retorna True si fue exitoso (2xx) O si el error es permanente (401)
        y el payload no debe ser bufferizado.
        Retorna False si el error es transitorio (red, timeout, 5xx, 429).
        """
        headers = {
            "X-API-KEY":    self.api_key or "",
            "Content-Type": "application/json",
            "User-Agent":   f"HawkScope-Agent/{__version__}",
        }
        try:
            resp = requests.post(self.api_url, json=payload, headers=headers, timeout=8)

            if resp.status_code in (200, 201):
                return True

            if resp.status_code == 401:
                # Error permanente — la clave está mal. No bufferizar.
                logger.error(
                    "Autenticación fallida (401). Verifica API_KEY en .env. "
                    "El payload se descarta (no se bufferiza)."
                )
                return True   # True para evitar que el loop lo meta al buffer

            if resp.status_code == 429:
                logger.warning("Rate limit (429) — backend saturado.")
                return False

            logger.warning("Backend respondió %s: %s", resp.status_code, resp.text[:200])
            return False

        except requests.exceptions.ConnectionError as exc:
            logger.warning("Sin conexión al backend: %s", exc)
        except requests.exceptions.Timeout:
            logger.warning("Timeout al enviar (8s).")
        except Exception as exc:
            logger.error("Error inesperado al enviar: %s", exc)

        return False

    # ------------------------------------------------------------------
    # Drenar el buffer: reenviar todos los payloads pendientes en orden
    # ------------------------------------------------------------------

    def _drain_buffer(self) -> bool:
        """
        Intenta reenviar los payloads del buffer del más antiguo al más reciente.
        Se detiene ante el primer fallo (el backend sigue sin estar disponible).
        Retorna True si el buffer quedó vacío.
        """
        if not self._buffer:
            return True

        logger.info("Reintentando %d payload(s) del buffer…", len(self._buffer))

        while self._buffer and not self._shutdown:
            oldest = self._buffer.peek()
            if self._try_send(oldest):
                self._buffer.pop()
                self._buffer.flush_to_disk()
            else:
                logger.warning(
                    "Fallo al reenviar buffer. Quedan %d payload(s) pendientes.",
                    len(self._buffer)
                )
                return False

        if not self._buffer:
            logger.info("Buffer vaciado — todos los payloads pendientes enviados.")
        return not bool(self._buffer)

    # ------------------------------------------------------------------
    # Loop principal
    # ------------------------------------------------------------------

    def _interruptible_sleep(self, seconds: float) -> None:
        """Sleep que se corta inmediatamente ante SIGTERM/SIGINT."""
        deadline = time.monotonic() + seconds
        while time.monotonic() < deadline and not self._shutdown:
            time.sleep(0.2)

    def run(self) -> None:
        logger.info("Agente en ejecución. Ctrl+C o SIGTERM para detener.")

        while not self._shutdown:
            cycle_start = time.monotonic()

            # 1. Construir payload
            try:
                payload = self._build_payload()
            except Exception as exc:
                logger.error("Error construyendo payload: %s", exc)
                self._interruptible_sleep(self.interval)
                continue

            # 2. Modo debug sin API_URL
            if not self.api_url:
                print(json.dumps(payload, indent=2, ensure_ascii=False))
                self._interruptible_sleep(self.interval)
                continue

            # 3. Si hay buffer, drenar primero (orden cronológico garantizado)
            if self._buffer:
                buffer_cleared = self._drain_buffer()
                if not buffer_cleared:
                    # Backend sigue caído → guardar también el payload nuevo
                    self._buffer.push(payload)
                    self._fail_count += 1
                    backoff = self._BACKOFF[min(self._fail_count - 1, len(self._BACKOFF) - 1)]
                    logger.warning(
                        "Backend no disponible. Buffer: %d payload(s). Backoff: %ds.",
                        len(self._buffer), backoff
                    )
                    self._interruptible_sleep(backoff)
                    continue
                # Buffer drenado con éxito
                self._fail_count = 0

            # 4. Enviar payload del ciclo actual
            success = self._try_send(payload)

            if success:
                if self._fail_count > 0:
                    logger.info("Conexión restaurada tras %d fallo(s).", self._fail_count)
                self._fail_count = 0
                logger.debug("Telemetría enviada OK.")
            else:
                # Guardar en buffer para no perder el dato
                self._buffer.push(payload)
                self._fail_count += 1
                backoff = self._BACKOFF[min(self._fail_count - 1, len(self._BACKOFF) - 1)]
                logger.warning(
                    "Envío fallido. Guardado en buffer (%d total). Backoff: %ds.",
                    len(self._buffer), backoff
                )
                self._interruptible_sleep(backoff)
                continue

            # 5. Dormir el tiempo restante del intervalo
            elapsed   = time.monotonic() - cycle_start
            sleep_for = max(0.0, self.interval - elapsed)

            if elapsed > self.interval:
                logger.warning(
                    "Ciclo tardó %.1fs (intervalo=%ds). Considera aumentar SEND_INTERVAL.",
                    elapsed, self.interval
                )

            self._interruptible_sleep(sleep_for)

        logger.info(
            "Agente detenido limpiamente. Buffer en disco: %d payload(s).",
            len(self._buffer)
        )


# ===========================================================================
# Entrypoint
# ===========================================================================

if __name__ == "__main__":
    agent = HawkScopeAgent()
    agent.run()
