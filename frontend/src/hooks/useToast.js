import { useState, useCallback, useEffect } from 'react'

export const useToast = () => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random()
    const newToast = { id, message, type, duration }
    
    // Dispatch a global event so the Layout component (which actually renders them) can catch it
    const event = new CustomEvent('hawkscope-toast', { detail: newToast });
    window.dispatchEvent(event);
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  useEffect(() => {
    // Only Layout will actually aggregate these into state and render them
    const handleGlobalToast = (e) => {
      const newToast = e.detail;
      setToasts(prev => [...prev, newToast]);
      setTimeout(() => {
        removeToast(newToast.id);
      }, newToast.duration);
    };
    
    window.addEventListener('hawkscope-toast', handleGlobalToast);
    return () => window.removeEventListener('hawkscope-toast', handleGlobalToast);
  }, [removeToast])

  const showError = useCallback((message, duration) => {
    addToast(message, 'error', duration)
  }, [addToast])

  const showSuccess = useCallback((message, duration) => {
    addToast(message, 'success', duration)
  }, [addToast])

  const showWarning = useCallback((message, duration) => {
    addToast(message, 'warning', duration)
  }, [addToast])

  const showInfo = useCallback((message, duration) => {
    addToast(message, 'info', duration)
  }, [addToast])

  return {
    toasts,
    addToast,
    removeToast,
    showError,
    showSuccess,
    showWarning,
    showInfo
  }
}
