import { motion } from 'framer-motion'

const PageLoader = ({ fullScreen = false }) => {
  const containerClass = fullScreen
    ? 'fixed inset-0 z-50 flex items-center justify-center'
    : 'flex items-center justify-center h-full min-h-[60vh]'

  return (
    <div className={containerClass} style={{ background: 'var(--color-surface-base)' }}>
      <div className="flex flex-col items-center gap-6">
        {/* Radar ring */}
        <div className="relative w-16 h-16">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: '2px solid rgba(0, 240, 255, 0.1)' }}
          />
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: '2px solid transparent', borderTopColor: '#00f0ff' }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-2 rounded-full"
            style={{ border: '1.5px solid transparent', borderTopColor: 'rgba(168, 85, 247, 0.7)' }}
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            <div className="w-2 h-2 rounded-full bg-accent-cyan" style={{ boxShadow: '0 0 12px rgba(0, 240, 255, 0.8)' }} />
          </motion.div>
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-1.5">
          <motion.p
            className="text-xs font-medium text-text-secondary tracking-widest uppercase"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            Cargando modulo
          </motion.p>
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-1 h-1 rounded-full bg-accent-cyan"
                animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1, 0.8] }}
                transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2, ease: 'easeInOut' }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PageLoader
