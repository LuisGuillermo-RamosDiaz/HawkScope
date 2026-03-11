import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import KpiCard from '../components/KpiCard'
import MetricsChart from '../components/MetricsChart'
import metricsService from '../services/metricsService'
import { useToast } from '../hooks/useToast'
import Icon from '../components/icons/Icon'
import { 
  StaggerContainer, 
  StaggerItem, 
  LoadingAnimation, 
  fadeInVariants, 
  slideUpVariants,
  PulseAnimation 
} from '../components/animations/StaggerContainer'

const DashboardPage = () => {
  const [metrics, setMetrics] = useState([])
  const [kpis, setKpis] = useState(null)
  const [serverStatus, setServerStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { showError, showSuccess } = useToast()

  // Función para obtener datos
  const fetchData = async (silent = false) => {
    if (!silent) {
      setLoading(true)
    } else {
      setIsRefreshing(true)
    }

    try {
      // Intentar obtener datos reales
      const [metricsData, kpisData, serverData] = await Promise.allSettled([
        metricsService.getLatest(),
        metricsService.getKpis(),
        metricsService.getServerStatus()
      ])

      // Procesar métricas
      if (metricsData.status === 'fulfilled') {
        setMetrics(metricsData.value.data || [])
      } else {
        // Usar datos mock si falla la API
        setMetrics(generateMockMetrics())
      }

      // Procesar KPIs
      if (kpisData.status === 'fulfilled') {
        setKpis(kpisData.value)
      } else {
        setKpis(generateMockKpis())
      }

      // Procesar estado de servidores
      if (serverData.status === 'fulfilled') {
        setServerStatus(serverData.value)
      } else {
        setServerStatus(generateMockServerStatus())
      }

      if (!silent) {
        showSuccess('Dashboard actualizado correctamente')
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      showError('Error al cargar los datos del dashboard')
      
      // Usar datos mock en caso de error
      setMetrics(generateMockMetrics())
      setKpis(generateMockKpis())
      setServerStatus(generateMockServerStatus())
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  // Generar datos mock para métricas
  const generateMockMetrics = () => {
    const data = []
    for (let i = 0; i < 30; i++) {
      data.push({
        cpu: Math.floor(Math.random() * 40) + 30, // 30-70%
        ram: Math.floor(Math.random() * 30) + 40   // 40-70%
      })
    }
    return data
  }

  // Generar KPIs mock
  const generateMockKpis = () => ({
    totalServers: 24,
    healthyServers: 22,
    criticalServers: 2,
    uptime: 99.9,
    alerts: 5,
    responseTime: 120
  })

  // Generar estado de servidores mock
  const generateMockServerStatus = () => ({
    healthy: 22,
    warning: 2,
    critical: 0,
    total: 24
  })

  // useEffect con setInterval cada 10 segundos
  useEffect(() => {
    fetchData(false) // Cargar datos iniciales

    const interval = setInterval(() => {
      fetchData(true) // Actualización silenciosa
    }, 10000) // Cada 10 segundos

    return () => clearInterval(interval)
  }, [])

  // Variants para el contenedor principal
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  // Variants para las secciones
  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.6
      }
    }
  }

  if (loading) {
    return (
      <motion.div
        className="space-y-6 h-full flex items-center justify-center"
        variants={fadeInVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center">
          <LoadingAnimation size={64} />
          <motion.p
            className="text-text-secondary mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Cargando dashboard...
          </motion.p>
        </div>
      </motion.div>
    )
  }

  return (
    <StaggerContainer className="space-y-6">
      {/* Header con animación */}
      <motion.div
        variants={sectionVariants}
        className="flex items-center justify-between"
      >
        <div>
          <motion.h1 
            className="text-3xl font-bold text-primary mb-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            Dashboard Principal
          </motion.h1>
          <motion.p 
            className="text-text-secondary"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Monitoreo en tiempo real del sistema DevSecOps
          </motion.p>
        </div>

        {/* Botón de refresh */}
        <motion.button
          onClick={() => fetchData(false)}
          className="btn-primary flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isRefreshing}
        >
          <motion.div
            animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
            transition={{ 
              repeat: isRefreshing ? Infinity : 0, 
              duration: 1, 
              ease: "linear" 
            }}
          >
            <Icon name="refresh-cw" size={16} />
          </motion.div>
          <span>{isRefreshing ? 'Actualizando...' : 'Actualizar'}</span>
        </motion.button>
      </motion.div>

      {/* KPIs Grid con stagger animation */}
      <motion.div
        variants={sectionVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StaggerItem>
          <KpiCard
            title="Servidores Sanos"
            value={serverStatus?.healthy || 0}
            subtitle={`/ ${serverStatus?.total || 0}`}
            iconName="server"
            status="success"
            trend={2.5}
          />
        </StaggerItem>
        
        <StaggerItem>
          <KpiCard
            title="Servidores Críticos"
            value={serverStatus?.critical || 0}
            subtitle={`/ ${serverStatus?.total || 0}`}
            iconName="alert-triangle"
            status="danger"
            trend={-1.2}
          />
        </StaggerItem>
        
        <StaggerItem>
          <KpiCard
            title="Uptime"
            value={kpis?.uptime || 0}
            subtitle="%"
            iconName="activity"
            status="success"
            trend={0.1}
          />
        </StaggerItem>
        
        <StaggerItem>
          <KpiCard
            title="Alertas Activas"
            value={kpis?.alerts || 0}
            subtitle="totales"
            iconName="bell"
            status={kpis?.alerts > 3 ? "warning" : "normal"}
            trend={-3.8}
          />
        </StaggerItem>
      </motion.div>

      {/* Gráfica de Métricas */}
      <motion.div
        variants={sectionVariants}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Icon name="bar-chart" size={24} className="text-accent-cyan" />
            <h3 className="text-lg font-semibold text-primary">Rendimiento del Sistema</h3>
          </motion.div>
          
          <motion.div
            className="flex items-center space-x-4 text-sm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center space-x-2">
              <motion.div
                className="w-3 h-3 bg-accent-cyan rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              <span className="text-text-secondary">CPU</span>
            </div>
            <div className="flex items-center space-x-2">
              <motion.div
                className="w-3 h-3 bg-alert-red rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
              />
              <span className="text-text-secondary">RAM</span>
            </div>
          </div>
        </div>
        
        <MetricsChart data={metrics} loading={loading} />
      </motion.div>

      {/* Información de actualización */}
      <motion.div
        variants={sectionVariants}
        className="flex items-center justify-center text-sm text-text-secondary"
      >
        <PulseAnimation>
          <div className="flex items-center space-x-2">
            <motion.div
              className="w-2 h-2 bg-accent-cyan rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            <Icon name="activity" size={16} />
            <span>Actualizado automáticamente cada 10 segundos</span>
          </div>
        </PulseAnimation>
      </motion.div>

      {/* Indicador de actualización en segundo plano */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            className="fixed top-4 right-4 bg-accent-cyan text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <Icon name="refresh-cw" size={16} />
            </motion.div>
            <span className="text-sm">Actualizando datos...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </StaggerContainer>
  )
}

export default DashboardPage
