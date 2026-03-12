import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import KpiCard from '../components/KpiCard'
import MetricsChart from '../components/MetricsChart'
import GlassCard from '../components/GlassCard'
import StatusBadge from '../components/StatusBadge'
import metricsService from '../services/metricsService'
import { useToast } from '../hooks/useToast'
import Icon from '../components/icons/Icon'
import { StaggerContainer, StaggerItem } from '../components/animations/StaggerContainer'
import { KpiCardSkeleton, ChartSkeleton } from '../components/Skeleton'

const DashboardPage = () => {
  const [metrics, setMetrics] = useState([])
  const [kpis, setKpis] = useState(null)
  const [serverStatus, setServerStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState('1h')
  const { showError, showSuccess } = useToast()

  const generateMockMetrics = () => {
    const data = []
    for (let i = 0; i < 30; i++) {
      data.push({
        cpu: Math.floor(Math.random() * 40) + 30,
        ram: Math.floor(Math.random() * 30) + 40,
      })
    }
    return data
  }

  const generateMockKpis = () => ({
    totalServers: 24,
    healthyServers: 22,
    criticalServers: 2,
    uptime: 99.9,
    alerts: 5,
    responseTime: 120,
  })

  const generateMockServerStatus = () => ({
    healthy: 22,
    warning: 2,
    critical: 0,
    total: 24,
  })

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setIsRefreshing(true)

    try {
      const [metricsData, kpisData, serverData] = await Promise.allSettled([
        metricsService.getLatest(),
        metricsService.getKpis(),
        metricsService.getServerStatus(),
      ])

      setMetrics(metricsData.status === 'fulfilled' ? metricsData.value.data || [] : generateMockMetrics())
      setKpis(kpisData.status === 'fulfilled' ? kpisData.value : generateMockKpis())
      setServerStatus(serverData.status === 'fulfilled' ? serverData.value : generateMockServerStatus())

      if (!silent) showSuccess('Dashboard actualizado')
    } catch (_error) {
      showError('Error al cargar datos del dashboard')
      setMetrics(generateMockMetrics())
      setKpis(generateMockKpis())
      setServerStatus(generateMockServerStatus())
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [showError, showSuccess])

  useEffect(() => {
    fetchData(false)
    const interval = setInterval(() => fetchData(true), 10000)
    return () => clearInterval(interval)
  }, [fetchData])

  const recentEvents = [
    { id: 1, type: 'success', message: 'Deploy exitoso en prod-01', time: '2m', icon: 'check-circle' },
    { id: 2, type: 'warning', message: 'CPU alta en worker-03 (87%)', time: '5m', icon: 'alert-triangle' },
    { id: 3, type: 'info', message: 'Backup completado (db-main)', time: '12m', icon: 'database' },
    { id: 4, type: 'success', message: 'SSL renovado en api-gateway', time: '25m', icon: 'shield-check' },
    { id: 5, type: 'critical', message: 'Timeout en health-check srv-12', time: '30m', icon: 'x-circle' },
    { id: 6, type: 'info', message: 'Escalado automatico activado', time: '45m', icon: 'zap' },
  ]

  const eventColors = {
    success: 'text-status-healthy',
    warning: 'text-status-warning',
    critical: 'text-status-critical',
    info: 'text-accent-blue',
  }

  const eventBg = {
    success: 'bg-status-healthy/5',
    warning: 'bg-status-warning/5',
    critical: 'bg-status-critical/5',
    info: 'bg-accent-blue/5',
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <KpiCardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2"><ChartSkeleton /></div>
          <ChartSkeleton />
        </div>
      </div>
    )
  }

  return (
    <StaggerContainer className="space-y-5">
      {/* Header */}
      <StaggerItem>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-primary mb-0.5">
              Command Center
            </h1>
            <p className="text-xs text-text-secondary flex items-center gap-2">
              <span>Monitoreo en tiempo real</span>
              <span className="text-text-muted">-</span>
              <span className="font-mono text-accent-cyan text-[10px]">HawkScope SOC v2.0</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Time range toggle */}
            <div className="flex items-center rounded-lg border border-white/[0.06] overflow-hidden">
              {['1h', '6h', '24h'].map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider transition-all ${
                    timeRange === range
                      ? 'bg-accent-cyan/10 text-accent-cyan'
                      : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            <motion.button
              onClick={() => fetchData(false)}
              className="btn-secondary flex items-center gap-2 text-xs px-3 py-1.5"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isRefreshing}
            >
              <motion.div
                animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
                transition={{ repeat: isRefreshing ? Infinity : 0, duration: 1, ease: 'linear' }}
              >
                <Icon name="refresh-cw" size={13} />
              </motion.div>
              <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
            </motion.button>
          </div>
        </div>
      </StaggerItem>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StaggerItem>
          <KpiCard
            title="Servidores Activos"
            value={serverStatus?.healthy || 0}
            subtitle={`/ ${serverStatus?.total || 0}`}
            iconName="server"
            status="success"
            trend={2.5}
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            title="Alertas Criticas"
            value={serverStatus?.critical || 0}
            subtitle="activas"
            iconName="alert-triangle"
            status={serverStatus?.critical > 0 ? 'danger' : 'normal'}
            trend={-1.2}
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            title="Uptime Global"
            value={kpis?.uptime || 0}
            subtitle="%"
            iconName="activity"
            status="success"
            trend={0.1}
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            title="Tiempo Respuesta"
            value={kpis?.responseTime || 0}
            subtitle="ms"
            iconName="zap"
            status={kpis?.responseTime > 200 ? 'warning' : 'normal'}
            trend={-3.8}
          />
        </StaggerItem>
      </div>

      {/* Charts + Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Chart */}
        <StaggerItem className="lg:col-span-2">
          <GlassCard padding="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-accent-cyan/8 border border-accent-cyan/10 flex items-center justify-center">
                  <Icon name="activity" size={14} className="text-accent-cyan" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">Rendimiento del Sistema</h3>
                  <p className="text-[10px] text-text-muted">Ultima hora - auto-refresh 10s</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-accent-cyan" style={{ boxShadow: '0 0 6px rgba(0,240,255,0.6)' }} />
                  <span className="text-text-secondary">CPU</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-accent-purple" style={{ boxShadow: '0 0 6px rgba(168,85,247,0.6)' }} />
                  <span className="text-text-secondary">RAM</span>
                </div>
              </div>
            </div>
            <MetricsChart data={metrics} loading={loading} />
          </GlassCard>
        </StaggerItem>

        {/* Activity Feed */}
        <StaggerItem>
          <GlassCard padding="p-5" className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-accent-purple/8 border border-accent-purple/10 flex items-center justify-center">
                  <Icon name="activity" size={14} className="text-accent-purple" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary">Actividad</h3>
              </div>
              <span className="text-[10px] text-text-muted font-mono">{recentEvents.length} eventos</span>
            </div>
            <div className="space-y-0.5 flex-1 overflow-auto">
              {recentEvents.map((event, i) => (
                <motion.div
                  key={event.id}
                  className={`flex items-start gap-3 py-2.5 px-2.5 rounded-lg ${eventBg[event.type]} hover:bg-surface-3 transition-colors cursor-default`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <div className={`mt-0.5 w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${eventBg[event.type]}`}>
                    <Icon name={event.icon} size={13} className={eventColors[event.type]} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-text-primary leading-relaxed">{event.message}</p>
                    <p className="text-[9px] text-text-muted mt-0.5 font-mono">hace {event.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </StaggerItem>
      </div>

      {/* Server Overview + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Server distribution */}
        <StaggerItem className="lg:col-span-2">
          <GlassCard padding="p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-accent-emerald/8 border border-accent-emerald/10 flex items-center justify-center">
                <Icon name="server" size={14} className="text-accent-emerald" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary">Distribucion de Nodos</h3>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Healthy', value: serverStatus?.healthy || 0, color: 'bg-status-healthy', glow: 'rgba(16,185,129,0.5)' },
                { label: 'Warning', value: serverStatus?.warning || 0, color: 'bg-status-warning', glow: 'rgba(245,158,11,0.5)' },
                { label: 'Critical', value: serverStatus?.critical || 0, color: 'bg-status-critical', glow: 'rgba(239,68,68,0.5)' },
                { label: 'Total', value: serverStatus?.total || 0, color: 'bg-accent-cyan', glow: 'rgba(0,240,255,0.5)' },
              ].map((item) => (
                <div key={item.label} className="text-center p-3 rounded-lg bg-surface-2/50 border border-white/[0.03]">
                  <div className="flex justify-center mb-2">
                    <motion.div
                      className={`w-2.5 h-2.5 rounded-full ${item.color}`}
                      style={{ boxShadow: `0 0 8px ${item.glow}` }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2, delay: Math.random() }}
                    />
                  </div>
                  <p className="text-lg font-bold font-mono text-text-primary">{item.value}</p>
                  <p className="text-[9px] text-text-muted uppercase tracking-wider mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
            {/* Bar visualization */}
            <div className="mt-4 h-2 rounded-full bg-surface-3 overflow-hidden flex">
              {serverStatus && (
                <>
                  <motion.div
                    className="h-full bg-status-healthy"
                    initial={{ width: 0 }}
                    animate={{ width: `${(serverStatus.healthy / serverStatus.total) * 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                  <motion.div
                    className="h-full bg-status-warning"
                    initial={{ width: 0 }}
                    animate={{ width: `${(serverStatus.warning / serverStatus.total) * 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                  />
                  <motion.div
                    className="h-full bg-status-critical"
                    initial={{ width: 0 }}
                    animate={{ width: `${(serverStatus.critical / serverStatus.total) * 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
                  />
                </>
              )}
            </div>
          </GlassCard>
        </StaggerItem>

        {/* Quick Stats */}
        <StaggerItem>
          <GlassCard padding="p-5" className="h-full">
            <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Icon name="zap" size={14} className="text-accent-amber" />
              Quick Stats
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Alertas Activas', value: kpis?.alerts || 0, icon: 'bell', color: 'text-status-warning' },
                { label: 'Resp. Promedio', value: `${kpis?.responseTime || 0}ms`, icon: 'clock', color: 'text-accent-cyan' },
                { label: 'Uptime', value: `${kpis?.uptime || 0}%`, icon: 'activity', color: 'text-status-healthy' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0">
                  <div className="flex items-center gap-2">
                    <Icon name={stat.icon} size={13} className={stat.color} />
                    <span className="text-xs text-text-secondary">{stat.label}</span>
                  </div>
                  <span className="text-sm font-mono font-semibold text-text-primary">{stat.value}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </StaggerItem>

        {/* Threat Level */}
        <StaggerItem>
          <GlassCard padding="p-5" className="h-full flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-1 flex items-center gap-2">
                <Icon name="shield" size={14} className="text-accent-cyan" />
                Nivel de Amenaza
              </h3>
              <p className="text-[10px] text-text-muted mb-4">Evaluacion actual del SOC</p>
            </div>
            <div className="flex flex-col items-center py-2">
              <motion.div
                className="relative w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
                  border: '2px solid rgba(16, 185, 129, 0.3)',
                }}
                animate={{
                  boxShadow: ['0 0 20px rgba(16,185,129,0.1)', '0 0 40px rgba(16,185,129,0.2)', '0 0 20px rgba(16,185,129,0.1)'],
                }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                <div className="text-center">
                  <p className="text-lg font-bold text-status-healthy font-mono">LOW</p>
                </div>
              </motion.div>
            </div>
            <div className="flex items-center justify-center gap-1 mt-2">
              {['bg-status-healthy', 'bg-status-healthy', 'bg-surface-4', 'bg-surface-4', 'bg-surface-4'].map((color, i) => (
                <div key={i} className={`w-6 h-1.5 rounded-full ${color} transition-all`} />
              ))}
            </div>
          </GlassCard>
        </StaggerItem>
      </div>

      {/* Bottom Status Bar */}
      <StaggerItem>
        <GlassCard padding="px-5 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <StatusBadge status="healthy" label="Sistema Operativo" size="xs" />
              <div className="flex items-center gap-2 text-[10px] text-text-secondary">
                <Icon name="clock" size={11} />
                <span>Respuesta: <span className="font-mono text-accent-cyan">{kpis?.responseTime || 0}ms</span></span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-text-secondary hidden md:flex">
                <Icon name="server" size={11} />
                <span>Nodos: <span className="font-mono text-text-primary">{serverStatus?.total || 0}</span></span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-text-muted">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-accent-cyan"
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              <span className="font-mono">Auto-sync 10s</span>
            </div>
          </div>
        </GlassCard>
      </StaggerItem>

      {/* Refresh indicator */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            className="fixed bottom-6 right-6 glass-card px-4 py-2 glow-cyan flex items-center gap-2 z-50"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
            >
              <Icon name="refresh-cw" size={12} className="text-accent-cyan" />
            </motion.div>
            <span className="text-[10px] text-accent-cyan font-medium font-mono">Syncing...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </StaggerContainer>
  )
}

export default DashboardPage
