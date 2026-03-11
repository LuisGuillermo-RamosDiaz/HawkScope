import api from '../utils/api'

const metricsService = {
  // Obtener métricas más recientes
  getLatest: async () => {
    const response = await api.get('/metrics/latest')
    return response.data
  },

  // Obtener métricas históricas
  getHistorical: async (timeRange = '1h') => {
    const response = await api.get(`/metrics/historical?range=${timeRange}`)
    return response.data
  },

  // Obtener KPIs del sistema
  getKpis: async () => {
    const response = await api.get('/metrics/kpis')
    return response.data
  },

  // Obtener estado de servidores
  getServerStatus: async () => {
    const response = await api.get('/metrics/servers')
    return response.data
  }
}

export default metricsService
