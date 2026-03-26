import api from '../utils/api'

const reportsService = {
  exportServers: async () => {
    const response = await api.get('/api/v1/reports/servers/export')
    return response.data
  }
}

export default reportsService
