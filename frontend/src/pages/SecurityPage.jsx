import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import GlassCard from '../components/GlassCard'
import StatusBadge from '../components/StatusBadge'
import Icon from '../components/icons/Icon'
import { StaggerContainer, StaggerItem } from '../components/animations/StaggerContainer'
import securityService from '../services/securityService'

const severityColors = {
  critical: { text: 'text-status-critical', bg: 'bg-status-critical/5', border: 'border-status-critical/10', dot: 'bg-status-critical' },
  high: { text: 'text-status-critical', bg: 'bg-status-critical/5', border: 'border-status-critical/10', dot: 'bg-status-critical' },
  warning: { text: 'text-status-warning', bg: 'bg-status-warning/5', border: 'border-status-warning/10', dot: 'bg-status-warning' },
  medium: { text: 'text-status-warning', bg: 'bg-status-warning/5', border: 'border-status-warning/10', dot: 'bg-status-warning' },
  info: { text: 'text-accent-blue', bg: 'bg-accent-blue/5', border: 'border-accent-blue/10', dot: 'bg-accent-blue' },
  low: { text: 'text-accent-blue', bg: 'bg-accent-blue/5', border: 'border-accent-blue/10', dot: 'bg-accent-blue' },
}

const SecurityPage = () => {
  const [activeTab, setActiveTab] = useState('threats')

  const { data: threatsRaw } = useQuery({
    queryKey: ['security-threats'],
    queryFn: () => securityService.getThreats().then(r => r.data || []),
    refetchInterval: 30000,
    retry: 2,
  })

  const { data: vulnsRaw } = useQuery({
    queryKey: ['security-vulnerabilities'],
    queryFn: () => securityService.getVulnerabilities().then(r => r.data || []),
    refetchInterval: 60000,
    retry: 2,
  })

  const { data: rulesRaw } = useQuery({
    queryKey: ['security-firewall'],
    queryFn: () => securityService.getFirewallRules().then(r => r.data || []),
    refetchInterval: 60000,
    retry: 2,
  })

  const threats = Array.isArray(threatsRaw) ? threatsRaw : []
  const vulnerabilities = Array.isArray(vulnsRaw) ? vulnsRaw : []
  const firewallRules = Array.isArray(rulesRaw) ? rulesRaw : []

  const blockedToday = threats.reduce((acc, t) => acc + (t.status === 'blocked' ? (t.attemptCount || 0) : 0), 0)
  const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical' || v.severity === 'high').length
  const activeRules = firewallRules.filter(r => r.enabled).length

  // Calculate security score based on real data
  const securityScore = useMemo(() => {
    if (threats.length === 0 && vulnerabilities.length === 0) return 100
    let score = 100
    score -= threats.filter(t => t.status === 'monitoring').length * 5
    score -= criticalVulns * 8
    score -= vulnerabilities.filter(v => v.status === 'pending').length * 3
    return Math.max(0, Math.min(100, score))
  }, [threats, vulnerabilities, criticalVulns])

  const totalItems = threats.length + vulnerabilities.length + firewallRules.length
  const isEmpty = totalItems === 0

  return (
    <StaggerContainer className="space-y-5">
      <StaggerItem>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-primary mb-0.5">Centro de Seguridad</h1>
            <p className="text-xs text-text-secondary">Deteccion de amenazas, vulnerabilidades y reglas de firewall</p>
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-status-healthy/5 border border-status-healthy/10"
              animate={{ boxShadow: ['0 0 0px rgba(16,185,129,0)', '0 0 12px rgba(16,185,129,0.1)', '0 0 0px rgba(16,185,129,0)'] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <Icon name="shield-check" size={14} className="text-status-healthy" />
              <span className="text-[10px] text-status-healthy font-medium">Defensas Activas</span>
            </motion.div>
          </div>
        </div>
      </StaggerItem>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StaggerItem>
          <GlassCard padding="p-5" className="relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[9px] text-text-muted uppercase tracking-widest mb-2">Security Score</p>
              <div className="flex items-end gap-2">
                <span className={`text-3xl font-bold font-mono ${securityScore >= 80 ? 'text-status-healthy' : securityScore >= 50 ? 'text-status-warning' : 'text-status-critical'}`}>{securityScore}</span>
                <span className="text-xs text-text-muted mb-1">/100</span>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-surface-3 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${securityScore >= 80 ? 'bg-status-healthy' : securityScore >= 50 ? 'bg-status-warning' : 'bg-status-critical'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${securityScore}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  style={{ boxShadow: '0 0 8px rgba(16,185,129,0.4)' }}
                />
              </div>
            </div>
          </GlassCard>
        </StaggerItem>
        <StaggerItem>
          <GlassCard padding="p-5" hover={false}>
            <p className="text-[9px] text-text-muted uppercase tracking-widest mb-2">Amenazas Bloqueadas</p>
            <p className="text-3xl font-bold font-mono text-text-primary">{blockedToday}</p>
            <p className="text-[10px] text-text-muted mt-1">total detectadas: {threats.length}</p>
          </GlassCard>
        </StaggerItem>
        <StaggerItem>
          <GlassCard padding="p-5" hover={false}>
            <p className="text-[9px] text-text-muted uppercase tracking-widest mb-2">Vulnerabilidades</p>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold font-mono text-text-primary">{vulnerabilities.length}</span>
              {criticalVulns > 0 && (
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-[10px] text-status-critical font-mono">{criticalVulns} criticas</span>
                </div>
              )}
            </div>
          </GlassCard>
        </StaggerItem>
        <StaggerItem>
          <GlassCard padding="p-5" hover={false}>
            <p className="text-[9px] text-text-muted uppercase tracking-widest mb-2">Reglas Firewall</p>
            <p className="text-3xl font-bold font-mono text-text-primary">{activeRules}</p>
            <p className="text-[10px] text-text-muted mt-1">de {firewallRules.length} activas</p>
          </GlassCard>
        </StaggerItem>
      </div>

      {/* Empty state */}
      {isEmpty ? (
        <StaggerItem>
          <GlassCard padding="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent-cyan/5 border border-accent-cyan/10 flex items-center justify-center mb-5">
                <Icon name="shield" size={28} className="text-accent-cyan/40" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Sin Eventos de Seguridad</h3>
              <p className="text-xs text-text-secondary max-w-sm">
                Las amenazas, vulnerabilidades y reglas de firewall se registraran automaticamente conforme los agentes monitoreen tu infraestructura.
              </p>
            </div>
          </GlassCard>
        </StaggerItem>
      ) : (
        <>
          {/* Tabs */}
          <StaggerItem>
            <div className="flex items-center gap-1 border-b border-white/[0.04] pb-0">
              {[
                { key: 'threats', label: 'Amenazas', icon: 'skull', count: threats.length },
                { key: 'vulnerabilities', label: 'Vulnerabilidades', icon: 'bug', count: vulnerabilities.length },
                { key: 'firewall', label: 'Firewall', icon: 'shield', count: firewallRules.length },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-all ${
                    activeTab === tab.key ? 'text-accent-cyan' : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  <Icon name={tab.icon} size={14} />
                  <span>{tab.label}</span>
                  <span className="text-[9px] font-mono opacity-60">{tab.count}</span>
                  {activeTab === tab.key && (
                    <motion.div
                      layoutId="security-tab"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent-cyan"
                      style={{ boxShadow: '0 0 8px rgba(0,240,255,0.4)' }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </StaggerItem>

          {/* Threats */}
          {activeTab === 'threats' && (
            <StaggerItem>
              {threats.length === 0 ? (
                <GlassCard padding="p-8">
                  <div className="flex flex-col items-center text-center text-text-muted">
                    <Icon name="shield-check" size={32} className="mb-3 opacity-30" />
                    <p className="text-sm">Sin amenazas detectadas</p>
                  </div>
                </GlassCard>
              ) : (
                <div className="space-y-2">
                  {threats.map((threat, i) => {
                    const colors = severityColors[threat.severity] || severityColors.info
                    return (
                      <motion.div key={threat.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <GlassCard padding="p-4" hover={false} glow={threat.severity === 'critical' ? 'red' : 'none'} className={`border ${colors.border}`}>
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center flex-shrink-0`}>
                              <Icon name={threat.severity === 'critical' ? 'skull' : 'alert-triangle'} size={18} className={colors.text} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-sm font-semibold text-text-primary">{threat.type}</span>
                                <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${colors.bg} ${colors.text} font-medium`}>{threat.severity}</span>
                              </div>
                              <div className="flex items-center gap-3 text-[10px] text-text-muted">
                                <span className="font-mono">{threat.sourceIp || '-'}</span>
                                <span className="font-mono">{threat.detectedAt ? new Date(threat.detectedAt).toLocaleTimeString('es-MX') : '-'}</span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0 hidden sm:block">
                              <p className="text-sm font-bold font-mono text-text-primary">{(threat.attemptCount || 0).toLocaleString()}</p>
                              <p className="text-[9px] text-text-muted">intentos</p>
                            </div>
                            <StatusBadge
                              status={threat.status === 'blocked' ? 'healthy' : threat.status === 'mitigated' ? 'info' : 'warning'}
                              label={threat.status === 'blocked' ? 'Bloqueado' : threat.status === 'mitigated' ? 'Mitigado' : 'Monitoreando'}
                              size="xs"
                              pulse={threat.status === 'monitoring'}
                            />
                          </div>
                        </GlassCard>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </StaggerItem>
          )}

          {/* Vulnerabilities */}
          {activeTab === 'vulnerabilities' && (
            <StaggerItem>
              {vulnerabilities.length === 0 ? (
                <GlassCard padding="p-8">
                  <div className="flex flex-col items-center text-center text-text-muted">
                    <Icon name="shield-check" size={32} className="mb-3 opacity-30" />
                    <p className="text-sm">Sin vulnerabilidades detectadas</p>
                  </div>
                </GlassCard>
              ) : (
                <div className="space-y-2">
                  {vulnerabilities.map((vuln, i) => {
                    const colors = severityColors[vuln.severity] || severityColors.low
                    return (
                      <motion.div key={vuln.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <GlassCard padding="p-4" hover={false} className={`border ${colors.border}`}>
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center flex-shrink-0`}>
                              <Icon name="bug" size={18} className={colors.text} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs font-mono font-semibold text-accent-cyan">{vuln.cveId || '-'}</span>
                                <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${colors.bg} ${colors.text} font-medium`}>{vuln.severity}</span>
                              </div>
                              <p className="text-[11px] text-text-primary mb-0.5">{vuln.description || '-'}</p>
                              <p className="text-[10px] text-text-muted">Componente: <span className="font-mono">{vuln.componentName}</span></p>
                            </div>
                            <div className="text-right flex-shrink-0 hidden sm:block">
                              {vuln.patchedAt && <p className="text-[10px] text-text-muted font-mono">{new Date(vuln.patchedAt).toLocaleDateString('es-MX')}</p>}
                            </div>
                            <StatusBadge
                              status={vuln.status === 'patched' ? 'healthy' : vuln.status === 'pending' ? 'warning' : 'info'}
                              label={vuln.status === 'patched' ? 'Parcheado' : vuln.status === 'pending' ? 'Pendiente' : 'Monitor'}
                              size="xs"
                            />
                          </div>
                        </GlassCard>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </StaggerItem>
          )}

          {/* Firewall */}
          {activeTab === 'firewall' && (
            <StaggerItem>
              {firewallRules.length === 0 ? (
                <GlassCard padding="p-8">
                  <div className="flex flex-col items-center text-center text-text-muted">
                    <Icon name="shield" size={32} className="mb-3 opacity-30" />
                    <p className="text-sm">Sin reglas de firewall configuradas</p>
                  </div>
                </GlassCard>
              ) : (
                <div className="space-y-2">
                  {firewallRules.map((rule, i) => (
                    <motion.div key={rule.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <GlassCard padding="p-4" hover={false} className={!rule.enabled ? 'opacity-50' : ''}>
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            rule.action === 'deny' ? 'bg-status-critical/8 border border-status-critical/10' :
                            rule.action === 'allow' ? 'bg-status-healthy/8 border border-status-healthy/10' :
                            'bg-status-warning/8 border border-status-warning/10'
                          }`}>
                            <Icon
                              name={rule.action === 'deny' ? 'shield-x' : rule.action === 'allow' ? 'shield-check' : 'shield'}
                              size={18}
                              className={
                                rule.action === 'deny' ? 'text-status-critical' :
                                rule.action === 'allow' ? 'text-status-healthy' :
                                'text-status-warning'
                              }
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-medium text-text-primary">{rule.name}</span>
                              <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-medium ${
                                rule.action === 'deny' ? 'bg-status-critical/10 text-status-critical' :
                                rule.action === 'allow' ? 'bg-status-healthy/10 text-status-healthy' :
                                'bg-status-warning/10 text-status-warning'
                              }`}>
                                {rule.action}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-text-muted">
                              <span>Source: <span className="font-mono">{rule.sourceIpRange || '-'}</span></span>
                              <span className="font-mono">{(rule.hitCount || 0).toLocaleString()} hits</span>
                            </div>
                          </div>
                          <div className={`w-8 h-5 rounded-full relative cursor-pointer transition-colors ${
                            rule.enabled ? 'bg-accent-cyan/20' : 'bg-surface-4'
                          }`}>
                            <motion.div
                              className={`absolute top-0.5 w-4 h-4 rounded-full ${
                                rule.enabled ? 'bg-accent-cyan' : 'bg-text-muted'
                              }`}
                              animate={{ left: rule.enabled ? '14px' : '2px' }}
                              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                              style={{ boxShadow: rule.enabled ? '0 0 6px rgba(0,240,255,0.5)' : 'none' }}
                            />
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </div>
              )}
            </StaggerItem>
          )}
        </>
      )}
    </StaggerContainer>
  )
}

export default SecurityPage
