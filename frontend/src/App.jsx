import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import PageLoader from './components/PageLoader'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ResourcesPage = lazy(() => import('./pages/ResourcesPage'))
const KPIsPage = lazy(() => import('./pages/KPIsPage'))
const AuditPage = lazy(() => import('./pages/AuditPage'))
const SecurityPage = lazy(() => import('./pages/SecurityPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

const ProtectedLayout = ({ children }) => (
  <ProtectedRoute>
    <Layout>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </Layout>
  </ProtectedRoute>
)

function App() {
  return (
    <Routes>
      <Route path="/login" element={
        <Suspense fallback={<PageLoader fullScreen />}>
          <LoginPage />
        </Suspense>
      } />

      <Route path="/" element={<ProtectedLayout><Navigate to="/dashboard" replace /></ProtectedLayout>} />
      <Route path="/dashboard" element={<ProtectedLayout><DashboardPage /></ProtectedLayout>} />
      <Route path="/resources" element={<ProtectedLayout><ResourcesPage /></ProtectedLayout>} />
      <Route path="/kpis" element={<ProtectedLayout><KPIsPage /></ProtectedLayout>} />
      <Route path="/audit" element={<ProtectedLayout><AuditPage /></ProtectedLayout>} />
      <Route path="/security" element={<ProtectedLayout><SecurityPage /></ProtectedLayout>} />
      <Route path="/settings" element={<ProtectedLayout><SettingsPage /></ProtectedLayout>} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
