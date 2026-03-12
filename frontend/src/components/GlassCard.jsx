import { motion } from 'framer-motion'

const glowMap = {
  cyan: 'glow-cyan',
  emerald: 'glow-emerald',
  amber: 'glow-amber',
  red: 'glow-red',
  purple: 'glow-purple',
  none: '',
}

const GlassCard = ({
  children,
  className = '',
  glow = 'none',
  hover = true,
  padding = 'p-5',
  onClick = null,
  ...props
}) => {
  return (
    <motion.div
      className={`glass-card ${padding} ${glowMap[glow] || ''} ${className}`}
      whileHover={hover ? {
        y: -2,
        transition: { type: 'spring', stiffness: 400, damping: 25 }
      } : undefined}
      whileTap={onClick ? { scale: 0.985 } : undefined}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default GlassCard
