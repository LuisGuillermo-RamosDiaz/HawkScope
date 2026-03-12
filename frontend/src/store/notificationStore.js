import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const defaultNotifications = [
  { id: 1, type: 'critical', title: 'Brute force detectado', desc: 'IP 198.51.100.23 bloqueada', time: '2m', read: false, timestamp: Date.now() - 120000 },
  { id: 2, type: 'warning', title: 'CPU alta en worker-03', desc: 'Uso sostenido al 87% por 5 min', time: '7m', read: false, timestamp: Date.now() - 420000 },
  { id: 3, type: 'success', title: 'Deploy exitoso prod-api-01', desc: 'Version v2.4.1 en produccion', time: '25m', read: true, timestamp: Date.now() - 1500000 },
  { id: 4, type: 'info', title: 'Backup completado', desc: 'db-main — 2.4 GB guardados', time: '1h', read: true, timestamp: Date.now() - 3600000 },
  { id: 5, type: 'warning', title: 'Certificado SSL proxima caducidad', desc: 'api-legacy caduca en 7 dias', time: '3h', read: true, timestamp: Date.now() - 10800000 },
]

const useNotificationStore = create(
  persist(
    (set, get) => ({
      notifications: defaultNotifications,

      unreadCount: () => get().notifications.filter(n => !n.read).length,

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
