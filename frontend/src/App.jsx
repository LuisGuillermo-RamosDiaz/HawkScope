import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ResourcesPage from './pages/ResourcesPage'
import KPIsPage from './pages/KPIsPage'
import AuditPage from './pages/AuditPage'
import SecurityPage from './pages/SecurityPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <Routes>
      {/* Ruta pública de login */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Rutas protegidas */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <Navigate to="/dashboard" replace />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            <DashboardPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/resources" element={
        <ProtectedRoute>
          <Layout>
            <ResourcesPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/kpis" element={
        <ProtectedRoute>
          <Layout>
            <KPIsPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/audit" element={
        <ProtectedRoute>
          <Layout>
            <AuditPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/security" element={
        <ProtectedRoute>
          <Layout>
            <SecurityPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <Layout>
            <SettingsPage />
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default App
