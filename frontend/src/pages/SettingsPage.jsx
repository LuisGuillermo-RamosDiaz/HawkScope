import { useState } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '../components/GlassCard'
import Icon from '../components/icons/Icon'
import useAuthStore from '../store/authStore'
import { StaggerContainer, StaggerItem } from '../components/animations/StaggerContainer'

const SettingsPage = () => {
  const { user } = useAuthStore()
  const [activeSection, setActiveSection] = useState('general')
  const [settings, setSettings] = useState({
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
  })

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const sections = [
    { key: 'general', label: 'General', icon: 'settings' },
    { key: 'notifications', label: 'Notificaciones', icon: 'bell' },
    { key: 'security', label: 'Seguridad', icon: 'shield' },
    { key: 'system', label: 'Sistema', icon: 'server' },
  ]

  const Toggle = ({ enabled, onChange }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-10 h-5 rounded-full transition-colors ${
        enabled ? 'bg-accent-cyan/20' : 'bg-surface-4'
      }`}
    >
      <motion.div
        className={`absolute top-0.5 w-4 h-4 rounded-full ${
          enabled ? 'bg-accent-cyan' : 'bg-gray-500'
        }`}
        animate={{ left: enabled ? '22px' : '2px' }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        style={{ boxShadow: enabled ? '0 0 6px rgba(0,240,255,0.5)' : 'none' }}
      />
    </button>
  )

  const SettingRow = ({ label, description, children }) => (
    <div className="flex items-center justify-between py-3.5 border-b border-white/[0.03] last:border-0">
      <div className="flex-1 min-w-0 mr-4">
        <p className="text-sm text-text-primary font-medium">{label}</p>
        {description && <p className="text-[10px] text-text-muted mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  )

  return (
    <StaggerContainer className="space-y-5">
      <StaggerItem>
        <div>
          <h1 className="text-xl font-bold text-text-primary mb-0.5">Configuracion</h1>
          <p className="text-xs text-text-secondary">Preferencias del sistema y cuenta</p>
        </div>
      </StaggerItem>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Sidebar */}
        <StaggerItem>
          <GlassCard padding="p-3" className="lg:sticky lg:top-6">
            {/* User Info */}
            <div className="p-3 mb-3 rounded-lg bg-surface-2/50 border border-white/[0.03]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan/15 to-accent-purple/15 border border-accent-cyan/15 flex items-center justify-center text-accent-cyan text-sm font-bold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{user?.email || 'Usuario'}</p>
                  <p className="text-[9px] text-accent-cyan uppercase tracking-[0.15em] font-medium">{user?.role || 'guest'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-text-muted">
                <Icon name="clock" size={10} />
                <span>Sesion activa</span>
              </div>
            </div>

            {/* Nav */}
            <div className="space-y-0.5">
              {sections.map(section => (
                <button
                  key={section.key}
                  onClick={() => setActiveSection(section.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all text-sm ${
                    activeSection === section.key
                      ? 'bg-accent-cyan/8 text-accent-cyan border border-accent-cyan/10'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.03] border border-transparent'
                  }`}
                >
                  <Icon name={section.icon} size={15} />
                  <span className="font-medium">{section.label}</span>
                </button>
              ))}
            </div>
          </GlassCard>
        </StaggerItem>

        {/* Content */}
        <StaggerItem className="lg:col-span-3">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeSection === 'general' && (
              <GlassCard padding="p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-7 h-7 rounded-lg bg-accent-cyan/8 border border-accent-cyan/10 flex items-center justify-center">
                    <Icon name="settings" size={14} className="text-accent-cyan" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">Configuracion General</h3>
                    <p className="text-[10px] text-text-muted">Preferencias de interfaz y comportamiento</p>
                  </div>
                </div>

                <SettingRow label="Intervalo de Refresh" description="Frecuencia de actualizacion de datos en tiempo real">
                  <select
                    value={settings.refreshInterval}
                    onChange={(e) => updateSetting('refreshInterval', e.target.value)}
                    className="input-field py-1.5 px-3 text-xs w-auto min-w-[120px]"
                  >
                    <option value="5">5 segundos</option>
                    <option value="10">10 segundos</option>
                    <option value="30">30 segundos</option>
                    <option value="60">1 minuto</option>
                  </select>
                </SettingRow>

                <SettingRow label="Idioma" description="Idioma de la interfaz">
                  <select
                    value={settings.language}
                    onChange={(e) => updateSetting('language', e.target.value)}
                    className="input-field py-1.5 px-3 text-xs w-auto min-w-[120px]"
                  >
                    <option value="es">Espanol</option>
                    <option value="en">English</option>
                  </select>
                </SettingRow>

                <SettingRow label="Modo Compacto" description="Reduce el espaciado para mostrar mas informacion">
                  <Toggle enabled={settings.compactMode} onChange={(v) => updateSetting('compactMode', v)} />
                </SettingRow>

                <SettingRow label="Animaciones" description="Habilitar transiciones y efectos visuales">
                  <Toggle enabled={settings.animationsEnabled} onChange={(v) => updateSetting('animationsEnabled', v)} />
                </SettingRow>
              </GlassCard>
            )}

            {activeSection === 'notifications' && (
              <GlassCard padding="p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-7 h-7 rounded-lg bg-accent-amber/8 border border-accent-amber/10 flex items-center justify-center">
                    <Icon name="bell" size={14} className="text-accent-amber" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">Notificaciones</h3>
                    <p className="text-[10px] text-text-muted">Gestiona como recibes las alertas</p>
                  </div>
                </div>

                <SettingRow label="Notificaciones Push" description="Recibir alertas en el navegador">
                  <Toggle enabled={settings.notifications} onChange={(v) => updateSetting('notifications', v)} />
                </SettingRow>

                <SettingRow label="Alertas Sonoras" description="Reproducir sonido en alertas criticas">
                  <Toggle enabled={settings.soundAlerts} onChange={(v) => updateSetting('soundAlerts', v)} />
                </SettingRow>

                <SettingRow label="Reportes por Email" description="Recibir resumen diario de seguridad">
                  <Toggle enabled={settings.emailReports} onChange={(v) => updateSetting('emailReports', v)} />
                </SettingRow>

                <div className="mt-5 p-4 rounded-lg bg-accent-amber/5 border border-accent-amber/10">
                  <div className="flex items-start gap-3">
                    <Icon name="info" size={16} className="text-accent-amber mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-text-primary font-medium mb-0.5">Prioridad de Notificaciones</p>
                      <p className="text-[10px] text-text-muted">Las alertas criticas siempre se muestran independientemente de la configuracion. Las alertas de tipo warning e info respetan las preferencias configuradas.</p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            )}

            {activeSection === 'security' && (
              <GlassCard padding="p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-7 h-7 rounded-lg bg-accent-purple/8 border border-accent-purple/10 flex items-center justify-center">
                    <Icon name="shield" size={14} className="text-accent-purple" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">Seguridad de la Cuenta</h3>
                    <p className="text-[10px] text-text-muted">Autenticacion y control de acceso</p>
                  </div>
                </div>

                <SettingRow label="Autenticacion de Dos Factores" description="Agrega una capa extra de seguridad a tu cuenta">
                  <Toggle enabled={settings.twoFactor} onChange={(v) => updateSetting('twoFactor', v)} />
                </SettingRow>

                <SettingRow label="Auto-Lock de Sesion" description="Bloqueo automatico tras periodo de inactividad">
                  <select
                    value={settings.autoLock}
                    onChange={(e) => updateSetting('autoLock', e.target.value)}
                    className="input-field py-1.5 px-3 text-xs w-auto min-w-[120px]"
                  >
                    <option value="5">5 minutos</option>
                    <option value="15">15 minutos</option>
                    <option value="30">30 minutos</option>
                    <option value="never">Nunca</option>
                  </select>
                </SettingRow>

                <SettingRow label="Timeout de Sesion" description="Tiempo maximo de sesion activa">
                  <select
                    value={settings.sessionTimeout}
                    onChange={(e) => updateSetting('sessionTimeout', e.target.value)}
                    className="input-field py-1.5 px-3 text-xs w-auto min-w-[120px]"
                  >
                    <option value="30">30 minutos</option>
                    <option value="60">1 hora</option>
                    <option value="120">2 horas</option>
                    <option value="480">8 horas</option>
                  </select>
                </SettingRow>

                {/* Session info */}
                <div className="mt-5 p-4 rounded-lg bg-surface-2/50 border border-white/[0.03]">
                  <p className="text-[10px] text-text-muted uppercase tracking-widest mb-3 font-medium">Informacion de Sesion</p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-text-muted">Email</p>
                      <p className="text-text-primary font-mono text-[11px]">{user?.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-text-muted">Rol</p>
                      <p className="text-accent-cyan font-mono text-[11px] uppercase">{user?.role || '-'}</p>
                    </div>
                    <div>
                      <p className="text-text-muted">IP</p>
                      <p className="text-text-primary font-mono text-[11px]">192.168.1.100</p>
                    </div>
                    <div>
                      <p className="text-text-muted">User Agent</p>
                      <p className="text-text-primary font-mono text-[11px] truncate">Chrome 122.0</p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            )}

            {activeSection === 'system' && (
              <GlassCard padding="p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-7 h-7 rounded-lg bg-accent-emerald/8 border border-accent-emerald/10 flex items-center justify-center">
                    <Icon name="server" size={14} className="text-accent-emerald" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">Configuracion del Sistema</h3>
                    <p className="text-[10px] text-text-muted">Solo disponible para administradores</p>
                  </div>
                </div>

                {user?.role === 'admin' ? (
                  <>
                    <SettingRow label="Rate Limit API" description="Limite de solicitudes por minuto por usuario">
                      <select
                        value={settings.apiRateLimit}
                        onChange={(e) => updateSetting('apiRateLimit', e.target.value)}
                        className="input-field py-1.5 px-3 text-xs w-auto min-w-[120px]"
                      >
                        <option value="50">50 req/min</option>
                        <option value="100">100 req/min</option>
                        <option value="200">200 req/min</option>
                        <option value="500">500 req/min</option>
                      </select>
                    </SettingRow>

                    <SettingRow label="Retencion de Logs" description="Tiempo que se conservan los registros de auditoria">
                      <select
                        value={settings.logRetention}
                        onChange={(e) => updateSetting('logRetention', e.target.value)}
                        className="input-field py-1.5 px-3 text-xs w-auto min-w-[120px]"
                      >
                        <option value="7">7 dias</option>
                        <option value="30">30 dias</option>
                        <option value="90">90 dias</option>
                        <option value="365">1 ano</option>
                      </select>
                    </SettingRow>

                    <SettingRow label="Backups Automaticos" description="Frecuencia de respaldo de la base de datos">
                      <select
                        value={settings.backupSchedule}
                        onChange={(e) => updateSetting('backupSchedule', e.target.value)}
                        className="input-field py-1.5 px-3 text-xs w-auto min-w-[120px]"
                      >
                        <option value="hourly">Cada hora</option>
                        <option value="daily">Diario</option>
                        <option value="weekly">Semanal</option>
                      </select>
                    </SettingRow>

                    {/* System Info */}
                    <div className="mt-5 p-4 rounded-lg bg-surface-2/50 border border-white/[0.03]">
                      <p className="text-[10px] text-text-muted uppercase tracking-widest mb-3 font-medium">Informacion del Sistema</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        {[
                          { label: 'Version', value: 'v2.0.0' },
                          { label: 'API', value: 'v1 (REST)' },
                          { label: 'Base de Datos', value: 'PostgreSQL 15' },
                          { label: 'Cache', value: 'Redis 7.2' },
                        ].map(item => (
                          <div key={item.label}>
                            <p className="text-text-muted">{item.label}</p>
                            <p className="text-text-primary font-mono text-[11px]">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-text-muted">
                    <div className="w-14 h-14 rounded-xl bg-surface-3 border border-white/[0.04] flex items-center justify-center mb-4">
                      <Icon name="lock" size={24} className="text-text-muted" />
                    </div>
                    <p className="text-sm font-medium mb-1">Acceso Restringido</p>
                    <p className="text-[11px] text-text-muted text-center max-w-xs">
                      Solo los administradores pueden modificar la configuracion del sistema. Contacta a tu admin si necesitas cambios.
                    </p>
                  </div>
                )}
              </GlassCard>
            )}

            {/* Save button */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-[10px] text-text-muted">Los cambios se aplican automaticamente</p>
              <motion.button
                className="btn-primary flex items-center gap-2 text-xs px-4 py-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon name="save" size={13} />
                <span>Guardar Cambios</span>
              </motion.button>
            </div>
          </motion.div>
        </StaggerItem>
      </div>
    </StaggerContainer>
  )
}

export default SettingsPage
