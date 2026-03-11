import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from 'recharts'
import Icon from './icons/Icon'
import { LoadingAnimation, fadeInVariants } from './animations/StaggerContainer'

const MetricsChart = ({ data = [], loading = false, className = '' }) => {
  // Formatear datos para Recharts
  const chartData = data.map((item, index) => ({
    time: index % 10 === 0 ? `${index}s` : '', // Mostrar etiquetas cada 10 segundos
    cpu: item.cpu || 0,
    ram: item.ram || 0,
    timestamp: index
  }))

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          className="bg-secondary border border-gray-600 p-3 rounded-lg shadow-lg"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-sm font-medium text-primary mb-2">{`Tiempo: ${label}`}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <p className="text-sm text-white">
                {`${entry.name}: ${entry.value}%`}
              </p>
            </div>
          ))}
        </motion.div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }) => {
    return (
      <motion.div 
        className="flex items-center justify-center space-x-6 text-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {payload.map((entry, index) => (
          <motion.div
            key={index}
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <motion.div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ 
                repeat: Infinity, 
                duration: 2, 
                delay: index * 0.2,
                ease: "easeInOut" 
              }}
            />
            <span className="text-text-secondary capitalize">{entry.value}</span>
          </motion.div>
        ))}
      </motion.div>
    )
  }

  const chartVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeInOut",
        staggerChildren: 0.1
      }
    }
  }

  const lineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 2, ease: "easeInOut" },
        opacity: { duration: 0.5, delay: 0.5 }
      }
    }
  }

  if (loading) {
    return (
      <motion.div
        className={`h-80 bg-tertiary rounded-lg flex items-center justify-center ${className}`}
        variants={fadeInVariants}
        initial="hidden"
        animate="visible"
      >
        <LoadingAnimation size={48} />
      </motion.div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <motion.div
        className={`h-80 bg-tertiary rounded-lg flex flex-col items-center justify-center ${className}`}
        variants={fadeInVariants}
        initial="hidden"
        animate="visible"
      >
        <Icon name="bar-chart" size={48} className="text-text-secondary mb-4" />
        <p className="text-text-secondary">No hay datos disponibles</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={`h-80 bg-tertiary rounded-lg p-4 ${className}`}
      variants={chartVariants}
      initial="hidden"
      animate="visible"
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#36BFB1" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#36BFB1" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF4C4C" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#FF4C4C" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#374151" 
            opacity={0.3}
          />
          
          <XAxis 
            dataKey="time" 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            axisLine={{ stroke: '#374151' }}
          />
          
          <YAxis 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            axisLine={{ stroke: '#374151' }}
            domain={[0, 100]}
          />
          
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          
          {/* Área bajo la línea CPU con gradiente */}
          <Area
            type="monotone"
            dataKey="cpu"
            stroke="none"
            fill="url(#cpuGradient)"
            fillOpacity={0.3}
          />
          
          {/* Línea CPU */}
          <Line 
            type="monotone" 
            dataKey="cpu" 
            stroke="#36BFB1" 
            strokeWidth={3}
            name="CPU"
            dot={false}
            activeDot={{ 
              r: 6,
              fill: "#36BFB1",
              stroke: "#fff",
              strokeWidth: 2
            }}
            animationDuration={2000}
            animationEasing="ease-in-out"
          />
          
          {/* Área bajo la línea RAM con gradiente */}
          <Area
            type="monotone"
            dataKey="ram"
            stroke="none"
            fill="url(#ramGradient)"
            fillOpacity={0.3}
          />
          
          {/* Línea RAM */}
          <Line 
            type="monotone" 
            dataKey="ram" 
            stroke="#FF4C4C" 
            strokeWidth={3}
            name="RAM"
            dot={false}
            activeDot={{ 
              r: 6,
              fill: "#FF4C4C",
              stroke: "#fff",
              strokeWidth: 2
            }}
            animationDuration={2000}
            animationEasing="ease-in-out"
            animationBegin={500}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Indicadores de estado en tiempo real */}
      <motion.div
        className="absolute top-6 right-6 flex items-center space-x-2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
      >
        <motion.div
          className="w-2 h-2 bg-accent-cyan rounded-full"
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
        <span className="text-xs text-text-secondary">Live</span>
      </motion.div>
    </motion.div>
  )
}

export default MetricsChart
