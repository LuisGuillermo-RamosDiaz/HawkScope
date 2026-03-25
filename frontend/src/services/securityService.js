import api from '../utils/api'

const securityService = {
  getThreats: async () => {
    try {
      const response = await api.get('/api/v1/security/threats')
      return response.data
    } catch (e) {
      return { data: [] }
    }
  },

  getVulnerabilities: async () => {
    try {
      const response = await api.get('/api/v1/security/vulnerabilities')
      return response.data
    } catch (e) {
      return { data: [] }
    }
  },

  getFirewallRules: async () => {
    try {
      const response = await api.get('/api/v1/security/firewall')
      return response.data
    } catch (e) {
      return { data: [] }
    }
  }
}

export default securityService
