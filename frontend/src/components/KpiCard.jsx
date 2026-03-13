import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import Icon from './icons/Icon'

const statusColors = {
  success: {
    glow: 'glow-emerald',
    icon: 'bg-status-healthy/10 border-status-healthy/20 text-status-healthy',
    bar: 'bg-status-healthy',
    accent: '#10b981',
  },
  warning: {
    glow: 'glow-amber',
    icon: 'bg-status-warning/10 border-status-warning/20 text-status-warning',
    bar: 'bg-status-warning',
    accent: '#f59e0b',
  },
  danger: {
    glow: 'glow-red',
    icon: 'bg-status-critical/10 border-status-critical/20 text-status-critical',
    bar: 'bg-status-critical',
    accent: '#ef4444',
  },
  normal: {
    glow: 'glow-cyan',
    icon: 'bg-accent-cyan/10 border-accent-cyan/20 text-accent-cyan',
    bar: 'bg-accent-cyan',
    accent: '#00f0ff',
  },
}

const AnimatedNumber = ({ value, duration = 1.2 }) => {
  const [display, setDisplay] = useState(0)
  const numValue = parseFloat(value)
  const isNumber = !isNaN(numValue)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!isNumber) return
    const start = performance.now()
    const from = 0
    const to = numValue

    const animate = (now) => {
      const elapsed = (now - start) / (duration * 1000)
      if (elapsed >= 1) {
        setDisplay(to)
        return
      }
      const eased = 1 - Math.pow(1 - elapsed, 3)
      setDisplay(from + (to - from) * eased)
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [numValue, duration, isNumber])

  if (!isNumber) return value

  const hasDecimal = String(value).includes('.')
  const decimals = hasDecimal ? (String(value).split('.')[1]?.length || 1) : 0
  return decimals > 0 ? display.toFixed(decimals) : Math.round(display)
}

const KpiCard = ({
  title,
  value,
  subtitle,
  iconName,
  trend = null,
  status = 'normal',
  onClick = null,
  className = '',
}) => {
  const colors = statusColors[status] || statusColors.normal

  return (
    <motion.div
      className={`glass-card p-5 relative overflow-hidden group ${colors.glow} ${className}`}
      whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Ambient glow */}
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"
        style={{ background: colors.accent }}
      />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-text-secondary mb-3 uppercase tracking-widest">
            {title}
          </p>

          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-2xl font-bold text-text-primary font-mono tracking-tight">
              <AnimatedNumber value={value} />
            </span>
            {subtitle && (
              <span className="text-sm text-text-secondary font-light">{subtitle}</span>
            )}
          </div>

          {trend !== null && (
            <div className={`flex items-center gap-1.5 ${trend > 0 ? 'text-status-healthy' : trend < 0 ? 'text-status-critical' : 'text-text-secondary'}`}>
              <Icon
                name={trend > 0 ? 'trending-up' : trend < 0 ? 'trending-down' : 'minus'}
                size={13}
              />
              <span className="text-xs font-medium font-mono">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>

        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border flex-shrink-0 ${colors.icon} transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
          <Icon name={iconName} size={20} />
        </div>
      </div>

      {/* Bottom accent line */}
      <motion.div
        className={`absolute bottom-0 left-0 h-[2px] ${colors.bar}`}
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        style={{ opacity: 0.5 }}
      />
    </motion.div>
  )
}

export default KpiCard
