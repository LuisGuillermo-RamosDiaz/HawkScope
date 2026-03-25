import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { isDemoMode } from '../utils/demoMode'
import { demoNotifications } from '../utils/demoData'

const useNotificationStore = create(
  persist(
    (set, get) => ({
      notifications: [],

      unreadCount: () => get().notifications.filter(n => !n.read).length,

      // Load demo notifications when entering demo mode
      loadDemoNotifications: () => {
        set({ notifications: demoNotifications })
      },

      markAllRead: () => {
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, read: true }))
        }))
      },

      markAsRead: (id) => {
        set(state => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          )
        }))
      },

      addNotification: (notification) => {
        set(state => ({
          notifications: [
            { ...notification, id: Date.now(), timestamp: Date.now(), read: false },
            ...state.notifications
          ]
        }))
      },

      removeNotification: (id) => {
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }))
      },

      clearAll: () => {
        set({ notifications: [] })
      },
    }),
    {
      name: 'hawkscope-notifications',
      partialize: (state) => ({ notifications: state.notifications }),
    }
  )
)

export default useNotificationStore
