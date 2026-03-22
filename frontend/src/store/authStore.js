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
        if (!user?.token) return true
        
        try {
          const parts = user.token.split('.')
          if (parts.length !== 3) return true
          const payload = JSON.parse(atob(parts[1]))
          if (!payload.exp) return false // Token sin expiración — aceptar
          return payload.exp < Date.now() / 1000
        } catch {
          return true // Token malformado — tratar como expirado
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
