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
            id: userData.id,
            email: userData.email,
            role: userData.role,
            token: userData.token,
            apiKey: userData.apiKey,
            name: userData.name,
            profilePictureUrl: userData.profilePictureUrl || null
          },
          isAuthenticated: true
        })
      },
      
      setUser: (updatedUser) => {
        const current = get().user
        if (!current) return
        set({ user: { ...current, ...updatedUser } })
      },
      
      logout: () => {
        set({
          user: null,
          isAuthenticated: false
        })
        // Limpiar localStorage completamente
        localStorage.removeItem('auth-storage')
        localStorage.removeItem('hawkscope-notifications')
      },
      
      // Verificar si el token está expirado (simple validación)
      isTokenExpired: () => {
        const { user } = get()
        if (!user?.token) return true
        
        // Bypassear expiración para tokens de MOCK (demo)
        if (user.token.endsWith('.mock-signature')) return false
        
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
