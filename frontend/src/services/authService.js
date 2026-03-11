import api from '../utils/api'

const authService = {
  // Login de usuario
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials)
      return response.data
    } catch (error) {
      // Propagar el error para manejo específico
      throw error
    }
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
    try {
      const response = await api.post('/auth/refresh')
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Verificar estado del token
  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify')
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export default authService
