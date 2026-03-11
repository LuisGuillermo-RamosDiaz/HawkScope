import React, { useState, useEffect } from 'react'
import KpiCard from '../components/KpiCard'
import MetricsChart from '../components/MetricsChart'
import metricsService from '../services/metricsService'
import { useToast } from '../hooks/useToast'

const DashboardPage = () => {
  const [metrics, setMetrics] = useState([])
  const [kpis, setKpis] = useState(null)
  const [serverStatus, setServerStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showError } = useToast()

  // Función para obtener datos
  const fetchData = async () => {
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

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      showError('Error al cargar los datos del dashboard')
      
      // Usar datos mock en caso de error
      setMetrics(generateMockMetrics())
      setKpis(generateMockKpis())
      setServerStatus(generateMockServerStatus())
    } finally {
      setLoading(false)
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
    fetchData() // Cargar datos iniciales

    const interval = setInterval(() => {
      fetchData()
    }, 10000) // Cada 10 segundos

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-cyan"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Dashboard Principal</h1>
        <p className="text-text-secondary">Monitoreo en tiempo real del sistema DevSecOps</p>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Servidores Sanos"
          value={serverStatus?.healthy || 0}
          subtitle={`/ ${serverStatus?.total || 0}`}
          icon="🖥️"
          status="success"
          trend={2.5}
        />
        
        <KpiCard
          title="Servidores Críticos"
          value={serverStatus?.critical || 0}
          subtitle="/ ${serverStatus?.total || 0}"
          icon="⚠️"
          status="danger"
          trend={-1.2}
        />
        
        <KpiCard
          title="Uptime"
          value={kpis?.uptime || 0}
          subtitle="%"
          icon="⏱️"
          status="success"
          trend={0.1}
        />
        
        <KpiCard
          title="Alertas Activas"
          value={kpis?.alerts || 0}
          subtitle="totales"
          icon="🚨"
          status={kpis?.alerts > 3 ? "warning" : "normal"}
          trend={-3.8}
        />
      </div>

      {/* Gráfica de Métricas */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-primary">Rendimiento del Sistema</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-accent-cyan rounded-full"></div>
              <span className="text-text-secondary">CPU</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-alert-red rounded-full"></div>
              <span className="text-text-secondary">RAM</span>
            </div>
          </div>
        </div>
        <MetricsChart data={metrics} loading={loading} />
      </div>

      {/* Información de actualización */}
      <div className="flex items-center justify-center text-sm text-text-secondary">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-accent-cyan rounded-full animate-pulse"></div>
          <span>Actualizado automáticamente cada 10 segundos</span>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
