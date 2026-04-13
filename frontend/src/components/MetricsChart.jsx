import { motion } from 'framer-motion'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart, Line } from 'recharts'
import Icon from './icons/Icon'
import { LoadingAnimation } from './animations/StaggerContainer'

const MetricsChart = ({ data = [], loading = false, className = '' }) => {
  const chartData = data.map((item, index) => {
    const d = item.timestamp ? new Date(item.timestamp) : null;
    const timeStr = d 
      ? `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
      : `${index}s`;
    
    return {
      time: index % 5 === 0 ? timeStr : '',
      cpu: Math.round(item.cpu || 0),
      ram: Math.round(item.ram || 0),
    }
  })

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card px-3.5 py-3 glow-cyan" style={{ minWidth: 150 }}>
          <p className="text-[10px] font-medium text-text-secondary mb-2 uppercase tracking-widest">
            Tiempo: {label}
          </p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2.5 mb-0.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color, boxShadow: `0 0 8px ${entry.color}` }}
              />
              <span className="text-xs text-text-primary font-mono">
                {entry.name}: <span className="font-semibold">{entry.value}%</span>
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
      <div className={`h-72 rounded-xl flex flex-col items-center justify-center gap-3 ${className}`} style={{ background: 'var(--color-surface-2)' }}>
        <div className="w-12 h-12 rounded-xl bg-surface-3 flex items-center justify-center">
          <Icon name="bar-chart" size={24} className="text-text-muted" />
        </div>
        <p className="text-text-secondary text-sm">No hay datos disponibles</p>
      </div>
    )
  }

  return (
    <motion.div
      className={`h-72 rounded-xl overflow-hidden ${className}`}
      style={{ background: 'var(--color-surface-2)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 16, right: 16, left: -10, bottom: 4 }}>
          <defs>
            <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#00f0ff" stopOpacity={0.01} />
            </linearGradient>
            <linearGradient id="ramGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#a855f7" stopOpacity={0.01} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.03)"
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

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0, 240, 255, 0.1)', strokeWidth: 1 }} />

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
