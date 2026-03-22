import api from '../utils/api'

const metricsService = {
  // Obtener métricas más recientes
  getLatest: async () => {
    const response = await api.get('/v1/metrics/latest')
    return response.data
  },

  // Obtener métricas históricas
  getHistorical: async (range = '1h', serverId = null) => {
    const params = { range }
    if (serverId) params.server_id = serverId
    const response = await api.get('/v1/metrics/historical', { params })
    return response.data
  },

  // Obtener KPIs del sistema
  getKpis: async () => {
    const response = await api.get('/v1/metrics/kpis')
    return response.data
  },

  // Obtener estado de servidores
  getServers: async () => {
    const response = await api.get('/v1/metrics/servers')
    return response.data
  }
}

export default metricsService
