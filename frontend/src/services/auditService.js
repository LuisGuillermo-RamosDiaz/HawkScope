import api from '../utils/api'
import { isDemoMode } from '../utils/demoMode'
import { demoAuditLogs } from '../utils/demoData'

const auditService = {
  getLogs: async () => {
    if (isDemoMode()) return { data: demoAuditLogs }
    try {
      const response = await api.get('/api/v1/audit')
      return response.data
    } catch (e) {
      return { data: [] }
    }
  }
}

export default auditService
