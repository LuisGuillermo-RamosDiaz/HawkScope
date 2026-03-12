import { motion } from 'framer-motion'
import GlassCard from '../components/GlassCard'
import KpiCard from '../components/KpiCard'
import Icon from '../components/icons/Icon'
import { StaggerContainer, StaggerItem } from '../components/animations/StaggerContainer'
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Area, ComposedChart, Line } from 'recharts'

const trendData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, '0')}:00`,
  uptime: 99.5 + Math.random() * 0.5,
  responseTime: 80 + Math.floor(Math.random() * 80),
  throughput: 1200 + Math.floor(Math.random() * 600),
  errorRate: Math.random() * 0.05,
}))

const GaugeChart = ({ value, max = 100, label, color, unit = '%', size = 'md' }) => {
  const percentage = (value / max) * 100
  const radius = size === 'lg' ? 55 : 45
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference * 0.75
  const viewSize = size === 'lg' ? 130 : 110

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: viewSize, height: viewSize }}>
        <svg className="w-full h-full -rotate-[135deg]" viewBox={`0 0 ${viewSize + 10} ${viewSize + 10}`}>
          {/* Track */}
          <circle
            cx={(viewSize + 10) / 2}
            cy={(viewSize + 10) / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={size === 'lg' ? 8 : 6}
            strokeDasharray={circumference * 0.75}
            strokeLinecap="round"
          />
          {/* Value */}
          <motion.circle
            cx={(viewSize + 10) / 2}
            cy={(viewSize + 10) / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={size === 'lg' ? 8 : 6}
            strokeDasharray={circumference * 0.75}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference * 0.75 }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
            style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${size === 'lg' ? 'text-2xl' : 'text-lg'} font-bold font-mono text-text-primary`}>
            {typeof value === 'number' && value % 1 !== 0 ? value.toFixed(1) : value}
          </span>
          <span className="text-[10px] text-text-muted">{unit}</span>
        </div>
      </div>
      <span className="text-[10px] text-text-secondary mt-1 font-medium">{label}</span>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card px-3.5 py-3 glow-cyan" style={{ minWidth: 160 }}>
        <p className="text-[10px] font-medium text-text-secondary mb-2 uppercase tracking-widest">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-0.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color, boxShadow: `0 0 6px ${entry.color}` }} />
            <span className="text-[11px] text-text-primary font-mono">
              {entry.name}: <span className="font-semibold">{typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}</span>
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

const KPIsPage = () => {
  return (
    <StaggerContainer className="space-y-5">
      <StaggerItem>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-primary mb-0.5">KPIs Globales</h1>
            <p className="text-xs text-text-secondary">Indicadores clave de rendimiento del sistema</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-text-muted">
            <Icon name="clock" size={12} />
            <span className="font-mono">Ultima actualizacion: hace 10s</span>
          </div>
        </div>
      </StaggerItem>

      {/* Gauge Charts */}
      <StaggerItem>
        <GlassCard padding="p-6">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-7 h-7 rounded-lg bg-accent-cyan/8 border border-accent-cyan/10 flex items-center justify-center">
              <Icon name="activity" size={14} className="text-accent-cyan" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Metricas Principales</h3>
              <p className="text-[10px] text-text-muted">Resumen en tiempo real</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <GaugeChart value={99.9} label="Uptime" color="#10b981" />
            <GaugeChart value={120} max={500} label="Response Time" color="#00f0ff" unit="ms" />
            <GaugeChart value={1847} max={3000} label="Throughput" color="#a855f7" unit="req/s" />
            <GaugeChart value={92} label="Health Score" color="#10b981" />
          </div>
        </GlassCard>
      </StaggerItem>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StaggerItem>
          <KpiCard title="MTTR" value="4.2" subtitle="min" iconName="clock" status="success" trend={-12.5} />
        </StaggerItem>
        <StaggerItem>
          <KpiCard title="MTBF" value="720" subtitle="hrs" iconName="shield-check" status="success" trend={5.3} />
        </StaggerItem>
        <StaggerItem>
          <KpiCard title="Error Rate" value="0.02" subtitle="%" iconName="alert-circle" status="normal" trend={-8.0} />
        </StaggerItem>
        <StaggerItem>
          <KpiCard title="Deploys Exitosos" value="98.5" subtitle="%" iconName="check-circle" status="success" trend={2.1} />
        </StaggerItem>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Response Time Trend */}
        <StaggerItem>
          <GlassCard padding="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-accent-cyan/8 border border-accent-cyan/10 flex items-center justify-center">
                  <Icon name="line-chart" size={14} className="text-accent-cyan" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">Tiempo de Respuesta</h3>
                  <p className="text-[10px] text-text-muted">Ultimas 24 horas</p>
                </div>
              </div>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trendData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="respGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00f0ff" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#00f0ff" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fill: '#5a5e72', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} interval={3} />
                  <YAxis tick={{ fill: '#5a5e72', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}ms`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="responseTime" stroke="none" fill="url(#respGrad)" />
                  <Line type="monotone" dataKey="responseTime" name="Response" stroke="#00f0ff" strokeWidth={2} dot={false} activeDot={{ r: 3, fill: '#00f0ff', stroke: '#09090b', strokeWidth: 2 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </StaggerItem>

        {/* Throughput Trend */}
        <StaggerItem>
          <GlassCard padding="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-accent-purple/8 border border-accent-purple/10 flex items-center justify-center">
                  <Icon name="bar-chart" size={14} className="text-accent-purple" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">Throughput</h3>
                  <p className="text-[10px] text-text-muted">Solicitudes por segundo</p>
                </div>
              </div>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trendData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="thruGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fill: '#5a5e72', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} interval={3} />
                  <YAxis tick={{ fill: '#5a5e72', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="throughput" stroke="none" fill="url(#thruGrad)" />
                  <Line type="monotone" dataKey="throughput" name="Throughput" stroke="#a855f7" strokeWidth={2} dot={false} activeDot={{ r: 3, fill: '#a855f7', stroke: '#09090b', strokeWidth: 2 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </StaggerItem>
      </div>

      {/* SLA Compliance */}
      <StaggerItem>
        <GlassCard padding="p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-7 h-7 rounded-lg bg-accent-emerald/8 border border-accent-emerald/10 flex items-center justify-center">
              <Icon name="shield-check" size={14} className="text-accent-emerald" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Cumplimiento SLA</h3>
              <p className="text-[10px] text-text-muted">Acuerdos de nivel de servicio activos</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Disponibilidad', target: '99.9%', current: '99.95%', status: 'success', progress: 99.95 },
              { name: 'Tiempo de Respuesta', target: '< 200ms', current: '120ms', status: 'success', progress: 85 },
              { name: 'Tasa de Error', target: '< 0.1%', current: '0.02%', status: 'success', progress: 95 },
            ].map((sla) => (
              <div key={sla.name} className="p-4 rounded-lg bg-surface-2/50 border border-white/[0.03]">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-text-primary">{sla.name}</p>
                  <StatusBadge status={sla.status === 'success' ? 'healthy' : 'warning'} label={sla.status === 'success' ? 'OK' : 'At Risk'} size="xs" />
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-lg font-bold font-mono text-text-primary">{sla.current}</span>
                  <span className="text-[10px] text-text-muted">/ objetivo: {sla.target}</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-status-healthy"
                    initial={{ width: 0 }}
                    animate={{ width: `${sla.progress}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    style={{ boxShadow: '0 0 8px rgba(16, 185, 129, 0.3)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </StaggerItem>
    </StaggerContainer>
  )
}

export default KPIsPage
