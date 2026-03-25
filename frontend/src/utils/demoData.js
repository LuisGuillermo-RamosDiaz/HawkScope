/**
 * Centralized demo data — shown ONLY in demo mode (mock token).
 * Real accounts will NEVER see this data.
 */

export const demoServers = [
  { id: 's1', hostname: 'prod-api-01', ip: '10.0.1.10', cpu: 42, ram: 65, disk: 45, status: 'healthy', os: 'Ubuntu 22.04', agent_version: '2.4.1', region: 'US-East', uptime: '45d 12h' },
  { id: 's2', hostname: 'prod-api-02', ip: '10.0.1.11', cpu: 38, ram: 58, disk: 52, status: 'healthy', os: 'Ubuntu 22.04', agent_version: '2.4.1', region: 'US-East', uptime: '45d 12h' },
  { id: 's3', hostname: 'worker-03', ip: '10.0.2.7', cpu: 87, ram: 72, disk: 68, status: 'warning', os: 'Debian 12', agent_version: '2.3.8', region: 'US-West', uptime: '13d 3h' },
  { id: 's4', hostname: 'db-main', ip: '10.0.3.18', cpu: 55, ram: 88, disk: 78, status: 'healthy', os: 'Ubuntu 22.04', agent_version: '2.4.1', region: 'US-East', uptime: '90d 4h' },
  { id: 's5', hostname: 'db-replica', ip: '10.0.3.11', cpu: 36, ram: 45, disk: 68, status: 'healthy', os: 'Ubuntu 22.04', agent_version: '2.4.1', region: 'EU-West', uptime: '90d 4h' },
  { id: 's6', hostname: 'cache-redis', ip: '10.0.4.10', cpu: 12, ram: 35, disk: 15, status: 'healthy', os: 'Alpine 3.18', agent_version: '2.4.0', region: 'US-East', uptime: '120d 8h' },
  { id: 's7', hostname: 'lb-nginx', ip: '10.0.1.5', cpu: 28, ram: 42, disk: 22, status: 'healthy', os: 'Ubuntu 22.04', agent_version: '2.4.1', region: 'US-East', uptime: '60d 2h' },
  { id: 's8', hostname: 'monitor-01', ip: '10.0.5.2', cpu: 15, ram: 30, disk: 40, status: 'offline', os: 'CentOS 9', agent_version: '2.2.0', region: 'US-East', uptime: '-' },
]

export const demoKpis = {
  totalServers: 8,
  healthyServers: 6,
  warningServers: 1,
  criticalServers: 0,
  offlineServers: 1,
  activeAlerts: 3,
  avgCpu: 39.1,
  avgRam: 54.4,
  availability: 87.5,
}

export const demoMetrics = demoServers.filter(s => s.status !== 'offline').map(s => ({
  server_id: s.id,
  hostname: s.hostname,
  cpu: s.cpu,
  ram: s.ram,
  disk: s.disk,
  status: s.status,
  timestamp: new Date().toISOString(),
}))

export const demoHistorical = (() => {
  const data = []
  for (let i = 47; i >= 0; i--) {
    const t = new Date(Date.now() - i * 30 * 60000)
    data.push({
      timestamp: t.toISOString(),
      cpu: 35 + Math.sin(i * 0.3) * 15 + Math.random() * 8,
      ram: 50 + Math.cos(i * 0.2) * 10 + Math.random() * 5,
      disk: 45 + i * 0.1,
      server_id: 's1',
      hostname: 'prod-api-01',
    })
  }
  return data
})()

export const demoAuditLogs = [
  { id: 1, timestamp: '2024-03-11T14:32:05', user: 'admin@devsecops.com', action: 'LOGIN', resourceType: 'Auth System', resourceName: 'Auth System', ip: '192.168.1.100', status: 'success', details: 'Login exitoso via JWT' },
  { id: 2, timestamp: '2024-03-11T14:28:12', user: 'operator@devsecops.com', action: 'UPDATE', resourceType: 'Server Config', resourceName: 'Server Config', ip: '192.168.1.105', status: 'success', details: 'Actualizacion de parametros worker-03' },
  { id: 3, timestamp: '2024-03-11T14:15:44', user: 'admin@devsecops.com', action: 'DELETE', resourceType: 'Alert Rules', resourceName: 'Alert Rules', ip: '192.168.1.100', status: 'warning', details: 'Regla de alerta #45 eliminada' },
  { id: 4, timestamp: '2024-03-11T13:58:30', user: 'viewer@devsecops.com', action: 'READ', resourceType: 'Dashboard', resourceName: 'Dashboard', ip: '10.0.1.50', status: 'success', details: 'Acceso al dashboard principal' },
  { id: 5, timestamp: '2024-03-11T13:45:18', user: 'unknown@external.com', action: 'LOGIN', resourceType: 'Auth System', resourceName: 'Auth System', ip: '203.0.113.45', status: 'critical', details: 'Intento de login fallido (3 intentos)', errorMessage: 'Invalid credentials' },
  { id: 6, timestamp: '2024-03-11T13:30:00', user: 'admin@devsecops.com', action: 'CREATE', resourceType: 'User Account', resourceName: 'User Account', ip: '192.168.1.100', status: 'success', details: 'Nuevo usuario operator2 creado' },
  { id: 7, timestamp: '2024-03-11T13:15:22', user: 'system', action: 'UPDATE', resourceType: 'SSL Certs', resourceName: 'SSL Certs', ip: '10.0.0.1', status: 'success', details: 'Renovacion automatica de certificados' },
  { id: 8, timestamp: '2024-03-11T12:50:10', user: 'admin@devsecops.com', action: 'DEPLOY', resourceType: 'prod-api-01', resourceName: 'prod-api-01', ip: '192.168.1.100', status: 'success', details: 'Deploy v2.4.1 exitoso' },
  { id: 9, timestamp: '2024-03-11T12:30:00', user: 'system', action: 'BACKUP', resourceType: 'db-main', resourceName: 'db-main', ip: '10.0.0.1', status: 'success', details: 'Backup automatico 2.4GB completado' },
  { id: 10, timestamp: '2024-03-11T12:10:55', user: 'operator@devsecops.com', action: 'RESTART', resourceType: 'cache-redis', resourceName: 'cache-redis', ip: '192.168.1.105', status: 'success', details: 'Reinicio programado de cache' },
  { id: 11, timestamp: '2024-03-11T11:45:33', user: 'admin@devsecops.com', action: 'CONFIGURE', resourceType: 'Firewall', resourceName: 'Firewall', ip: '192.168.1.100', status: 'success', details: 'Nueva regla de firewall agregada' },
  { id: 12, timestamp: '2024-03-11T11:20:18', user: 'system', action: 'ALERT', resourceType: 'worker-03', resourceName: 'worker-03', ip: '10.0.0.1', status: 'warning', details: 'CPU alta detectada 87%' },
  { id: 13, timestamp: '2024-03-11T11:00:00', user: 'admin@devsecops.com', action: 'UPDATE', resourceType: 'Settings', resourceName: 'Settings', ip: '192.168.1.100', status: 'success', details: 'Intervalo de monitoreo actualizado a 10s' },
  { id: 14, timestamp: '2024-03-11T10:30:45', user: 'system', action: 'HEALTH', resourceType: 'All Servers', resourceName: 'All Servers', ip: '10.0.0.1', status: 'warning', details: 'monitor-01 no responde al heartbeat' },
  { id: 15, timestamp: '2024-03-11T10:00:00', user: 'admin@devsecops.com', action: 'LOGIN', resourceType: 'Auth System', resourceName: 'Auth System', ip: '192.168.1.100', status: 'success', details: 'Inicio de sesion matutino' },
]

export const demoThreats = [
  { id: 't1', type: 'Brute Force', severity: 'critical', sourceIp: '198.51.100.23', description: 'Multiples intentos de login fallidos detectados', status: 'blocked', attemptCount: 2847, detectedAt: '2024-03-11T14:30:00' },
  { id: 't2', type: 'Port Scan', severity: 'high', sourceIp: '203.0.113.45', description: 'Escaneo de puertos detectado en rango 1-65535', status: 'blocked', attemptCount: 1523, detectedAt: '2024-03-11T13:15:00' },
  { id: 't3', type: 'SQL Injection', severity: 'critical', sourceIp: '198.51.100.47', description: 'Intento de inyeccion SQL en endpoint /api/login', status: 'blocked', attemptCount: 156, detectedAt: '2024-03-11T12:45:00' },
  { id: 't4', type: 'DDoS', severity: 'medium', sourceIp: '192.0.2.100', description: 'Trafico anomalo detectado — posible DDoS L7', status: 'mitigated', attemptCount: 45200, detectedAt: '2024-03-11T11:30:00' },
  { id: 't5', type: 'XSS Attempt', severity: 'low', sourceIp: '203.0.113.12', description: 'Script inyectado en campo de comentarios', status: 'monitoring', attemptCount: 3, detectedAt: '2024-03-11T10:00:00' },
]

export const demoVulnerabilities = [
  { id: 'v1', cveId: 'CVE-2024-21762', componentName: 'OpenSSL', componentType: 'library', severity: 'critical', description: 'Heap buffer overflow en OpenSSL', cvssScore: 9.8, status: 'pending', detectedAt: '2024-03-10T08:00:00' },
  { id: 'v2', cveId: 'CVE-2024-3094', componentName: 'xz-utils', componentType: 'library', severity: 'critical', description: 'Backdoor en xz-utils 5.6.0/5.6.1', cvssScore: 10.0, status: 'patched', detectedAt: '2024-03-09T12:00:00', patchedAt: '2024-03-10T06:00:00' },
  { id: 'v3', cveId: 'CVE-2024-1086', componentName: 'Linux Kernel', componentType: 'os', severity: 'high', description: 'Use-after-free en nf_tables', cvssScore: 7.8, status: 'pending', detectedAt: '2024-03-08T10:00:00' },
  { id: 'v4', cveId: 'CVE-2023-44487', componentName: 'nginx', componentType: 'application', severity: 'medium', description: 'HTTP/2 Rapid Reset Attack', cvssScore: 5.3, status: 'monitoring', detectedAt: '2024-03-05T14:00:00' },
]

export const demoFirewallRules = [
  { id: 'f1', name: 'Block Known Attackers', description: 'Bloquear IPs de atacantes conocidos', protocol: 'ALL', sourceIpRange: '198.51.100.0/24', action: 'deny', priority: 10, enabled: true, hitCount: 15420, lastHitAt: '2024-03-11T14:30:00' },
  { id: 'f2', name: 'Allow Internal Traffic', description: 'Permitir trafico de red interna', protocol: 'ALL', sourceIpRange: '10.0.0.0/8', action: 'allow', priority: 20, enabled: true, hitCount: 1248500, lastHitAt: '2024-03-11T14:32:00' },
  { id: 'f3', name: 'Rate Limit API', description: 'Limitar peticiones API a 100/min', protocol: 'TCP', sourceIpRange: '0.0.0.0/0', action: 'rate_limit', priority: 50, enabled: true, hitCount: 892, lastHitAt: '2024-03-11T14:28:00' },
  { id: 'f4', name: 'Block TOR Exit Nodes', description: 'Bloquear nodos de salida TOR', protocol: 'ALL', sourceIpRange: 'tor-exit-nodes', action: 'deny', priority: 15, enabled: true, hitCount: 3200, lastHitAt: '2024-03-11T13:50:00' },
  { id: 'f5', name: 'Legacy SSH Access', description: 'Acceso SSH legacy (desactivado)', protocol: 'TCP', sourceIpRange: '0.0.0.0/0', action: 'allow', priority: 90, enabled: false, hitCount: 0, lastHitAt: null },
]

export const demoNotifications = [
  { id: 1, type: 'critical', title: 'Brute force detectado', desc: 'IP 198.51.100.23 bloqueada', time: '2m', read: false, timestamp: Date.now() - 120000 },
  { id: 2, type: 'warning', title: 'CPU alta en worker-03', desc: 'Uso sostenido al 87% por 5 min', time: '7m', read: false, timestamp: Date.now() - 420000 },
  { id: 3, type: 'success', title: 'Deploy exitoso prod-api-01', desc: 'Version v2.4.1 en produccion', time: '25m', read: true, timestamp: Date.now() - 1500000 },
  { id: 4, type: 'info', title: 'Backup completado', desc: 'db-main — 2.4 GB guardados', time: '1h', read: true, timestamp: Date.now() - 3600000 },
  { id: 5, type: 'warning', title: 'Certificado SSL proxima caducidad', desc: 'api-legacy caduca en 7 dias', time: '3h', read: true, timestamp: Date.now() - 10800000 },
]
