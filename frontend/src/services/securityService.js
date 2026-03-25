import api from '../utils/api'
import { isDemoMode } from '../utils/demoMode'
import { demoThreats, demoVulnerabilities, demoFirewallRules } from '../utils/demoData'

const securityService = {
  getThreats: async () => {
    if (isDemoMode()) return { data: demoThreats }
    try {
      const response = await api.get('/api/v1/security/threats')
      return response.data
    } catch (e) {
      return { data: [] }
    }
  },

  getVulnerabilities: async () => {
    if (isDemoMode()) return { data: demoVulnerabilities }
    try {
      const response = await api.get('/api/v1/security/vulnerabilities')
      return response.data
    } catch (e) {
      return { data: [] }
    }
  },

  getFirewallRules: async () => {
    if (isDemoMode()) return { data: demoFirewallRules }
    try {
      const response = await api.get('/api/v1/security/firewall')
      return response.data
    } catch (e) {
      return { data: [] }
    }
  }
}

export default securityService
