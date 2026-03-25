import api from '../utils/api'

const auditService = {
  getLogs: async () => {
    try {
      const response = await api.get('/api/v1/audit')
      return response.data
    } catch (e) {
      return { data: [] }
    }
  }
}

export default auditService
