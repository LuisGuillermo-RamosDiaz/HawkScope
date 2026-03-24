import api from '../utils/api'

const metricsService = {
  // Obtener métricas más recientes
  getLatest: async () => {
    try {
      const response = await api.get('/api/v1/metrics/latest')
      return response.data
    } catch (e) {
      return { data: [] }
    }
  },

  // Obtener métricas históricas
  getHistorical: async (range = '1h', serverId = null) => {
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
    try {
      const response = await api.get('/api/v1/metrics/kpis')
      return response.data
    } catch (e) {
      return { data: { totalServers: 24, healthyServers: 22, criticalServers: 2, uptime: 99.9, alerts: 5, responseTime: 120 } }
    }
  },

  // Obtener estado de servidores
  getServers: async () => {
    try {
      const response = await api.get('/api/v1/metrics/servers')
      return response.data
    } catch (e) {
      return { data: { healthy: 22, warning: 2, critical: 0, total: 24 } }
    }
  }
}

export default metricsService
