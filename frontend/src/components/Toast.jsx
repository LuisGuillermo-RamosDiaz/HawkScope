import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Icon from './icons/Icon'

const toastConfig = {
  success: {
    icon: 'check-circle',
    bg: 'from-status-healthy/20 to-status-healthy/5',
    border: 'border-status-healthy/30',
    iconColor: 'text-status-healthy',
    glow: 'shadow-glow-emerald',
  },
  error: {
    icon: 'x-circle',
    bg: 'from-status-critical/20 to-status-critical/5',
    border: 'border-status-critical/30',
    iconColor: 'text-status-critical',
    glow: 'shadow-glow-red',
  },
  warning: {
    icon: 'alert-triangle',
    bg: 'from-status-warning/20 to-status-warning/5',
    border: 'border-status-warning/30',
    iconColor: 'text-status-warning',
    glow: 'shadow-glow-amber',
  },
  info: {
    icon: 'info',
    bg: 'from-status-info/20 to-status-info/5',
    border: 'border-status-info/30',
    iconColor: 'text-status-info',
    glow: 'shadow-glow-cyan',
  },
}

const Toast = ({ message, type = 'info', onClose, duration = 5000 }) => {
  const config = toastConfig[type] || toastConfig.info

  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div className={`relative overflow-hidden rounded-xl border ${config.border} backdrop-blur-xl bg-gradient-to-r ${config.bg} ${config.glow} min-w-[320px] max-w-md`}>
      <div className="flex items-center gap-3 px-4 py-3.5">
        <Icon name={config.icon} size={18} className={config.iconColor} />
        <p className="text-sm text-text-primary flex-1 font-medium">{message}</p>
        <button
          onClick={onClose}
          className="text-text-secondary hover:text-text-primary transition-colors p-0.5 rounded-md hover:bg-white/5"
        >
          <Icon name="x" size={14} />
        </button>
      </div>

      {/* Progress bar */}
      <motion.div
        className={`absolute bottom-0 left-0 h-0.5 ${config.iconColor.replace('text-', 'bg-')}`}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
      />
    </div>
  )
}

export default Toast
