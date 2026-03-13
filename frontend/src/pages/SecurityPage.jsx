import { useState } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '../components/GlassCard'
import StatusBadge from '../components/StatusBadge'
import Icon from '../components/icons/Icon'
import { StaggerContainer, StaggerItem } from '../components/animations/StaggerContainer'

const threatData = [
  { id: 1, type: 'Brute Force', severity: 'critical', source: '198.51.100.23', target: 'Auth System', time: '14:15', count: 47, status: 'blocked' },
  { id: 2, type: 'SQL Injection', severity: 'critical', source: '203.0.113.45', target: 'API Gateway', time: '13:42', count: 12, status: 'blocked' },
  { id: 3, type: 'Port Scan', severity: 'warning', source: '192.0.2.100', target: 'Firewall', time: '12:58', count: 156, status: 'monitoring' },
  { id: 4, type: 'DDoS Attempt', severity: 'warning', source: 'Multiple', target: 'Load Balancer', time: '12:30', count: 2340, status: 'mitigated' },
  { id: 5, type: 'XSS Attempt', severity: 'info', source: '203.0.113.78', target: 'Web App', time: '11:15', count: 3, status: 'blocked' },
  { id: 6, type: 'Unauthorized Access', severity: 'critical', source: '198.51.100.50', target: 'Admin Panel', time: '10:45', count: 8, status: 'blocked' },
]

const vulnerabilities = [
  { id: 1, cve: 'CVE-2024-1234', severity: 'high', component: 'OpenSSL 3.0.x', description: 'Buffer overflow en TLS handshake', status: 'patched', patchDate: '2024-03-10' },
  { id: 2, cve: 'CVE-2024-5678', severity: 'medium', component: 'nginx 1.24', description: 'HTTP request smuggling', status: 'pending', patchDate: '-' },
  { id: 3, cve: 'CVE-2024-9012', severity: 'low', component: 'Node.js 20.x', description: 'Denial of service en HTTP/2', status: 'patched', patchDate: '2024-03-08' },
  { id: 4, cve: 'CVE-2024-3456', severity: 'critical', component: 'PostgreSQL 15', description: 'SQL injection en pg_dump', status: 'patched', patchDate: '2024-03-09' },
  { id: 5, cve: 'CVE-2024-7890', severity: 'medium', component: 'Redis 7.x', description: 'Auth bypass en cluster mode', status: 'monitoring', patchDate: '-' },
]

const firewallRules = [
  { id: 1, name: 'Block Malicious IPs', type: 'DENY', source: 'Threat Intel Feed', entries: 1247, active: true },
  { id: 2, name: 'Rate Limit API', type: 'LIMIT', source: '0.0.0.0/0', entries: 100, active: true },
  { id: 3, name: 'Allow Internal', type: 'ALLOW', source: '10.0.0.0/8', entries: 1, active: true },
  { id: 4, name: 'GeoBlock Regions', type: 'DENY', source: 'GeoIP Database', entries: 45, active: true },
  { id: 5, name: 'Legacy SSH Access', type: 'ALLOW', source: '192.168.1.0/24', entries: 1, active: false },
]

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

  const securityScore = 87
  const blockedToday = threatData.reduce((acc, t) => acc + (t.status === 'blocked' ? t.count : 0), 0)

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
                <span className="text-3xl font-bold font-mono text-status-healthy">{securityScore}</span>
                <span className="text-xs text-text-muted mb-1">/100</span>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-surface-3 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-status-healthy"
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
            <p className="text-[10px] text-text-muted mt-1">ultimas 24h</p>
          </GlassCard>
        </StaggerItem>
        <StaggerItem>
          <GlassCard padding="p-5" hover={false}>
            <p className="text-[9px] text-text-muted uppercase tracking-widest mb-2">Vulnerabilidades</p>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold font-mono text-text-primary">{vulnerabilities.length}</span>
              <div className="flex items-center gap-1 mb-1">
                <span className="text-[10px] text-status-critical font-mono">{vulnerabilities.filter(v => v.severity === 'critical' || v.severity === 'high').length} criticas</span>
              </div>
            </div>
          </GlassCard>
        </StaggerItem>
        <StaggerItem>
          <GlassCard padding="p-5" hover={false}>
            <p className="text-[9px] text-text-muted uppercase tracking-widest mb-2">Reglas Firewall</p>
            <p className="text-3xl font-bold font-mono text-text-primary">{firewallRules.filter(r => r.active).length}</p>
            <p className="text-[10px] text-text-muted mt-1">de {firewallRules.length} activas</p>
          </GlassCard>
        </StaggerItem>
      </div>

      {/* Tabs */}
      <StaggerItem>
        <div className="flex items-center gap-1 border-b border-white/[0.04] pb-0">
          {[
            { key: 'threats', label: 'Amenazas', icon: 'skull', count: threatData.length },
            { key: 'vulnerabilities', label: 'Vulnerabilidades', icon: 'bug', count: vulnerabilities.length },
            { key: 'firewall', label: 'Firewall', icon: 'shield', count: firewallRules.length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-all ${
                activeTab === tab.key
                  ? 'text-accent-cyan'
                  : 'text-text-muted hover:text-text-secondary'
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

      {/* Tab Content */}
      {activeTab === 'threats' && (
        <StaggerItem>
          <div className="space-y-2">
            {threatData.map((threat, i) => {
              const colors = severityColors[threat.severity] || severityColors.info
              return (
                <motion.div
                  key={threat.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <GlassCard
                    padding="p-4"
                    hover={false}
                    glow={threat.severity === 'critical' ? 'red' : 'none'}
                    className={`border ${colors.border}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center flex-shrink-0`}>
                        <Icon name={threat.severity === 'critical' ? 'skull' : 'alert-triangle'} size={18} className={colors.text} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-text-primary">{threat.type}</span>
                          <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${colors.bg} ${colors.text} font-medium`}>
                            {threat.severity}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-text-muted">
                          <span className="font-mono">{threat.source}</span>
                          <Icon name="arrow-right" size={10} />
                          <span>{threat.target}</span>
                          <span className="font-mono">{threat.time}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 hidden sm:block">
                        <p className="text-sm font-bold font-mono text-text-primary">{threat.count.toLocaleString()}</p>
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
        </StaggerItem>
      )}

      {activeTab === 'vulnerabilities' && (
        <StaggerItem>
          <div className="space-y-2">
            {vulnerabilities.map((vuln, i) => {
              const colors = severityColors[vuln.severity] || severityColors.low
              return (
                <motion.div
                  key={vuln.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <GlassCard padding="p-4" hover={false} className={`border ${colors.border}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center flex-shrink-0`}>
                        <Icon name="bug" size={18} className={colors.text} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-mono font-semibold text-accent-cyan">{vuln.cve}</span>
                          <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${colors.bg} ${colors.text} font-medium`}>
                            {vuln.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-primary mb-0.5">{vuln.description}</p>
                        <p className="text-[10px] text-text-muted">Componente: <span className="font-mono">{vuln.component}</span></p>
                      </div>
                      <div className="text-right flex-shrink-0 hidden sm:block">
                        {vuln.patchDate !== '-' && (
                          <p className="text-[10px] text-text-muted font-mono">{vuln.patchDate}</p>
                        )}
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
        </StaggerItem>
      )}

      {activeTab === 'firewall' && (
        <StaggerItem>
          <div className="space-y-2">
            {firewallRules.map((rule, i) => (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard padding="p-4" hover={false} className={!rule.active ? 'opacity-50' : ''}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      rule.type === 'DENY' ? 'bg-status-critical/8 border border-status-critical/10' :
                      rule.type === 'ALLOW' ? 'bg-status-healthy/8 border border-status-healthy/10' :
                      'bg-status-warning/8 border border-status-warning/10'
                    }`}>
                      <Icon
                        name={rule.type === 'DENY' ? 'shield-x' : rule.type === 'ALLOW' ? 'shield-check' : 'shield'}
                        size={18}
                        className={
                          rule.type === 'DENY' ? 'text-status-critical' :
                          rule.type === 'ALLOW' ? 'text-status-healthy' :
                          'text-status-warning'
                        }
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-text-primary">{rule.name}</span>
                        <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-medium ${
                          rule.type === 'DENY' ? 'bg-status-critical/10 text-status-critical' :
                          rule.type === 'ALLOW' ? 'bg-status-healthy/10 text-status-healthy' :
                          'bg-status-warning/10 text-status-warning'
                        }`}>
                          {rule.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-text-muted">
                        <span>Source: <span className="font-mono">{rule.source}</span></span>
                        <span className="font-mono">{rule.entries} {rule.entries === 1 ? 'entry' : 'entries'}</span>
                      </div>
                    </div>
                    <div className={`w-8 h-5 rounded-full relative cursor-pointer transition-colors ${
                      rule.active ? 'bg-accent-cyan/20' : 'bg-surface-4'
                    }`}>
                      <motion.div
                        className={`absolute top-0.5 w-4 h-4 rounded-full ${
                          rule.active ? 'bg-accent-cyan' : 'bg-text-muted'
                        }`}
                        animate={{ left: rule.active ? '14px' : '2px' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        style={{ boxShadow: rule.active ? '0 0 6px rgba(0,240,255,0.5)' : 'none' }}
                      />
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </StaggerItem>
      )}
    </StaggerContainer>
  )
}

export default SecurityPage
