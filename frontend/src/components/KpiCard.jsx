import React from 'react'
import { motion } from 'framer-motion'
import Icon from './icons/Icon'
import { itemVariants } from './animations/StaggerContainer'

const KpiCard = ({ 
  title, 
  value, 
  subtitle, 
  iconName, 
  trend = null, 
  status = 'normal', // normal, success, warning, danger
  onClick = null,
  className = ''
}) => {
  const getStatusColors = () => {
    switch (status) {
      case 'success':
        return {
          bg: 'bg-green-500',
          bgOpacity: 'bg-green-500 bg-opacity-10',
          border: 'border-green-500',
          text: 'text-green-400',
          iconBg: 'bg-green-500 bg-opacity-20'
        }
      case 'warning':
        return {
          bg: 'bg-yellow-500',
          bgOpacity: 'bg-yellow-500 bg-opacity-10',
          border: 'border-yellow-500',
          text: 'text-yellow-400',
          iconBg: 'bg-yellow-500 bg-opacity-20'
        }
      case 'danger':
        return {
          bg: 'bg-alert-red',
          bgOpacity: 'bg-alert-red bg-opacity-10',
          border: 'border-alert-red',
          text: 'text-alert-red',
          iconBg: 'bg-alert-red bg-opacity-20'
        }
      default:
        return {
          bg: 'bg-accent-cyan',
          bgOpacity: 'bg-accent-cyan bg-opacity-10',
          border: 'border-accent-cyan',
          text: 'text-accent-cyan',
          iconBg: 'bg-accent-cyan bg-opacity-20'
        }
    }
  }

  const colors = getStatusColors()

  const getTrendIcon = () => {
    if (!trend) return null
    return trend > 0 ? 'trending-up' : trend < 0 ? 'trending-down' : 'minus'
  }

  const getTrendColor = () => {
    if (!trend) return colors.text
    return trend > 0 ? 'text-green-400' : trend < 0 ? 'text-alert-red' : 'text-text-secondary'
  }

  const cardVariants = {
    ...itemVariants,
    hover: {
      scale: 1.02,
      y: -4,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 17,
        duration: 0.2
      }
    }
  }

  const iconVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: {
      scale: 1.1,
      rotate: status === 'warning' ? 10 : status === 'danger' ? -10 : 5,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 15
      }
    }
  }

  const trendVariants = {
    initial: { opacity: 0, x: -10 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: {
        delay: 0.3,
        type: "spring",
        stiffness: 100
      }
    }
  }

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      whileTap={{ scale: 0.98 }}
      className={`card p-6 cursor-pointer transition-all duration-200 ${onClick ? 'hover:shadow-2xl' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <motion.h3 
            className="text-sm font-medium text-text-secondary mb-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {title}
          </motion.h3>
          
          <div className="flex items-baseline space-x-2 mb-3">
            <motion.span 
              className="text-3xl font-bold text-primary"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: 0.2,
                type: "spring",
                stiffness: 200
              }}
            >
              {value}
            </motion.span>
            {subtitle && (
              <motion.span 
                className="text-sm text-text-secondary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {subtitle}
              </motion.span>
            )}
          </div>
          
          {trend !== null && (
            <motion.div 
              className={`flex items-center space-x-2 ${getTrendColor()}`}
              variants={trendVariants}
              initial="initial"
              animate="animate"
            >
              <Icon 
                name={getTrendIcon()} 
                size={16} 
                className="flex-shrink-0"
              />
              <span className="text-xs font-medium">
                {Math.abs(trend)}%
              </span>
            </motion.div>
          )}
        </div>
        
        <motion.div
          variants={iconVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.iconBg} ${colors.border} border`}
        >
          <Icon 
            name={iconName} 
            size={24} 
            className={colors.text}
          />
        </motion.div>
      </div>

      {/* Indicador de estado sutil */}
      <motion.div
        className={`absolute bottom-0 left-0 h-1 rounded-full ${colors.bg}`}
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ 
          delay: 0.5,
          duration: 0.8,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  )
}

export default KpiCard
