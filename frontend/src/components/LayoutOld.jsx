import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import Toast from './Toast'
import { useToast } from '../hooks/useToast'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { toasts, removeToast } = useToast()

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/resources', label: 'Recursos', icon: '🖥️' },
    { path: '/kpis', label: 'KPIs', icon: '📈' },
    { path: '/audit', label: 'Auditoría', icon: '🔍' },
    { path: '/security', label: 'Seguridad', icon: '🛡️' },
    { path: '/settings', label: 'Configuración', icon: '⚙️' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-primary">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-secondary transition-all duration-300 ease-in-out border-r border-gray-700`}>
        <div className="flex flex-col h-full">
          {/* Logo/Toggle */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h1 className={`font-bold text-xl text-accent-cyan ${!sidebarOpen && 'hidden'}`}>
              DevSecOps
            </h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-text-secondary hover:text-primary p-2 rounded-lg hover:bg-tertiary transition-colors"
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? 'bg-accent-cyan text-white'
                        : 'text-text-secondary hover:text-primary hover:bg-tertiary'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {sidebarOpen && <span>{item.label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent-cyan rounded-full flex items-center justify-center text-white font-bold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                {sidebarOpen && (
                  <div>
                    <p className="text-sm font-medium text-primary">{user?.email || 'Usuario'}</p>
                    <p className="text-xs text-text-secondary capitalize">{user?.role || 'guest'}</p>
                  </div>
                )}
              </div>
              {sidebarOpen && (
                <button
                  onClick={handleLogout}
                  className="text-text-secondary hover:text-alert-red transition-colors p-1"
                  title="Cerrar sesión"
                >
                  🚪
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <header className="bg-secondary border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-primary">
                {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="input-field w-64"
                />
              </div>
              
              {/* Notifications */}
              <button className="relative p-2 text-text-secondary hover:text-primary transition-colors">
                🔔
                <span className="absolute top-1 right-1 w-2 h-2 bg-alert-red rounded-full"></span>
              </button>
              
              {/* User Menu */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-text-secondary">
                  {user?.role?.toUpperCase()}
                </span>
                <button className="p-2 text-text-secondary hover:text-primary transition-colors">
                  👤
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
      
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
            duration={toast.duration}
          />
        ))}
      </div>
    </div>
  )
}

export default Layout
