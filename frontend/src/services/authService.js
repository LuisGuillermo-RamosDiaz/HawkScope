import api from '../utils/api'

const authService = {
  // Login de usuario
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  // Logout de usuario
  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      // Even if logout fails on backend, clear local state
      console.warn('Logout API failed:', error)
    }
  },

  // Refrescar token
  refreshToken: async () => {
    const response = await api.post('/auth/refresh')
    return response.data
  },

  // Verificar estado del token
  verifyToken: async () => {
    const response = await api.get('/auth/verify')
    return response.data
  }
}

export default authService
