import { motion } from 'framer-motion'
import Icon from './icons/Icon'

const statusColors = {
  success: {
    glow: 'glow-emerald',
    icon: 'bg-status-healthy/15 border-status-healthy/25 text-status-healthy',
    bar: 'bg-status-healthy',
  },
  warning: {
    glow: 'glow-amber',
    icon: 'bg-status-warning/15 border-status-warning/25 text-status-warning',
    bar: 'bg-status-warning',
  },
  danger: {
    glow: 'glow-red',
    icon: 'bg-status-critical/15 border-status-critical/25 text-status-critical',
    bar: 'bg-status-critical',
  },
  normal: {
    glow: 'glow-cyan',
    icon: 'bg-accent-cyan/15 border-accent-cyan/25 text-accent-cyan',
    bar: 'bg-accent-cyan',
  },
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
      whileHover={{ y: -3, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-text-secondary mb-3 uppercase tracking-wider">
            {title}
          </p>

          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-2xl font-bold text-text-primary font-mono tracking-tight">
              {value}
            </span>
            {subtitle && (
              <span className="text-sm text-text-secondary">{subtitle}</span>
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

        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 ${colors.icon} transition-transform duration-200 group-hover:scale-110`}>
          <Icon name={iconName} size={20} />
        </div>
      </div>

      {/* Bottom gradient bar */}
      <motion.div
        className={`absolute bottom-0 left-0 h-[2px] ${colors.bar}`}
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
        style={{ opacity: 0.6 }}
      />
    </motion.div>
  )
}

export default KpiCard
