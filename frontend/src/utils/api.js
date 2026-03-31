import axios from 'axios'
import useAuthStore from '../store/authStore'

// Crear instancia de Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
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
      // No cerrar sesión si es un token de MOCK (para evitar bucles en demo)
      const token = useAuthStore.getState().getToken()
      if (token && token.endsWith('.mock-signature')) {
        console.warn('Backend inalcanzable, pero manteniéndonos en modo Mock.')
        return Promise.reject(error)
      }

      console.warn('Token expirado o inválido, limpiando sesión...')
      
      // Limpiar estado global y localStorage
      useAuthStore.getState().logout()
      
      // Dejamos que los componentes reaccionen al estado isAuthenticated=false
    } else if (error.response?.status === 500) {
      console.error('Error 500 Capturado por Interceptor. Redirigiendo a pantalla de resiliencia...');
      window.location.href = '/500';
    } else if (error.response?.status === 404) {
      console.error('Error 404 Capturado por Interceptor. Redirigiendo a pantalla de resiliencia...');
      window.location.href = '/404';
    }
    
    return Promise.reject(error)
  }
)

export default api
