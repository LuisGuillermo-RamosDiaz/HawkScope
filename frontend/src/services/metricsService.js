import api from '../utils/api'
import { isDemoMode } from '../utils/demoMode'
import { demoServers, demoKpis, demoMetrics, demoHistorical } from '../utils/demoData'

const metricsService = {
  // Obtener métricas más recientes
  getLatest: async () => {
    if (isDemoMode()) return { data: demoMetrics }
    try {
      const response = await api.get('/api/v1/metrics/latest')
      return response.data
    } catch (e) {
      return { data: [] }
    }
  },

  // Obtener métricas históricas
  getHistorical: async (range = '1h', serverId = null) => {
    if (isDemoMode()) return { data: { data: demoHistorical } }
    try {
      const params = { range }
      if (serverId) params.server_id = serverId
      const response = await api.get('/api/v1/metrics/historical', { params })
      return response.data
    } catch (e) {
      return { data: { data: [] } }
    }
  },

  // Obtener KPIs del sistema
  getKpis: async () => {
    if (isDemoMode()) return { data: demoKpis }
    try {
      const response = await api.get('/api/v1/metrics/kpis')
      return response.data
    } catch (e) {
      return { data: { totalServers: 0, healthyServers: 0, criticalServers: 0, uptime: 0, alerts: 0, responseTime: 0 } }
    }
  },

  // Obtener estado de servidores
  getServers: async () => {
    if (isDemoMode()) return { data: { data: demoServers } }
    try {
      const response = await api.get('/api/v1/metrics/servers')
      return response.data
    } catch (e) {
      return { data: { data: [] } }
    }
  }
}

export default metricsService
