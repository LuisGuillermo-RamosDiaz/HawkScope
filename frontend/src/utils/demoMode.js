import useAuthStore from '../store/authStore'

/**
 * Returns true if the current session is in demo mode (mock token).
 * Demo mode uses tokens ending in '.mock-signature'.
 */
export const isDemoMode = () => {
  const token = useAuthStore.getState().getToken()
  return token && token.endsWith('.mock-signature')
}
