import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Icon from './icons/Icon'

const toastConfig = {
  success: {
    icon: 'check-circle',
    bg: 'from-status-healthy/15 to-status-healthy/5',
    border: 'border-status-healthy/20',
    iconColor: 'text-status-healthy',
    barColor: 'bg-status-healthy',
  },
  error: {
    icon: 'x-circle',
    bg: 'from-status-critical/15 to-status-critical/5',
    border: 'border-status-critical/20',
    iconColor: 'text-status-critical',
    barColor: 'bg-status-critical',
  },
  warning: {
    icon: 'alert-triangle',
    bg: 'from-status-warning/15 to-status-warning/5',
    border: 'border-status-warning/20',
    iconColor: 'text-status-warning',
    barColor: 'bg-status-warning',
  },
  info: {
    icon: 'info',
    bg: 'from-accent-blue/15 to-accent-blue/5',
    border: 'border-accent-blue/20',
    iconColor: 'text-accent-blue',
    barColor: 'bg-accent-blue',
  },
}

const Toast = ({ message, type = 'info', onClose, duration = 5000 }) => {
  const config = toastConfig[type] || toastConfig.info

  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div className={`relative overflow-hidden rounded-xl border ${config.border} backdrop-blur-xl bg-gradient-to-r ${config.bg} min-w-[320px] max-w-md shadow-glass`}>
      <div className="flex items-center gap-3 px-4 py-3.5">
        <Icon name={config.icon} size={17} className={config.iconColor} />
        <p className="text-[13px] text-text-primary flex-1 font-medium">{message}</p>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-primary transition-colors p-0.5 rounded-md hover:bg-white/5"
        >
          <Icon name="x" size={13} />
        </button>
      </div>

      <motion.div
        className={`absolute bottom-0 left-0 h-[2px] ${config.barColor}`}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
        style={{ opacity: 0.6 }}
      />
    </div>
  )
}

export default Toast
