import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import PageLoader from './components/PageLoader'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const AgentSetupPage = lazy(() => import('./pages/AgentSetupPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ResourcesPage = lazy(() => import('./pages/ResourcesPage'))
const KPIsPage = lazy(() => import('./pages/KPIsPage'))
const AuditPage = lazy(() => import('./pages/AuditPage'))
const SecurityPage = lazy(() => import('./pages/SecurityPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const UsersPage = lazy(() => import('./pages/UsersPage'))
const AcceptInvitePage = lazy(() => import('./pages/AcceptInvitePage'))
const Error404Page = lazy(() => import('./pages/Error404Page'))
const Error500Page = lazy(() => import('./pages/Error500Page'))

const ProtectedLayout = ({ children, allowedRoles }) => (
  <ProtectedRoute allowedRoles={allowedRoles}>
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
      {/* Public routes */}
      <Route path="/" element={
        <Suspense fallback={<PageLoader fullScreen />}>
          <LandingPage />
        </Suspense>
      } />
      <Route path="/login" element={
        <Suspense fallback={<PageLoader fullScreen />}>
          <LoginPage />
        </Suspense>
      } />
      <Route path="/register" element={
        <Suspense fallback={<PageLoader fullScreen />}>
          <RegisterPage />
        </Suspense>
      } />
      <Route path="/invite/:token" element={
        <Suspense fallback={<PageLoader fullScreen />}>
          <AcceptInvitePage />
        </Suspense>
      } />

      {/* Agent setup (authenticated, no layout) */}
      <Route path="/setup" element={
        <ProtectedRoute>
          <Suspense fallback={<PageLoader fullScreen />}>
            <AgentSetupPage />
          </Suspense>
        </ProtectedRoute>
      } />

      {/* Protected routes with layout */}
      <Route path="/dashboard" element={<ProtectedLayout><DashboardPage /></ProtectedLayout>} />
      <Route path="/resources" element={<ProtectedLayout><ResourcesPage /></ProtectedLayout>} />
      <Route path="/kpis" element={<ProtectedLayout><KPIsPage /></ProtectedLayout>} />
      <Route path="/audit" element={<ProtectedLayout allowedRoles={['admin', 'viewer']}><AuditPage /></ProtectedLayout>} />
      <Route path="/security" element={<ProtectedLayout allowedRoles={['admin', 'operator']}><SecurityPage /></ProtectedLayout>} />
      <Route path="/settings" element={<ProtectedLayout allowedRoles={['admin']}><SettingsPage /></ProtectedLayout>} />
      <Route path="/users" element={<ProtectedLayout allowedRoles={['admin']}><UsersPage /></ProtectedLayout>} />

      <Route path="/404" element={
        <Suspense fallback={<PageLoader fullScreen />}>
          <Error404Page />
        </Suspense>
      } />
      <Route path="/500" element={
        <Suspense fallback={<PageLoader fullScreen />}>
          <Error500Page />
        </Suspense>
      } />

      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}

export default App
