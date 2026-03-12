import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart } from 'recharts'
import Icon from './icons/Icon'
import { LoadingAnimation } from './animations/StaggerContainer'

const MetricsChart = ({ data = [], loading = false, className = '' }) => {
  const chartData = data.map((item, index) => ({
    time: index % 5 === 0 ? `${index}s` : '',
    cpu: item.cpu || 0,
    ram: item.ram || 0,
  }))

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card px-3 py-2.5 glow-cyan" style={{ minWidth: 140 }}>
          <p className="text-[10px] font-medium text-text-secondary mb-1.5 uppercase tracking-wider">
            Tiempo: {label}
          </p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 mb-0.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color, boxShadow: `0 0 6px ${entry.color}` }} />
              <span className="text-xs text-text-primary font-mono">
                {entry.name}: {entry.value}%
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className={`h-72 rounded-xl flex items-center justify-center ${className}`} style={{ background: 'var(--color-surface-2)' }}>
        <LoadingAnimation size={40} />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className={`h-72 rounded-xl flex flex-col items-center justify-center ${className}`} style={{ background: 'var(--color-surface-2)' }}>
        <Icon name="bar-chart" size={40} className="text-text-muted mb-3" />
        <p className="text-text-secondary text-sm">No hay datos disponibles</p>
      </div>
    )
  }

  return (
    <motion.div
      className={`h-72 rounded-xl p-1 ${className}`}
      style={{ background: 'var(--color-surface-2)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#00f0ff" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="ramGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#a855f7" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
            vertical={false}
          />

          <XAxis
            dataKey="time"
            stroke="transparent"
            tick={{ fill: '#5a5e72', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            stroke="transparent"
            tick={{ fill: '#5a5e72', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
          />

          <Tooltip content={<CustomTooltip />} />

          <Area type="monotone" dataKey="cpu" stroke="none" fill="url(#cpuGrad)" fillOpacity={1} />
          <Area type="monotone" dataKey="ram" stroke="none" fill="url(#ramGrad)" fillOpacity={1} />

          <Line
            type="monotone"
            dataKey="cpu"
            stroke="#00f0ff"
            strokeWidth={2}
            name="CPU"
            dot={false}
            activeDot={{ r: 4, fill: '#00f0ff', stroke: '#09090b', strokeWidth: 2 }}
            animationDuration={1500}
          />

          <Line
            type="monotone"
            dataKey="ram"
            stroke="#a855f7"
            strokeWidth={2}
            name="RAM"
            dot={false}
            activeDot={{ r: 4, fill: '#a855f7', stroke: '#09090b', strokeWidth: 2 }}
            animationDuration={1500}
            animationBegin={300}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

export default MetricsChart
