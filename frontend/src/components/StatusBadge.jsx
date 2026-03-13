import { motion } from 'framer-motion'

const statusConfig = {
  healthy: {
    bg: 'bg-status-healthy',
    text: 'text-status-healthy',
    glow: 'rgba(16, 185, 129, 0.6)',
    label: 'Healthy',
  },
  online: {
    bg: 'bg-status-healthy',
    text: 'text-status-healthy',
    glow: 'rgba(16, 185, 129, 0.6)',
    label: 'Online',
  },
  warning: {
    bg: 'bg-status-warning',
    text: 'text-status-warning',
    glow: 'rgba(245, 158, 11, 0.6)',
    label: 'Warning',
  },
  critical: {
    bg: 'bg-status-critical',
    text: 'text-status-critical',
    glow: 'rgba(239, 68, 68, 0.6)',
    label: 'Critical',
  },
  offline: {
    bg: 'bg-gray-500',
    text: 'text-gray-400',
    glow: 'rgba(107, 114, 128, 0.4)',
    label: 'Offline',
  },
  info: {
    bg: 'bg-status-info',
    text: 'text-status-info',
    glow: 'rgba(59, 130, 246, 0.6)',
    label: 'Info',
  },
}

const StatusBadge = ({ status = 'healthy', label = null, pulse = true, size = 'sm' }) => {
  const config = statusConfig[status] || statusConfig.healthy
  const displayLabel = label || config.label

  const dotSize = size === 'xs' ? 'w-1.5 h-1.5' : 'w-2 h-2'
  const textSize = size === 'xs' ? 'text-[10px]' : 'text-xs'
  const padSize = size === 'xs' ? 'px-2 py-0.5' : 'px-2.5 py-1'

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${padSize} rounded-full ${config.text}`}
      style={{ background: config.glow.replace(/[\d.]+\)$/, '0.1)') }}
    >
      <motion.span
        className={`${dotSize} rounded-full ${config.bg}`}
        style={{ boxShadow: `0 0 6px ${config.glow}` }}
        animate={pulse ? { scale: [1, 1.4, 1], opacity: [1, 0.6, 1] } : undefined}
        transition={pulse ? { repeat: Infinity, duration: 2, ease: 'easeInOut' } : undefined}
      />
      <span className={`${textSize} font-medium`}>{displayLabel}</span>
    </span>
  )
}

export default StatusBadge
