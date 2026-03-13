import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useSettingsStore = create(
  persist(
    (set) => ({
      settings: {
        refreshInterval: '10',
        theme: 'dark',
        language: 'es',
        notifications: true,
        soundAlerts: false,
        emailReports: true,
        compactMode: false,
        animationsEnabled: true,
        autoLock: '15',
        twoFactor: false,
        sessionTimeout: '60',
        apiRateLimit: '100',
        logRetention: '30',
        backupSchedule: 'daily',
      },

      updateSetting: (key, value) => {
        set(state => ({
          settings: { ...state.settings, [key]: value }
        }))
      },

      saveSettings: (newSettings) => {
        set({ settings: newSettings })
      },
    }),
    {
      name: 'hawkscope-settings',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
)

export default useSettingsStore
