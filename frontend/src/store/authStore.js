import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      isAuthenticated: false,
      
      // Acciones
      login: (userData) => {
        set({
          user: {
            email: userData.email,
            role: userData.role,
            token: userData.token
          },
          isAuthenticated: true
        })
      },
      
      logout: () => {
        set({
          user: null,
          isAuthenticated: false
        })
        // Limpiar localStorage completamente
        localStorage.removeItem('auth-storage')
      },
      
      // Verificar si el token está expirado (simple validación)
      isTokenExpired: () => {
        const { user } = get()
        if (!user || !user.token) return true
        
        try {
          // Verificar si el token tiene el formato correcto (3 partes separadas por .)
          const tokenParts = user.token.split('.')
          if (tokenParts.length !== 3) {
            console.warn('Token format invalid:', user.token)
            return true
          }
          
          // Decodificar token JWT (simple)
          const payload = JSON.parse(atob(tokenParts[1]))
          const currentTime = Date.now() / 1000
          return payload.exp < currentTime
        } catch (error) {
          console.error('Error al decodificar token:', error)
          console.error('Token que causó error:', user.token)
          return true
        }
      },
      
      // Obtener token para solicitudes
      getToken: () => {
        const { user } = get()
        return user?.token || null
      }
    }),
    {
      name: 'auth-storage', // nombre en localStorage
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
)

export default useAuthStore
