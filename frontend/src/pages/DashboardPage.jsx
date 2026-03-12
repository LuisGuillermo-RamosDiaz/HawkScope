import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import KpiCard from '../components/KpiCard'
import MetricsChart from '../components/MetricsChart'
import GlassCard from '../components/GlassCard'
import StatusBadge from '../components/StatusBadge'
import metricsService from '../services/metricsService'
import { useToast } from '../hooks/useToast'
import Icon from '../components/icons/Icon'
import { StaggerContainer, StaggerItem, LoadingAnimation } from '../components/animations/StaggerContainer'
import { KpiCardSkeleton, ChartSkeleton } from '../components/Skeleton'

const DashboardPage = () => {
  const [metrics, setMetrics] = useState([])
  const [kpis, setKpis] = useState(null)
  const [serverStatus, setServerStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
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

  // Mock recent events
  const recentEvents = [
    { id: 1, type: 'success', message: 'Deploy exitoso en prod-01', time: '2m', icon: 'check-circle' },
    { id: 2, type: 'warning', message: 'CPU alta en worker-03 (87%)', time: '5m', icon: 'alert-triangle' },
    { id: 3, type: 'info', message: 'Backup completado (db-main)', time: '12m', icon: 'database' },
    { id: 4, type: 'success', message: 'SSL renovado en api-gateway', time: '25m', icon: 'shield-check' },
    { id: 5, type: 'critical', message: 'Timeout en health-check srv-12', time: '30m', icon: 'x-circle' },
  ]

  const eventColors = {
    success: 'text-status-healthy',
    warning: 'text-status-warning',
    critical: 'text-status-critical',
    info: 'text-status-info',
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <KpiCardSkeleton key={i} />)}
        </div>
        <ChartSkeleton />
      </div>
    )
  }

  return (
    <StaggerContainer className="space-y-6">
      {/* Header */}
      <StaggerItem>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-1">
              Dashboard Principal
            </h1>
            <p className="text-sm text-text-secondary">
              Monitoreo en tiempo real — HawkScope SOC
            </p>
          </div>
          <motion.button
            onClick={() => fetchData(false)}
            className="btn-secondary flex items-center gap-2 text-xs"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isRefreshing}
          >
            <motion.div
              animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
              transition={{ repeat: isRefreshing ? Infinity : 0, duration: 1, ease: 'linear' }}
            >
              <Icon name="refresh-cw" size={14} />
            </motion.div>
            <span>{isRefreshing ? 'Actualizando...' : 'Actualizar'}</span>
          </motion.button>
        </div>
      </StaggerItem>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StaggerItem>
          <KpiCard
            title="Servidores Sanos"
            value={serverStatus?.healthy || 0}
            subtitle={`/ ${serverStatus?.total || 0}`}
            iconName="server"
            status="success"
            trend={2.5}
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            title="Servidores Críticos"
            value={serverStatus?.critical || 0}
            subtitle={`/ ${serverStatus?.total || 0}`}
            iconName="alert-triangle"
            status="danger"
            trend={-1.2}
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            title="Uptime"
            value={kpis?.uptime || 0}
            subtitle="%"
            iconName="activity"
            status="success"
            trend={0.1}
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            title="Alertas Activas"
            value={kpis?.alerts || 0}
            subtitle="totales"
            iconName="bell"
            status={kpis?.alerts > 3 ? 'warning' : 'normal'}
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
                <Icon name="activity" size={18} className="text-accent-cyan" />
                <h3 className="text-sm font-semibold text-text-primary">Rendimiento del Sistema</h3>
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

        {/* Recent Activity */}
        <StaggerItem>
          <GlassCard padding="p-5" className="h-full">
            <div className="flex items-center gap-2.5 mb-4">
              <Icon name="activity" size={18} className="text-accent-cyan" />
              <h3 className="text-sm font-semibold text-text-primary">Actividad Reciente</h3>
            </div>
            <div className="space-y-1">
              {recentEvents.map((event) => (
                <motion.div
                  key={event.id}
                  className="flex items-start gap-3 py-2.5 px-2 rounded-lg hover:bg-surface-3 transition-colors"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: event.id * 0.08 }}
                >
                  <Icon name={event.icon} size={15} className={`mt-0.5 flex-shrink-0 ${eventColors[event.type]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-primary leading-relaxed">{event.message}</p>
                    <p className="text-[10px] text-text-muted mt-0.5">hace {event.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </StaggerItem>
      </div>

      {/* Bottom Stats Bar */}
      <StaggerItem>
        <GlassCard padding="px-5 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <StatusBadge status="healthy" label="Sistema Operativo" size="xs" />
              </div>
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <Icon name="clock" size={12} />
                <span>Respuesta: <span className="font-mono text-accent-cyan">{kpis?.responseTime || 0}ms</span></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <Icon name="server" size={12} />
                <span>Nodos: <span className="font-mono text-text-primary">{serverStatus?.total || 0}</span></span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-accent-cyan"
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              <span>Auto-refresh cada 10s</span>
            </div>
          </div>
        </GlassCard>
      </StaggerItem>

      {/* Refresh indicator overlay */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            className="fixed bottom-6 right-6 glass-card px-4 py-2 glow-cyan flex items-center gap-2 z-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            >
              <Icon name="refresh-cw" size={13} className="text-accent-cyan" />
            </motion.div>
            <span className="text-xs text-accent-cyan font-medium">Syncing...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </StaggerContainer>
  )
}

export default DashboardPage
