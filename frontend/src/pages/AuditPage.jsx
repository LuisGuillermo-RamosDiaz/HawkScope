import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import GlassCard from '../components/GlassCard'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import Icon from '../components/icons/Icon'
import { useToast } from '../hooks/useToast'
import { exportToCSV } from '../utils/exportUtils'
import { StaggerContainer, StaggerItem } from '../components/animations/StaggerContainer'

const mockAuditLogs = [
  { id: 1, timestamp: '2024-03-11 14:32:05', user: 'admin@devsecops.com', action: 'LOGIN', resource: 'Auth System', ip: '192.168.1.100', status: 'success', details: 'Login exitoso via JWT' },
  { id: 2, timestamp: '2024-03-11 14:28:12', user: 'operator@devsecops.com', action: 'UPDATE', resource: 'Server Config', ip: '192.168.1.105', status: 'success', details: 'Actualizacion de parametros worker-03' },
  { id: 3, timestamp: '2024-03-11 14:15:44', user: 'admin@devsecops.com', action: 'DELETE', resource: 'Alert Rules', ip: '192.168.1.100', status: 'warning', details: 'Regla de alerta #45 eliminada' },
  { id: 4, timestamp: '2024-03-11 13:58:30', user: 'viewer@devsecops.com', action: 'READ', resource: 'Dashboard', ip: '10.0.1.50', status: 'success', details: 'Acceso al dashboard principal' },
  { id: 5, timestamp: '2024-03-11 13:45:18', user: 'unknown@external.com', action: 'LOGIN', resource: 'Auth System', ip: '203.0.113.45', status: 'critical', details: 'Intento de login fallido (3 intentos)' },
  { id: 6, timestamp: '2024-03-11 13:30:00', user: 'admin@devsecops.com', action: 'CREATE', resource: 'User Account', ip: '192.168.1.100', status: 'success', details: 'Nuevo usuario operator2 creado' },
  { id: 7, timestamp: '2024-03-11 13:15:22', user: 'system', action: 'UPDATE', resource: 'SSL Certs', ip: '10.0.0.1', status: 'success', details: 'Renovacion automatica de certificados' },
  { id: 8, timestamp: '2024-03-11 12:58:11', user: 'operator@devsecops.com', action: 'DEPLOY', resource: 'prod-api-01', ip: '192.168.1.105', status: 'success', details: 'Deploy v2.4.1 completado' },
  { id: 9, timestamp: '2024-03-11 12:42:33', user: 'admin@devsecops.com', action: 'UPDATE', resource: 'Firewall Rules', ip: '192.168.1.100', status: 'warning', details: 'Regla de firewall modificada - Puerto 8080' },
  { id: 10, timestamp: '2024-03-11 12:30:00', user: 'system', action: 'BACKUP', resource: 'db-main', ip: '10.0.3.10', status: 'success', details: 'Backup completo realizado (2.4GB)' },
  { id: 11, timestamp: '2024-03-11 12:15:05', user: 'unknown@malicious.com', action: 'LOGIN', resource: 'Auth System', ip: '198.51.100.23', status: 'critical', details: 'Brute force detectado - IP bloqueada' },
  { id: 12, timestamp: '2024-03-11 12:00:00', user: 'system', action: 'HEALTH', resource: 'All Servers', ip: '10.0.0.1', status: 'success', details: 'Health check completado - 22/24 OK' },
  { id: 13, timestamp: '2024-03-11 11:45:30', user: 'operator@devsecops.com', action: 'RESTART', resource: 'cache-redis', ip: '192.168.1.105', status: 'success', details: 'Reinicio de servicio Redis' },
  { id: 14, timestamp: '2024-03-11 11:30:18', user: 'admin@devsecops.com', action: 'UPDATE', resource: 'RBAC Config', ip: '192.168.1.100', status: 'success', details: 'Permisos de role viewer actualizados' },
  { id: 15, timestamp: '2024-03-11 11:15:00', user: 'system', action: 'ALERT', resource: 'worker-03', ip: '10.0.2.20', status: 'warning', details: 'CPU > 85% durante 5 minutos' },
]

const actionColors = {
  LOGIN: 'text-accent-blue',
  UPDATE: 'text-accent-amber',
  DELETE: 'text-status-critical',
  CREATE: 'text-status-healthy',
  READ: 'text-text-secondary',
  DEPLOY: 'text-accent-purple',
  BACKUP: 'text-accent-cyan',
  HEALTH: 'text-accent-emerald',
  RESTART: 'text-accent-amber',
  ALERT: 'text-status-warning',
}

const actionIcons = {
  LOGIN: 'log-in',
  UPDATE: 'edit' in {} ? 'edit' : 'sliders',
  DELETE: 'x-circle',
  CREATE: 'plus',
  READ: 'eye',
  DEPLOY: 'upload',
  BACKUP: 'database',
  HEALTH: 'activity',
  RESTART: 'refresh-cw',
  ALERT: 'alert-triangle',
}

const AuditPage = () => {
  const { t } = useTranslation()
  const { showSuccess } = useToast()
  const [filterAction, setFilterAction] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredLogs = useMemo(() => {
    return mockAuditLogs.filter(log => {
      if (filterAction !== 'ALL' && log.action !== filterAction) return false
      if (filterStatus !== 'ALL' && log.status !== filterStatus) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return log.user.toLowerCase().includes(q) ||
               log.resource.toLowerCase().includes(q) ||
               log.details.toLowerCase().includes(q) ||
               log.ip.includes(q)
      }
      return true
    })
  }, [filterAction, filterStatus, searchQuery])

  const actionOptions = ['ALL', ...new Set(mockAuditLogs.map(l => l.action))]

  const stats = {
    total: mockAuditLogs.length,
    success: mockAuditLogs.filter(l => l.status === 'success').length,
    warning: mockAuditLogs.filter(l => l.status === 'warning').length,
    critical: mockAuditLogs.filter(l => l.status === 'critical').length,
  }

  const columns = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      cellClass: 'font-mono text-[11px] text-text-secondary whitespace-nowrap',
    },
    {
      key: 'user',
      label: 'Usuario',
      render: (val) => (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-surface-3 border border-white/[0.04] flex items-center justify-center text-[9px] font-bold text-accent-cyan">
            {val.charAt(0).toUpperCase()}
          </div>
          <span className="text-[11px] text-text-primary truncate max-w-[140px]">{val}</span>
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Accion',
      render: (val) => (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium ${actionColors[val] || 'text-text-secondary'} bg-white/[0.03]`}>
          {val}
        </span>
      ),
    },
    {
      key: 'resource',
      label: 'Recurso',
      cellClass: 'text-[11px] text-text-primary',
    },
    {
      key: 'ip',
      label: 'IP',
      cellClass: 'font-mono text-[10px] text-text-muted',
    },
    {
      key: 'status',
      label: 'Estado',
      render: (val) => (
        <StatusBadge
          status={val === 'success' ? 'healthy' : val === 'warning' ? 'warning' : 'critical'}
          label={val === 'success' ? 'OK' : val === 'warning' ? 'Warn' : 'Fail'}
          size="xs"
          pulse={val === 'critical'}
        />
      ),
    },
    {
      key: 'details',
      label: 'Detalles',
      cellClass: 'text-[10px] text-text-secondary max-w-[200px] truncate',
    },
  ]

  return (
    <StaggerContainer className="space-y-5">
      <StaggerItem>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-primary mb-0.5">Auditoria</h1>
            <p className="text-xs text-text-secondary">Registro de actividad y eventos de seguridad</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="btn-secondary flex items-center gap-2 text-xs px-3 py-1.5"
              onClick={() => {
                exportToCSV(filteredLogs.map(l => ({
                  timestamp: l.timestamp,
                  user: l.user,
                  action: l.action,
                  resource: l.resource,
                  ip: l.ip,
                  status: l.status,
                  details: l.details,
                })), 'hawkscope_audit')
                showSuccess(t('audit.exportSuccess'))
              }}
            >
              <Icon name="download" size={13} />
              <span>{t('audit.exportCSV')}</span>
            </button>
          </div>
        </div>
      </StaggerItem>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Eventos', value: stats.total, icon: 'clipboard-list', color: 'text-accent-cyan', bg: 'bg-accent-cyan/5', border: 'border-accent-cyan/10' },
          { label: 'Exitosos', value: stats.success, icon: 'check-circle', color: 'text-status-healthy', bg: 'bg-status-healthy/5', border: 'border-status-healthy/10' },
          { label: 'Advertencias', value: stats.warning, icon: 'alert-triangle', color: 'text-status-warning', bg: 'bg-status-warning/5', border: 'border-status-warning/10' },
          { label: 'Criticos', value: stats.critical, icon: 'shield-alert', color: 'text-status-critical', bg: 'bg-status-critical/5', border: 'border-status-critical/10' },
        ].map((stat) => (
          <StaggerItem key={stat.label}>
            <GlassCard padding="p-4" hover={false}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] text-text-muted uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold font-mono text-text-primary">{stat.value}</p>
                </div>
                <div className={`w-9 h-9 rounded-lg ${stat.bg} border ${stat.border} flex items-center justify-center`}>
                  <Icon name={stat.icon} size={16} className={stat.color} />
                </div>
              </div>
            </GlassCard>
          </StaggerItem>
        ))}
      </div>

      {/* Filters */}
      <StaggerItem>
        <GlassCard padding="p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Buscar por usuario, recurso, IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-9 py-2 text-xs"
              />
              <Icon name="search" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            </div>

            {/* Action filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-text-muted uppercase tracking-wider">Accion:</span>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="input-field py-1.5 px-2 text-xs w-auto min-w-[100px]"
              >
                {actionOptions.map(opt => (
                  <option key={opt} value={opt}>{opt === 'ALL' ? 'Todas' : opt}</option>
                ))}
              </select>
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-text-muted uppercase tracking-wider">Estado:</span>
              <div className="flex items-center rounded-lg border border-white/[0.06] overflow-hidden">
                {['ALL', 'success', 'warning', 'critical'].map(s => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-2.5 py-1.5 text-[10px] font-medium transition-all ${
                      filterStatus === s
                        ? 'bg-accent-cyan/10 text-accent-cyan'
                        : 'text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    {s === 'ALL' ? 'Todos' : s === 'success' ? 'OK' : s === 'warning' ? 'Warn' : 'Fail'}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-[10px] text-text-muted font-mono">
              {filteredLogs.length} registros
            </span>
          </div>
        </GlassCard>
      </StaggerItem>

      {/* Table */}
      <StaggerItem>
        <GlassCard padding="p-0">
          <DataTable
            columns={columns}
            data={filteredLogs}
            pageSize={10}
            emptyMessage="No se encontraron registros con los filtros seleccionados"
            emptyIcon="file-search"
          />
        </GlassCard>
      </StaggerItem>

      {/* Timeline - Recent Critical Events */}
      <StaggerItem>
        <GlassCard padding="p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-status-critical/8 border border-status-critical/10 flex items-center justify-center">
              <Icon name="shield-alert" size={14} className="text-status-critical" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Eventos Criticos Recientes</h3>
              <p className="text-[10px] text-text-muted">Requieren atencion inmediata</p>
            </div>
          </div>
          <div className="space-y-3">
            {mockAuditLogs.filter(l => l.status === 'critical').map((log, i) => (
              <motion.div
                key={log.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-status-critical/5 border border-status-critical/10"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-2 h-2 rounded-full bg-status-critical mt-1.5 flex-shrink-0 animate-threat-pulse" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-text-primary">{log.details}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-text-muted">
                    <span className="font-mono">{log.timestamp}</span>
                    <span>{log.user}</span>
                    <span className="font-mono">{log.ip}</span>
                  </div>
                </div>
                <button className="btn-ghost text-[10px] py-1 px-2 flex-shrink-0">
                  Investigar
                </button>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </StaggerItem>
    </StaggerContainer>
  )
}

export default AuditPage
