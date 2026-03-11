import api from '../utils/api'

const metricsService = {
  // Obtener métricas más recientes
  getLatest: async () => {
    try {
      const response = await api.get('/metrics/latest')
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Obtener métricas históricas
  getHistorical: async (timeRange = '1h') => {
    try {
      const response = await api.get(`/metrics/historical?range=${timeRange}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Obtener KPIs del sistema
  getKpis: async () => {
    try {
      const response = await api.get('/metrics/kpis')
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Obtener estado de servidores
  getServerStatus: async () => {
    try {
      const response = await api.get('/metrics/servers')
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export default metricsService
