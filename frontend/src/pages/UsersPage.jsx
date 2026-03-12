import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import GlassCard from '../components/GlassCard'
import Icon from '../components/icons/Icon'
import StatusBadge from '../components/StatusBadge'
import useAuthStore from '../store/authStore'
import { useToast } from '../hooks/useToast'
import { StaggerContainer, StaggerItem } from '../components/animations/StaggerContainer'

const mockUsers = [
  { id: 1, name: 'Admin Principal', email: 'admin@devsecops.com', role: 'admin', status: 'active', lastAccess: '2024-03-11 14:32' },
  { id: 2, name: 'Carlos Operador', email: 'operator@devsecops.com', role: 'operator', status: 'active', lastAccess: '2024-03-11 13:15' },
  { id: 3, name: 'Ana Viewer', email: 'viewer@devsecops.com', role: 'viewer', status: 'active', lastAccess: '2024-03-10 18:45' },
  { id: 4, name: 'Miguel SOC', email: 'miguel@devsecops.com', role: 'operator', status: 'inactive', lastAccess: '2024-03-05 09:20' },
  { id: 5, name: 'Invitado Nuevo', email: 'nuevo@empresa.com', role: 'viewer', status: 'invited', lastAccess: '-' },
]

const roleColors = {
  admin: 'text-accent-cyan bg-accent-cyan/8 border-accent-cyan/15',
  operator: 'text-accent-purple bg-accent-purple/8 border-accent-purple/15',
  viewer: 'text-accent-amber bg-accent-amber/8 border-accent-amber/15',
}

const statusMap = {
  active: { status: 'healthy', label: 'Activo' },
  inactive: { status: 'warning', label: 'Inactivo' },
  invited: { status: 'info', label: 'Invitado' },
}

const UsersPage = () => {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { showSuccess } = useToast()
  const [users, setUsers] = useState(mockUsers)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', role: 'viewer' })

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const openCreate = () => {
    setEditingUser(null)
    setForm({ name: '', email: '', role: 'viewer' })
    setShowModal(true)
  }

  const openEdit = (u) => {
    setEditingUser(u)
    setForm({ name: u.name, email: u.email, role: u.role })
    setShowModal(true)
  }

  const handleSave = () => {
    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, name: form.name, email: form.email, role: form.role } : u))
    } else {
      setUsers(prev => [...prev, { id: Date.now(), name: form.name, email: form.email, role: form.role, status: 'invited', lastAccess: '-' }])
    }
    setShowModal(false)
    showSuccess(editingUser ? 'Usuario actualizado' : 'Usuario creado')
  }

  const handleDelete = (id) => {
    setUsers(prev => prev.filter(u => u.id !== id))
    setShowDeleteModal(null)
    showSuccess('Usuario eliminado')
  }

  const handleInviteLink = () => {
    navigator.clipboard.writeText(`https://app.hawkscope.io/invite/${btoa(Date.now().toString()).slice(0, 12)}`)
    showSuccess(t('users.linkGenerated'))
  }

  const isAdmin = user?.role === 'admin'

  return (
    <StaggerContainer className="space-y-5">
      <StaggerItem>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-primary mb-0.5">{t('users.title')}</h1>
            <p className="text-xs text-text-secondary">{t('users.subtitle')}</p>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <button onClick={handleInviteLink} className="btn-secondary flex items-center gap-2 text-xs px-3 py-1.5">
                <Icon name="link" size={13} />
                <span>{t('users.inviteLink')}</span>
              </button>
              <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-xs px-3 py-1.5">
                <Icon name="plus" size={13} />
                <span>{t('users.addUser')}</span>
              </button>
            </div>
          )}
        </div>
      </StaggerItem>

      {/* Users Table */}
      <StaggerItem>
        <GlassCard padding="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {[t('users.name'), t('users.email'), t('users.role'), t('users.status'), t('users.lastAccess'), t('users.actions')].map(h => (
                    <th key={h} className="text-left text-[9px] text-text-muted uppercase tracking-widest font-medium px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <motion.tr
                    key={u.id}
                    className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.015] transition-colors"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-cyan/10 to-accent-purple/10 border border-white/[0.06] flex items-center justify-center text-[10px] font-bold text-accent-cyan">
                          {u.name.charAt(0)}
                        </div>
                        <span className="text-xs text-text-primary font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[11px] text-text-secondary font-mono">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${roleColors[u.role]}`}>
                        {u.role === 'admin' ? t('users.admin') : u.role === 'operator' ? t('users.operator') : t('users.viewer')}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge
                        status={statusMap[u.status]?.status || 'warning'}
                        label={u.status === 'active' ? t('users.active') : u.status === 'inactive' ? t('users.inactive') : t('users.invited')}
                        size="xs"
                      />
                    </td>
                    <td className="px-5 py-3 text-[10px] text-text-muted font-mono">{u.lastAccess}</td>
                    <td className="px-5 py-3">
                      {isAdmin && u.email !== user?.email && (
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-text-muted hover:text-accent-cyan hover:bg-accent-cyan/5 transition-all">
                            <Icon name="edit" size={13} />
                          </button>
                          <button onClick={() => setShowDeleteModal(u.id)} className="p-1.5 rounded-lg text-text-muted hover:text-status-critical hover:bg-status-critical/5 transition-all">
                            <Icon name="trash-2" size={13} />
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </StaggerItem>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} />
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div
                className="glass-card w-full max-w-sm p-6"
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={e => e.stopPropagation()}
              >
                <h3 className="text-base font-bold text-text-primary mb-4">
                  {editingUser ? t('users.editUser') : t('users.createUser')}
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">{t('users.name')}</label>
                    <input name="name" value={form.name} onChange={handleChange} className="input-field text-xs" placeholder="Nombre completo" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">{t('users.email')}</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field text-xs" placeholder="email@empresa.com" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">{t('users.role')}</label>
                    <select name="role" value={form.role} onChange={handleChange} className="input-field text-xs py-2.5">
                      <option value="admin">{t('users.admin')}</option>
                      <option value="operator">{t('users.operator')}</option>
                      <option value="viewer">{t('users.viewer')}</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 text-sm py-2">{t('common.cancel')}</button>
                  <button onClick={handleSave} className="btn-primary flex-1 text-sm py-2 flex items-center justify-center gap-1.5">
                    <Icon name="check" size={13} />
                    {t('common.save')}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteModal && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDeleteModal(null)} />
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div
                className="glass-card w-full max-w-xs p-6 glow-red"
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-status-critical/10 border border-status-critical/20 flex items-center justify-center">
                    <Icon name="trash-2" size={22} className="text-status-critical" />
                  </div>
                </div>
                <div className="text-center mb-5">
                  <h3 className="text-sm font-bold text-text-primary mb-1">{t('users.deleteUser')}</h3>
                  <p className="text-xs text-text-secondary">{t('users.deleteConfirm')}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowDeleteModal(null)} className="btn-secondary flex-1 text-sm py-2">{t('common.cancel')}</button>
                  <motion.button
                    onClick={() => handleDelete(showDeleteModal)}
                    className="btn-danger flex-1 text-sm py-2 flex items-center justify-center gap-1.5"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  >
                    <Icon name="trash-2" size={13} />
                    {t('common.delete')}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </StaggerContainer>
  )
}

export default UsersPage
