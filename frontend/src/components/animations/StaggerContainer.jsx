import { motion } from 'framer-motion'

export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
}

export const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 150,
      damping: 18,
    },
  },
}

export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

export const slideUpVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
}

export const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
    },
  },
}

const StaggerContainer = ({
  children,
  className = '',
  variants = staggerContainerVariants,
  initial = 'hidden',
  animate = 'visible',
}) => (
  <motion.div
    className={className}
    variants={variants}
    initial={initial}
    animate={animate}
  >
    {children}
  </motion.div>
)

const StaggerItem = ({
  children,
  className = '',
  variants = itemVariants,
}) => (
  <motion.div className={className} variants={variants}>
    {children}
  </motion.div>
)

const LoadingAnimation = ({ size = 40 }) => (
  <motion.div
    className="flex items-center justify-center"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    transition={{ duration: 0.3 }}
  >
    <div className="relative" style={{ width: size, height: size }}>
      <motion.div
        className="absolute inset-0 border-2 border-accent-cyan/20 rounded-full"
      />
      <motion.div
        className="absolute inset-0 border-2 border-accent-cyan border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
      />
    </div>
  </motion.div>
)

const PulseAnimation = ({ children, className = '' }) => (
  <motion.div
    className={className}
    animate={{ scale: [1, 1.02, 1], opacity: [1, 0.85, 1] }}
    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
)

export { StaggerContainer, StaggerItem, LoadingAnimation, PulseAnimation }
