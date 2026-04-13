import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import KpiCard from '../components/KpiCard'
import MetricsChart from '../components/MetricsChart'
import GlassCard from '../components/GlassCard'
import StatusBadge from '../components/StatusBadge'
import metricsService from '../services/metricsService'
import reportsService from '../services/reportsService'
import { useToast } from '../hooks/useToast'
import Icon from '../components/icons/Icon'
import { StaggerContainer, StaggerItem } from '../components/animations/StaggerContainer'
import { KpiCardSkeleton, ChartSkeleton } from '../components/Skeleton'

const DashboardPage = () => {
  const { t } = useTranslation()
  const [timeRange, setTimeRange] = useState('1h')
  const [isExporting, setIsExporting] = useState(false)
  const { showError, showSuccess } = useToast()
  const queryClient = useQueryClient()

  // Métricas más recientes con polling cada 10s
  const { data: metricsRaw, isLoading: metricsLoading, isFetching: metricsFetching } = useQuery({
    queryKey: ['metrics-latest'],
    queryFn: () => metricsService.getLatest().then(r => r.data || []),
    refetchInterval: 10000,
    retry: 2,
    staleTime: 5000,
    onError: () => showError('Error al cargar métricas'),
  })

  // KPIs con polling cada 10s
  const { data: kpisRaw, isLoading: kpisLoading } = useQuery({
    queryKey: ['kpis'],
    queryFn: () => metricsService.getKpis().then(r => r.data),
    refetchInterval: 10000,
    retry: 2,
    staleTime: 5000,
    onError: () => showError('Error al cargar KPIs'),
  })

  // Servidores con polling cada 10s
  const { data: serversRaw, isLoading: serversLoading } = useQuery({
    queryKey: ['servers'],
    queryFn: () => metricsService.getServers().then(r => r.data?.data || r.data),
    refetchInterval: 10000,
    retry: 2,
    onError: () => showError('Error al cargar servidores'),
  })

  // Métricas históricas
  const { data: historicalRaw } = useQuery({
    queryKey: ['historical', timeRange],
    queryFn: () => metricsService.getHistorical(timeRange).then(r => r.data?.data || []),
    refetchInterval: 30000,
    retry: 2,
  })

  // Estructura Aislada: Acumulador de Telemetría (Live Chart Data)
  const [liveChartData, setLiveChartData] = useState([])
  const [hasSeededChart, setHasSeededChart] = useState(false)
  const [trackedServerId, setTrackedServerId] = useState(null)

  // Cuando cambie el filtro de rango en la UI (1h, 6h, etc), liberamos el candado para re-sembrar el Chart
  useEffect(() => {
    setHasSeededChart(false)
  }, [timeRange])

  // 1. Sembrado (Seed) Histórico inicial
  useEffect(() => {
    if (historicalRaw !== undefined && !hasSeededChart) {
      if (historicalRaw.length > 0) {
        // Aseguramos "anclar" el chart a este servidor para no sufrir efectos de ordenamiento (sorting) de la base de datos
        const primaryServerId = trackedServerId || historicalRaw[0]?.server_id
        if (primaryServerId) {
          setTrackedServerId(primaryServerId)
          const seedData = historicalRaw.filter(m => m.server_id === primaryServerId).reverse()
          setLiveChartData(seedData)
        }
      } else {
        setLiveChartData([])
      }
      setHasSeededChart(true)
    }
  }, [historicalRaw, hasSeededChart, trackedServerId])

  // 2. Ticker en Tiempo Real cada 10s
  useEffect(() => {
    if (metricsRaw && metricsRaw.length > 0 && hasSeededChart) {
      // Localizamos estrictamente la métrica nueva de NUESTRO servidor anclado
      const trackedMetric = trackedServerId 
        ? metricsRaw.find(m => m.server_id === trackedServerId)
        : metricsRaw[0]

      if (trackedMetric) {
        setLiveChartData(prev => {
          const last = prev[prev.length - 1]
          if (last && last.timestamp === trackedMetric.timestamp) return prev
          
          const newArr = [...prev, trackedMetric]
          if (newArr.length > 100) newArr.shift() // Limitar historial visual a 100 puntos
          return newArr
        })
      }
    }
  }, [metricsRaw, hasSeededChart, trackedServerId])

  const kpis = kpisRaw || {}
  const loading = metricsLoading && kpisLoading && serversLoading
  const isRefreshing = metricsFetching && !metricsLoading

  // Build server status from real data
  const serverStatus = useMemo(() => {
    if (Array.isArray(serversRaw)) {
      return {
        healthy: serversRaw.filter(s => s.status === 'healthy').length,
        warning: serversRaw.filter(s => s.status === 'warning').length,
        critical: serversRaw.filter(s => s.status === 'critical').length,
        offline: serversRaw.filter(s => s.status === 'offline').length,
        total: serversRaw.length,
      }
    }
    // If serversRaw is already an object with counts
    if (serversRaw && typeof serversRaw === 'object' && !Array.isArray(serversRaw)) {
      return {
        healthy: serversRaw.healthy || 0,
        warning: serversRaw.warning || 0,
        critical: serversRaw.critical || 0,
        offline: serversRaw.offline || 0,
        total: serversRaw.total || 0,
      }
    }
    return { healthy: 0, warning: 0, critical: 0, offline: 0, total: 0 }
  }, [serversRaw])


  const handleExport = async () => {
    setIsExporting(true)
    try {
      showSuccess('Creando reporte en AWS S3...')
      const result = await reportsService.exportServers()
      showSuccess('Reporte S3 listo. Descargando...')
      window.open(result.url, '_blank')
    } catch (error) {
      showError('Error exportando reporte a AWS S3')
    } finally {
      setIsExporting(false)
    }
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

  const isEmpty = serverStatus.total === 0

  return (
    <StaggerContainer className="space-y-5">
      {/* Header */}
      <StaggerItem>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-primary mb-0.5">
              {t('dashboard.title')}
            </h1>
            <p className="text-xs text-text-secondary flex items-center gap-2">
              <span>{t('dashboard.subtitle')}</span>
              <span className="text-text-muted">-</span>
              <span className="font-mono text-accent-cyan text-[10px]">{t('dashboard.version')}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Time range toggle */}
            <div className="flex items-center rounded-lg border border-white/[0.06] overflow-hidden">
              {['1h', '6h', '24h'].map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider transition-all ${timeRange === range
                    ? 'bg-accent-cyan/10 text-accent-cyan'
                    : 'text-text-muted hover:text-text-secondary'
                    }`}
                >
                  {range}
                </button>
              ))}
            </div>
            <motion.button
              onClick={handleExport}
              className="btn-primary flex items-center gap-2 text-xs px-3 py-1.5"
              style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#d8b4fe', borderColor: 'rgba(168, 85, 247, 0.3)' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isExporting || serverStatus.total === 0}
              title="Exportar a AWS S3"
            >
              <motion.div animate={isExporting ? { y: [-2, 2, -2] } : {}} transition={{ repeat: isExporting ? Infinity : 0, duration: 1 }}>
                <Icon name="download-cloud" size={13} />
              </motion.div>
              <span className="hidden sm:inline">{isExporting ? 'S3...' : t('common.export') + ' S3'}</span>
            </motion.button>
          </div>
        </div>
      </StaggerItem>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StaggerItem>
          <KpiCard
            title={t('dashboard.activeServers')}
            value={serverStatus.healthy}
            subtitle={`/ ${serverStatus.total}`}
            iconName="server"
            status="success"
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            title={t('dashboard.criticalAlerts')}
            value={serverStatus.critical}
            subtitle={t('security.activeOf') || "activas"}
            iconName="alert-triangle"
            status={serverStatus.critical > 0 ? 'danger' : 'normal'}
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            title={t('dashboard.globalUptime')}
            value={kpis.availability || (serverStatus.total > 0 ? Math.round((serverStatus.total - (serverStatus.offline || 0)) / serverStatus.total * 1000) / 10 : 0)}
            subtitle="%"
            iconName="activity"
            status="success"
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            title="CPU / RAM"
            value={kpis.avgCpu || 0}
            subtitle="%"
            iconName="zap"
            status={kpis.avgCpu > 80 ? 'warning' : 'normal'}
          />
        </StaggerItem>
      </div>

      {/* Empty state or Charts */}
      {isEmpty ? (
        <StaggerItem>
          <GlassCard padding="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent-cyan/5 border border-accent-cyan/10 flex items-center justify-center mb-5">
                <Icon name="terminal" size={28} className="text-accent-cyan/40" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Conecta tu Primer Servidor</h3>
              <p className="text-xs text-text-secondary max-w-sm mb-4">
                Instala el agente de HawkScope en tu servidor para comenzar a ver metricas en tiempo real.
              </p>
              <p className="text-[10px] text-text-muted">
                Ve a <Link to="/setup" className="text-accent-cyan font-medium hover:underline cursor-pointer">Configuración del Agente</Link> para obtener el comando de instalacion.
              </p>
            </div>
          </GlassCard>
        </StaggerItem>
      ) : (
        <>
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
                      <h3 className="text-sm font-semibold text-text-primary">{t('dashboard.systemPerformance')}</h3>
                      <p className="text-[10px] text-text-muted">{t('dashboard.lastHour')}</p>
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
                <MetricsChart data={liveChartData} loading={loading} />
              </GlassCard>
            </StaggerItem>

            {/* Server Status */}
            <StaggerItem>
              <GlassCard padding="p-5" className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-accent-purple/8 border border-accent-purple/10 flex items-center justify-center">
                      <Icon name="server" size={14} className="text-accent-purple" />
                    </div>
                    <h3 className="text-sm font-semibold text-text-primary">Servidores</h3>
                  </div>
                  <span className="text-[10px] text-text-muted font-mono">{serverStatus.total} nodos</span>
                </div>
                <div className="space-y-3 flex-1">
                  {[
                    { label: 'Healthy', value: serverStatus.healthy, color: 'text-status-healthy', bg: 'bg-status-healthy' },
                    { label: 'Warning', value: serverStatus.warning, color: 'text-status-warning', bg: 'bg-status-warning' },
                    { label: 'Critical', value: serverStatus.critical, color: 'text-status-critical', bg: 'bg-status-critical' },
                    { label: 'Offline', value: serverStatus.offline || 0, color: 'text-text-muted', bg: 'bg-text-muted' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.bg}`} />
                        <span className="text-xs text-text-secondary">{item.label}</span>
                      </div>
                      <span className={`text-sm font-mono font-semibold ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
                {/* Bar visualization */}
                {serverStatus.total > 0 && (
                  <div className="mt-4 h-2 rounded-full bg-surface-3 overflow-hidden flex">
                    <motion.div className="h-full bg-status-healthy" initial={{ width: 0 }} animate={{ width: `${(serverStatus.healthy / serverStatus.total) * 100}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
                    <motion.div className="h-full bg-status-warning" initial={{ width: 0 }} animate={{ width: `${(serverStatus.warning / serverStatus.total) * 100}%` }} transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }} />
                    <motion.div className="h-full bg-status-critical" initial={{ width: 0 }} animate={{ width: `${(serverStatus.critical / serverStatus.total) * 100}%` }} transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }} />
                  </div>
                )}
              </GlassCard>
            </StaggerItem>
          </div>
        </>
      )}

      {/* Bottom Status Bar */}
      <StaggerItem>
        <GlassCard padding="px-5 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <StatusBadge status="healthy" label="Sistema Operativo" size="xs" />
              <div className="flex items-center gap-2 text-[10px] text-text-secondary">
                <Icon name="server" size={11} />
                <span>Nodos: <span className="font-mono text-text-primary">{serverStatus.total}</span></span>
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

    </StaggerContainer>
  )
}

export default DashboardPage
