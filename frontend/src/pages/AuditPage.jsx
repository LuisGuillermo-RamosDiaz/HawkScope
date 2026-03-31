import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import GlassCard from '../components/GlassCard'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import Icon from '../components/icons/Icon'
import { useToast } from '../hooks/useToast'
import { exportToCSV } from '../utils/exportUtils'
import { StaggerContainer, StaggerItem } from '../components/animations/StaggerContainer'
import auditService from '../services/auditService'

const actionColors = {
  LOGIN: 'text-accent-blue',
  LOGOUT: 'text-accent-blue',
  UPDATE: 'text-accent-amber',
  DELETE: 'text-status-critical',
  CREATE: 'text-status-healthy',
  READ: 'text-text-secondary',
  DEPLOY: 'text-accent-purple',
  BACKUP: 'text-accent-cyan',
  HEALTH: 'text-accent-emerald',
  RESTART: 'text-accent-amber',
  ALERT: 'text-status-warning',
  CONFIGURE: 'text-accent-amber',
}

const AuditPage = () => {
  const { t } = useTranslation()
  const { showSuccess } = useToast()
  const [filterAction, setFilterAction] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: logsRaw, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => auditService.getLogs().then(r => r.data || []),
    refetchInterval: 30000,
    retry: 2,
  })

  const logs = Array.isArray(logsRaw) ? logsRaw : []

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (filterAction !== 'ALL' && log.action !== filterAction) return false
      if (filterStatus !== 'ALL' && log.status !== filterStatus) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (log.user || '').toLowerCase().includes(q) ||
               (log.resourceType || '').toLowerCase().includes(q) ||
               (log.resourceName || '').toLowerCase().includes(q) ||
               (log.details || '').toLowerCase().includes(q) ||
               (log.ip || '').includes(q)
      }
      return true
    })
  }, [logs, filterAction, filterStatus, searchQuery])

  const actionOptions = ['ALL', ...new Set(logs.map(l => l.action))]

  const stats = {
    total: logs.length,
    success: logs.filter(l => l.status === 'success').length,
    warning: logs.filter(l => l.status === 'warning').length,
    critical: logs.filter(l => l.status === 'critical' || l.status === 'failure').length,
  }

  const columns = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      cellClass: 'font-mono text-[11px] text-text-secondary whitespace-nowrap',
      render: (val) => val ? new Date(val).toLocaleString('es-MX') : '-',
    },
    {
      key: 'user',
      label: 'Usuario',
      render: (val) => (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-surface-3 border border-white/[0.04] flex items-center justify-center text-[9px] font-bold text-accent-cyan">
            {(val || 'S').charAt(0).toUpperCase()}
          </div>
          <span className="text-[11px] text-text-primary truncate max-w-[140px]">{val || 'system'}</span>
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
      key: 'resourceType',
      label: 'Recurso',
      cellClass: 'text-[11px] text-text-primary',
      render: (val, row) => row.resourceName || val || '-',
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
          pulse={val === 'critical' || val === 'failure'}
        />
      ),
    },
    {
      key: 'details',
      label: 'Detalles',
      cellClass: 'text-[10px] text-text-secondary min-w-[300px] max-w-[400px]',
      render: (val) => {
        if (!val) return '-';
        try {
          const parsed = typeof val === 'string' && val.startsWith('{') ? JSON.parse(val) : val;
          const message = parsed.message || (typeof parsed === 'string' ? parsed : JSON.stringify(parsed));
          return (
            <div className="line-clamp-2 leading-relaxed" title={message}>
              {message}
            </div>
          );
        } catch (e) {
          return <div className="line-clamp-1" title={val}>{val}</div>;
        }
      },
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
              disabled={logs.length === 0}
              onClick={() => {
                exportToCSV(filteredLogs.map(l => ({
                  timestamp: l.timestamp,
                  user: l.user,
                  action: l.action,
                  resource: l.resourceName || l.resourceType,
                  ip: l.ip,
                  status: l.status,
                  details: typeof l.details === 'string' ? l.details : JSON.stringify(l.details),
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

      {/* Empty state */}
      {logs.length === 0 && !isLoading ? (
        <StaggerItem>
          <GlassCard padding="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent-cyan/5 border border-accent-cyan/10 flex items-center justify-center mb-5">
                <Icon name="clipboard-list" size={28} className="text-accent-cyan/40" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Sin Registros de Auditoria</h3>
              <p className="text-xs text-text-secondary max-w-sm">
                Los eventos de auditoria se registraran automaticamente conforme los usuarios y sistemas interactuen con la plataforma.
              </p>
            </div>
          </GlassCard>
        </StaggerItem>
      ) : (
        <>
          {/* Filters */}
          <StaggerItem>
            <GlassCard padding="p-4">
              <div className="flex flex-wrap items-center gap-3">
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

          {/* Critical Events */}
          {logs.filter(l => l.status === 'critical' || l.status === 'failure').length > 0 && (
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
                  {logs.filter(l => l.status === 'critical' || l.status === 'failure').slice(0, 5).map((log, i) => (
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
                          <span className="text-xs font-medium text-text-primary">{log.errorMessage || log.details || log.action}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-text-muted">
                          <span className="font-mono">{log.timestamp ? new Date(log.timestamp).toLocaleString('es-MX') : '-'}</span>
                          <span>{log.user}</span>
                          <span className="font-mono">{log.ip}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            </StaggerItem>
          )}
        </>
      )}
    </StaggerContainer>
  )
}

export default AuditPage
