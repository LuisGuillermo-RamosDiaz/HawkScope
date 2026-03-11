import axios from 'axios'
import useAuthStore from '../store/authStore'

// Crear instancia de Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor de solicitud - Agregar Bearer Token automáticamente
api.interceptors.request.use(
  (config) => {
    // Obtener token del store
    const token = useAuthStore.getState().getToken()
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor de respuesta - Manejar 401 Unauthorized
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Si el error es 401, limpiar estado y redirigir
    if (error.response?.status === 401) {
      console.warn('Token expirado o inválido, cerrando sesión...')
      
      // Limpiar estado global y localStorage
      useAuthStore.getState().logout()
      
      // Redirigir a login (esto se manejará en el componente)
      window.location.href = '/login'
    }
    
    return Promise.reject(error)
  }
)

export default api
