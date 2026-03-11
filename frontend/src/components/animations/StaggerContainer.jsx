import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Variants para animaciones escalonadas
export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

export const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
      duration: 0.4
    }
  },
}

// Componente contenedor para animaciones escalonadas
const StaggerContainer = ({ 
  children, 
  className = '', 
  variants = staggerContainerVariants,
  initial = "hidden",
  animate = "visible",
  exit = "hidden"
}) => {
  return (
    <motion.div
      className={className}
      variants={variants}
      initial={initial}
      animate={animate}
      exit={exit}
    >
      {children}
    </motion.div>
  )
}

// Componente para items individuales con animación
const StaggerItem = ({ 
  children, 
  className = '', 
  variants = itemVariants,
  whileHover = { 
    scale: 1.02, 
    y: -2,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 17 
    } 
  }
}) => {
  return (
    <motion.div
      className={className}
      variants={variants}
      whileHover={whileHover}
    >
      {children}
    </motion.div>
  )
}

// Animación de fade in
const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.6, ease: "easeInOut" }
  },
}

// Animación de slide up
const slideUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring", 
      stiffness: 100, 
      damping: 15,
      duration: 0.5
    }
  },
}

// Componente para animación de carga
const LoadingAnimation = ({ size = 40 }) => {
  return (
    <motion.div
      className="flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="border-2 border-accent-cyan border-t-transparent rounded-full"
        style={{ width: size, height: size }}
        animate={{ rotate: 360 }}
        transition={{ 
          repeat: Infinity, 
          duration: 1, 
          ease: "linear" 
        }}
      />
    </motion.div>
  )
}

// Componente para animación de pulse
const PulseAnimation = ({ children, className = '' }) => {
  return (
    <motion.div
      className={className}
      animate={{ 
        scale: [1, 1.05, 1],
        opacity: [1, 0.8, 1]
      }}
      transition={{ 
        repeat: Infinity, 
        duration: 2, 
        ease: "easeInOut" 
      }}
    >
      {children}
    </motion.div>
  )
}

export {
  StaggerContainer,
  StaggerItem,
  LoadingAnimation,
  PulseAnimation,
  fadeInVariants,
  slideUpVariants
}
