import { motion } from 'framer-motion'
import GlassCard from '../components/GlassCard'
import KpiCard from '../components/KpiCard'
import Icon from '../components/icons/Icon'
import { StaggerContainer, StaggerItem } from '../components/animations/StaggerContainer'
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Area, ComposedChart } from 'recharts'

// Mock trend data (24h)
const trendData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, '0')}:00`,
  uptime: 99.5 + Math.random() * 0.5,
  responseTime: 80 + Math.floor(Math.random() * 80),
  throughput: 1200 + Math.floor(Math.random() * 600),
}))

const GaugeChart = ({ value, max = 100, label, color, unit = '%' }) => {
  const percentage = (value / max) * 100
  const radius = 50
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference * 0.75

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-[135deg]" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--color-surface-3)" strokeWidth="8" strokeDasharray={circumference * 0.75} strokeLinecap="round" />
          <motion.circle
            cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circumference * 0.75}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference * 0.75 }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold font-mono text-text-primary">{value}{unit}</span>
        </div>
      </div>
      <span className="text-xs text-text-secondary mt-1">{label}</span>
    </div>
  )
}

const KPIsPage = () => {
  return (
    <StaggerContainer className="space-y-6">
      <StaggerItem>
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">KPIs Globales</h1>
          <p className="text-sm text-text-secondary">Indicadores clave de rendimiento del sistema</p>
        </div>
      </StaggerItem>

      {/* Gauge Charts */}
      <StaggerItem>
        <GlassCard padding="p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-6 flex items-center gap-2">
            <Icon name="activity" size={16} className="text-accent-cyan" />
            Métricas Principales
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <GaugeChart value={99.9} label="Uptime" color="#10b981" />
            <GaugeChart value={120} max={500} label="Response Time" color="#00f0ff" unit="ms" />
            <GaugeChart value={1847} max={3000} label="Throughput" color="#a855f7" unit="" />
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

      {/* Trend Chart */}
      <StaggerItem>
        <GlassCard padding="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Icon name="line-chart" size={16} className="text-accent-cyan" />
              Tendencia 24h — Tiempo de Respuesta
            </h3>
            <span className="text-xs text-text-muted font-mono">Últimas 24 horas</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="respGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00f0ff" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#00f0ff" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="hour" tick={{ fill: '#5a5e72', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5a5e72', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}ms`} />
                <Tooltip
                  contentStyle={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 8, fontSize: 12, backdropFilter: 'blur(16px)' }}
                  labelStyle={{ color: '#8b8fa3' }}
                  itemStyle={{ color: '#f0f0f5' }}
                />
                <Area type="monotone" dataKey="responseTime" stroke="none" fill="url(#respGrad)" />
                <Line type="monotone" dataKey="responseTime" stroke="#00f0ff" strokeWidth={2} dot={false} activeDot={{ r: 3, fill: '#00f0ff', stroke: '#09090b', strokeWidth: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </StaggerItem>
    </StaggerContainer>
  )
}

export default KPIsPage
