#!/usr/bin/env bash
# =============================================================================
# HawkScope SOC Platform — Script de instalación del Agente
# =============================================================================
# Versión : 2.0.0
# Uso     : sudo bash install.sh
#           sudo bash install.sh --update   (reinstala sobre instalación previa)
#
# Modos de distribución soportados:
#   A) Ejecución local  — bash install.sh      (desde carpeta con los archivos)
#   B) Ejecución remota — curl https://.../install.sh | sudo bash
#
# Distribuciones soportadas:
#   - Debian / Ubuntu           (apt)
#   - RHEL / CentOS / Rocky /
#     AlmaLinux / Fedora        (dnf / yum)
#   - SUSE / openSUSE           (zypper)
#   - Arch Linux                (pacman)   — soporte best-effort
# =============================================================================
set -euo pipefail

# ---------------------------------------------------------------------------
# Colores y utilidades de salida
# ---------------------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; }
die()     { error "$*"; exit 1; }
banner()  { echo -e "\n${BOLD}${CYAN}$*${NC}\n"; }

# ---------------------------------------------------------------------------
# Constantes
# ---------------------------------------------------------------------------
AGENT_USER="hawkscope"
INSTALL_DIR="/opt/hawkscope-agent"
SERVICE_NAME="hawkscope-agent"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
PYTHON_MIN_MAJOR=3
PYTHON_MIN_MINOR=9
UPDATE_MODE=false

# URL base desde donde se descargan monitor.py y requirements.txt.
# Esta URL es la fuente canónica para el modo de distribución remota
# (one-liner: curl .../install.sh | sudo bash).
# En modo local (bash install.sh desde una carpeta con los archivos),
# se usa la copia local y esta URL se ignora.
AGENT_FILES_URL="https://raw.githubusercontent.com/LuisGuillermo-RamosDiaz/HawkScope/main/agente"

# Variable de entorno opcional para sobreescribir la URL en entornos de prueba:
#   HAWKSCOPE_RELEASE_URL=https://mi-servidor/agent sudo bash install.sh
[[ -n "${HAWKSCOPE_RELEASE_URL:-}" ]] && AGENT_FILES_URL="$HAWKSCOPE_RELEASE_URL"

# ---------------------------------------------------------------------------
# Parseo de argumentos
# ---------------------------------------------------------------------------
for arg in "$@"; do
  case "$arg" in
    --update|-u) UPDATE_MODE=true ;;
    --help|-h)
      echo "Uso: sudo bash install.sh [--update]"
      echo "  --update  Reinstala el agente sobre una instalación existente"
      exit 0
      ;;
  esac
done

# ---------------------------------------------------------------------------
# 1. Verificación de privilegios
# ---------------------------------------------------------------------------
banner "HawkScope Agent Installer v2.0.0"

if [[ "$EUID" -ne 0 ]]; then
  die "Este script debe ejecutarse con sudo o como root.\n  Uso: sudo bash install.sh"
fi

# ---------------------------------------------------------------------------
# 2. Detección del gestor de paquetes y familia de OS
# ---------------------------------------------------------------------------
detect_os() {
  if command -v apt-get &>/dev/null; then
    PKG_MANAGER="apt"
  elif command -v dnf &>/dev/null; then
    PKG_MANAGER="dnf"
  elif command -v yum &>/dev/null; then
    PKG_MANAGER="yum"
  elif command -v zypper &>/dev/null; then
    PKG_MANAGER="zypper"
  elif command -v pacman &>/dev/null; then
    PKG_MANAGER="pacman"
  else
    die "No se reconoció ningún gestor de paquetes (apt/dnf/yum/zypper/pacman).\n  Instala Python 3.9+ y pip manualmente, luego vuelve a ejecutar el script."
  fi

  # Mostrar info del OS al operador
  if [[ -f /etc/os-release ]]; then
    # shellcheck disable=SC1091
    source /etc/os-release
    info "Sistema detectado: ${PRETTY_NAME:-desconocido} (gestor: ${PKG_MANAGER})"
  else
    info "Gestor de paquetes detectado: ${PKG_MANAGER}"
  fi
}

# ---------------------------------------------------------------------------
# 3. Instalación de dependencias del sistema
# ---------------------------------------------------------------------------
install_system_deps() {
  info "Instalando dependencias del sistema (Python 3 + venv + pip)…"

  case "$PKG_MANAGER" in
    apt)
      apt-get update -qq
      apt-get install -y -qq python3 python3-pip python3-venv curl
      ;;
    dnf)
      dnf install -y -q python3 python3-pip curl
      # python3-venv viene incluido en el paquete python3 en RHEL 9+
      dnf install -y -q python3-virtualenv 2>/dev/null || true
      ;;
    yum)
      yum install -y -q python3 python3-pip curl
      yum install -y -q python3-virtualenv 2>/dev/null || true
      ;;
    zypper)
      zypper install -y -q python3 python3-pip python3-virtualenv curl
      ;;
    pacman)
      pacman -Sy --noconfirm --quiet python python-pip curl
      ;;
  esac
  success "Dependencias del sistema instaladas."
}

# ---------------------------------------------------------------------------
# 4. Verificación de la versión de Python
# ---------------------------------------------------------------------------
verify_python() {
  PYTHON_BIN=""
  for candidate in python3.12 python3.11 python3.10 python3.9 python3; do
    if command -v "$candidate" &>/dev/null; then
      version=$("$candidate" -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
      major=$(echo "$version" | cut -d. -f1)
      minor=$(echo "$version" | cut -d. -f2)
      if [[ "$major" -ge "$PYTHON_MIN_MAJOR" && "$minor" -ge "$PYTHON_MIN_MINOR" ]]; then
        PYTHON_BIN="$candidate"
        info "Python encontrado: $candidate ($version)"
        break
      fi
    fi
  done

  if [[ -z "$PYTHON_BIN" ]]; then
    die "No se encontró Python ${PYTHON_MIN_MAJOR}.${PYTHON_MIN_MINOR}+.\n  Instálalo manualmente y vuelve a ejecutar el script."
  fi
}

# ---------------------------------------------------------------------------
# 5. Crear usuario del sistema dedicado (sin shell, sin home login)
# ---------------------------------------------------------------------------
create_agent_user() {
  if id "$AGENT_USER" &>/dev/null; then
    info "El usuario del sistema '${AGENT_USER}' ya existe."
  else
    info "Creando usuario del sistema '${AGENT_USER}'…"
    # --system     : UID en rango de sistema, sin contraseña
    # --no-create-home: no crea /home/hawkscope
    # --shell /usr/sbin/nologin: sin acceso interactivo
    if command -v useradd &>/dev/null; then
      useradd \
        --system \
        --no-create-home \
        --shell /usr/sbin/nologin \
        --comment "HawkScope Agent Service Account" \
        "$AGENT_USER"
    elif command -v adduser &>/dev/null; then
      # Estilo BusyBox / Alpine
      adduser -S -H -s /sbin/nologin -G "$AGENT_USER" "$AGENT_USER" 2>/dev/null || \
      adduser -S -H -s /sbin/nologin "$AGENT_USER"
    else
      die "No se pudo crear el usuario '${AGENT_USER}'. Créalo manualmente."
    fi
    success "Usuario '${AGENT_USER}' creado."
  fi
}

# ---------------------------------------------------------------------------
# 6. Preparar directorio de instalación
# ---------------------------------------------------------------------------
prepare_install_dir() {
  if [[ "$UPDATE_MODE" == true && -d "$INSTALL_DIR" ]]; then
    info "Modo actualización: respaldando configuración existente…"
    # Preservar .env si existe
    [[ -f "${INSTALL_DIR}/.env" ]] && cp "${INSTALL_DIR}/.env" /tmp/.hawkscope-env.bak
  fi

  info "Preparando directorio ${INSTALL_DIR}…"
  mkdir -p "${INSTALL_DIR}/logs"
}

# ---------------------------------------------------------------------------
# 7. Copiar o descargar los archivos del agente
# ---------------------------------------------------------------------------
deploy_agent_files() {
  info "Desplegando archivos del agente…"

  # Detectar si estamos en modo pipe (curl ... | sudo bash) o modo local
  # En modo pipe, $0 es "bash" o "-bash" — no hay path de archivo real.
  # En modo local, $0 es el path al script (ej. ./install.sh o /tmp/install.sh).
  _is_pipe_mode() {
    # Si $0 contiene "bash" sin un "/" que indique un path real, es modo pipe
    local script_name
    script_name="$(basename "$0")"
    [[ "$script_name" == "bash" || "$script_name" == "-bash" || "$0" == "/dev/stdin" ]]
  }

  if _is_pipe_mode; then
    # ---- Modo B: ejecución remota (curl ... | sudo bash) ----------------
    # No hay archivos locales — descargar desde la URL canónica del release.
    info "Modo remoto detectado. Descargando desde ${AGENT_FILES_URL}…"
    for file in monitor.py requirements.txt; do
      curl -fsSL "${AGENT_FILES_URL}/${file}" -o "${INSTALL_DIR}/${file}" ||         die "No se pudo descargar ${file} desde ${AGENT_FILES_URL}."
    done
    success "Archivos descargados correctamente."

  elif [[ -f "$(cd "$(dirname "$0")" 2>/dev/null && pwd)/monitor.py" ]]; then
    # ---- Modo A: ejecución local (bash install.sh desde carpeta del proyecto)
    SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
    info "Modo local detectado. Copiando archivos desde ${SCRIPT_DIR}…"
    cp "${SCRIPT_DIR}/monitor.py"       "${INSTALL_DIR}/monitor.py"
    cp "${SCRIPT_DIR}/requirements.txt" "${INSTALL_DIR}/requirements.txt"
    success "Archivos copiados correctamente."

  else
    # ---- Fallback: intentar descarga remota aunque parezca modo local ----
    warn "No se encontraron archivos locales. Intentando descarga remota…"
    for file in monitor.py requirements.txt; do
      curl -fsSL "${AGENT_FILES_URL}/${file}" -o "${INSTALL_DIR}/${file}" ||         die "No se pudo descargar ${file}.\n\
  Opciones:\n\
    A) Ejecuta install.sh desde la carpeta que contiene monitor.py\n\
    B) Usa el one-liner: curl -fsSL ${AGENT_FILES_URL}/install.sh | sudo bash\n\
    C) Define HAWKSCOPE_RELEASE_URL para apuntar a tu propio servidor"
    done
    success "Archivos descargados correctamente (fallback remoto)."
  fi

  # Restaurar .env si estábamos actualizando
  if [[ "$UPDATE_MODE" == true && -f /tmp/.hawkscope-env.bak ]]; then
    cp /tmp/.hawkscope-env.bak "${INSTALL_DIR}/.env"
    rm -f /tmp/.hawkscope-env.bak
    info ".env existente restaurado tras la actualización."
  fi
}

# ---------------------------------------------------------------------------
# 8. Entorno virtual Python + dependencias
# ---------------------------------------------------------------------------
setup_virtualenv() {
  VENV_DIR="${INSTALL_DIR}/venv"

  if [[ "$UPDATE_MODE" == true && -d "$VENV_DIR" ]]; then
    info "Actualizando dependencias del entorno virtual…"
  else
    info "Creando entorno virtual Python en ${VENV_DIR}…"
    "$PYTHON_BIN" -m venv "$VENV_DIR"
  fi

  info "Instalando dependencias Python (requirements.txt)…"
  "${VENV_DIR}/bin/pip" install --quiet --upgrade pip
  "${VENV_DIR}/bin/pip" install --quiet -r "${INSTALL_DIR}/requirements.txt"
  success "Dependencias Python instaladas."
}

# ---------------------------------------------------------------------------
# 9. Configurar .env de forma interactiva (solo en instalación nueva)
# ---------------------------------------------------------------------------
configure_env() {
  ENV_FILE="${INSTALL_DIR}/.env"

  if [[ "$UPDATE_MODE" == true && -f "$ENV_FILE" ]]; then
    info "Modo actualización: se mantiene el .env existente."
    return
  fi

  if [[ -f "$ENV_FILE" ]]; then
    warn ".env ya existe en ${INSTALL_DIR}. Se conservará sin cambios."
    warn "Para modificarlo: sudo nano ${ENV_FILE}"
    return
  fi

  banner "Configuración del Agente"
  echo -e "  Necesitas dos datos que se encuentran en la sección ${BOLD}/setup${NC} de tu cuenta HawkScope:\n"

  # --- API URL ---
  while true; do
    read -rp "  URL del backend HawkScope (ej: https://api.hawkscope.io/v1/agent/telemetry): " api_url
    api_url="$(echo "$api_url" | xargs)"   # trim whitespace
    if [[ "$api_url" =~ ^https?:// ]]; then
      break
    fi
    warn "La URL debe comenzar con http:// o https://. Inténtalo de nuevo."
  done

  # --- API KEY ---
  while true; do
    read -rsp "  API Key de tu organización (no se mostrará): " api_key
    echo
    api_key="$(echo "$api_key" | xargs)"
    if [[ ${#api_key} -ge 16 ]]; then
      break
    fi
    warn "La API Key parece demasiado corta (mínimo 16 caracteres). Inténtalo de nuevo."
  done

  # --- Intervalo opcional ---
  read -rp "  Intervalo de envío en segundos [10]: " send_interval
  send_interval="${send_interval:-10}"
  if ! [[ "$send_interval" =~ ^[0-9]+$ ]] || [[ "$send_interval" -lt 5 ]]; then
    warn "Intervalo inválido; se usará 10s."
    send_interval=10
  fi

  # Escribir .env
  cat > "$ENV_FILE" <<EOF
# HawkScope Agent — Configuración
# Generado automáticamente por install.sh el $(date -u +"%Y-%m-%dT%H:%M:%SZ")
# Para modificar: sudo nano ${ENV_FILE}

API_URL=${api_url}
API_KEY=${api_key}
SEND_INTERVAL=${send_interval}

# Nivel de log: DEBUG | INFO | WARNING | ERROR (default: INFO)
LOG_LEVEL=INFO
EOF

  # Permisos restrictivos — solo root puede leer la clave
  chown root:root "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  success ".env configurado en ${ENV_FILE} (permisos 600)."
}

# ---------------------------------------------------------------------------
# 10. Permisos del directorio de instalación
# ---------------------------------------------------------------------------
set_permissions() {
  info "Configurando permisos…"

  # El agente necesita leer sus archivos y escribir logs
  chown -R "root:${AGENT_USER}" "$INSTALL_DIR"

  # El directorio raíz: root propietario, grupo hawkscope puede leer
  chmod 750 "$INSTALL_DIR"

  # Logs: hawkscope puede escribir
  chown -R "${AGENT_USER}:${AGENT_USER}" "${INSTALL_DIR}/logs"
  chmod 750 "${INSTALL_DIR}/logs"

  # monitor.py y requirements.txt: solo lectura para el agente
  chmod 640 "${INSTALL_DIR}/monitor.py"
  chmod 640 "${INSTALL_DIR}/requirements.txt"

  # .env: solo root (contiene la API key)
  [[ -f "${INSTALL_DIR}/.env" ]] && chmod 600 "${INSTALL_DIR}/.env"

  success "Permisos configurados."
}

# ---------------------------------------------------------------------------
# 11. Crear y activar servicio systemd
# ---------------------------------------------------------------------------
setup_systemd_service() {
  info "Configurando servicio systemd '${SERVICE_NAME}'…"

  # Detener el servicio si ya existe (modo actualización)
  if systemctl is-active --quiet "$SERVICE_NAME" 2>/dev/null; then
    info "Deteniendo servicio existente para actualizar…"
    systemctl stop "$SERVICE_NAME"
  fi

  cat > "$SERVICE_FILE" <<EOF
[Unit]
Description=HawkScope SOC — Agente de Monitoreo v${__version__:-2.0.0}
Documentation=https://docs.hawkscope.io/agent
After=network-online.target
Wants=network-online.target
# Reinicia el agente si el sistema acaba de arrancar y la red aún no está lista
StartLimitIntervalSec=120
StartLimitBurst=5

[Service]
Type=simple
User=${AGENT_USER}
Group=${AGENT_USER}
WorkingDirectory=${INSTALL_DIR}

# Cargar variables de entorno desde .env
# Nota: EnvironmentFile solo lee KEY=VALUE simples, sin comillas bash
EnvironmentFile=${INSTALL_DIR}/.env

ExecStart=${INSTALL_DIR}/venv/bin/python ${INSTALL_DIR}/monitor.py

# Política de reinicios — el agente tiene su propio backoff interno,
# pero systemd también lo reiniciará ante crashes inesperados.
Restart=on-failure
RestartSec=15
TimeoutStopSec=30

# Hardening básico de systemd (seguridad adicional en producción)
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=${INSTALL_DIR}/logs
PrivateTmp=true
CapabilityBoundingSet=

# Logging capturado por journald
StandardOutput=journal
StandardError=journal
SyslogIdentifier=hawkscope-agent

[Install]
WantedBy=multi-user.target
EOF

  systemctl daemon-reload
  systemctl enable --quiet "$SERVICE_NAME"
  systemctl start "$SERVICE_NAME"

  # Dar 3 segundos para que el servicio arranque y verificar
  sleep 3
  if systemctl is-active --quiet "$SERVICE_NAME"; then
    success "Servicio '${SERVICE_NAME}' activo y habilitado en el arranque."
  else
    warn "El servicio no inició correctamente. Revisa los logs con:"
    warn "  journalctl -u ${SERVICE_NAME} -n 50 --no-pager"
    exit 1
  fi
}

# ---------------------------------------------------------------------------
# 12. Resumen final
# ---------------------------------------------------------------------------
print_summary() {
  banner "✅  Instalación completada"
  echo -e "  ${BOLD}Servicio:${NC}        ${SERVICE_NAME}"
  echo -e "  ${BOLD}Directorio:${NC}      ${INSTALL_DIR}"
  echo -e "  ${BOLD}Usuario:${NC}         ${AGENT_USER}"
  echo -e "  ${BOLD}Config (.env):${NC}   ${INSTALL_DIR}/.env"
  echo -e "  ${BOLD}Logs del agente:${NC} ${INSTALL_DIR}/logs/hawkscope-agent.log"
  echo
  echo -e "  ${BOLD}Comandos útiles:${NC}"
  echo -e "    Ver logs en tiempo real : ${CYAN}journalctl -u ${SERVICE_NAME} -f${NC}"
  echo -e "    Ver estado del servicio : ${CYAN}systemctl status ${SERVICE_NAME}${NC}"
  echo -e "    Detener el agente       : ${CYAN}sudo systemctl stop ${SERVICE_NAME}${NC}"
  echo -e "    Reiniciar el agente     : ${CYAN}sudo systemctl restart ${SERVICE_NAME}${NC}"
  echo -e "    Modificar configuración : ${CYAN}sudo nano ${INSTALL_DIR}/.env${NC}"
  echo
}

# ---------------------------------------------------------------------------
# MAIN — Orquestación
# ---------------------------------------------------------------------------
main() {
  detect_os
  install_system_deps
  verify_python
  create_agent_user
  prepare_install_dir
  deploy_agent_files
  setup_virtualenv
  configure_env
  set_permissions
  setup_systemd_service
  print_summary
}

main "$@"
