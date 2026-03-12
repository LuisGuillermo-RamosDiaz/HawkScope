import { useState } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '../components/GlassCard'
import StatusBadge from '../components/StatusBadge'
import Icon from '../components/icons/Icon'
import { StaggerContainer, StaggerItem } from '../components/animations/StaggerContainer'

const mockServers = [
  { id: 1, name: 'prod-api-01', ip: '10.0.1.10', cpu: 42, ram: 65, status: 'healthy', uptime: '45d 12h', os: 'Ubuntu 22.04' },
  { id: 2, name: 'prod-api-02', ip: '10.0.1.11', cpu: 38, ram: 58, status: 'healthy', uptime: '45d 12h', os: 'Ubuntu 22.04' },
  { id: 3, name: 'worker-03', ip: '10.0.2.20', cpu: 87, ram: 72, status: 'warning', uptime: '12d 3h', os: 'Debian 12' },
  { id: 4, name: 'db-main', ip: '10.0.3.10', cpu: 55, ram: 80, status: 'healthy', uptime: '90d 1h', os: 'Ubuntu 22.04' },
  { id: 5, name: 'db-replica', ip: '10.0.3.11', cpu: 30, ram: 45, status: 'healthy', uptime: '90d 1h', os: 'Ubuntu 22.04' },
  { id: 6, name: 'cache-redis', ip: '10.0.4.10', cpu: 12, ram: 35, status: 'healthy', uptime: '60d 8h', os: 'Alpine 3.18' },
  { id: 7, name: 'monitor-agent', ip: '10.0.5.10', cpu: 8, ram: 22, status: 'healthy', uptime: '30d 5h', os: 'Alpine 3.18' },
  { id: 8, name: 'srv-legacy-12', ip: '10.0.6.50', cpu: 0, ram: 0, status: 'offline', uptime: '0d', os: 'CentOS 7' },
]

const filters = ['Todos', 'Healthy', 'Warning', 'Critical', 'Offline']

const ResourcesPage = () => {
  const [activeFilter, setActiveFilter] = useState('Todos')

  const filteredServers = activeFilter === 'Todos'
    ? mockServers
    : mockServers.filter(s => s.status === activeFilter.toLowerCase())

  const statusCounts = {
    Todos: mockServers.length,
    Healthy: mockServers.filter(s => s.status === 'healthy').length,
    Warning: mockServers.filter(s => s.status === 'warning').length,
    Critical: mockServers.filter(s => s.status === 'critical').length,
    Offline: mockServers.filter(s => s.status === 'offline').length,
  }

  const getBarColor = (value, type) => {
    if (type === 'cpu') {
      if (value > 80) return 'bg-status-critical'
      if (value > 60) return 'bg-status-warning'
      return 'bg-accent-cyan'
    }
    if (value > 80) return 'bg-status-critical'
    if (value > 60) return 'bg-accent-purple'
    return 'bg-accent-emerald'
  }

  return (
    <StaggerContainer className="space-y-6">
      <StaggerItem>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-1">Recursos</h1>
            <p className="text-sm text-text-secondary">Gestión y monitoreo de infraestructura</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-secondary font-mono">{mockServers.length} nodos</span>
          </div>
        </div>
      </StaggerItem>

      {/* Filters */}
      <StaggerItem>
        <div className="flex items-center gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                activeFilter === filter
                  ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-3 border border-transparent'
              }`}
            >
              {filter} <span className="ml-1 font-mono opacity-60">{statusCounts[filter]}</span>
            </button>
          ))}
        </div>
      </StaggerItem>

      {/* Server Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredServers.map((server) => (
          <StaggerItem key={server.id}>
            <GlassCard
              glow={server.status === 'warning' ? 'amber' : server.status === 'critical' ? 'red' : 'none'}
              className="hover:border-accent-cyan/20 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-3 border border-border-subtle flex items-center justify-center">
                    <Icon name="server" size={16} className="text-text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{server.name}</p>
                    <p className="text-[11px] text-text-muted font-mono">{server.ip}</p>
                  </div>
                </div>
                <StatusBadge status={server.status} size="xs" />
              </div>

              {server.status !== 'offline' && (
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-text-secondary uppercase tracking-wider">CPU</span>
                      <span className="text-[11px] font-mono text-text-primary">{server.cpu}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${getBarColor(server.cpu, 'cpu')}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${server.cpu}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-text-secondary uppercase tracking-wider">RAM</span>
                      <span className="text-[11px] font-mono text-text-primary">{server.ram}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${getBarColor(server.ram, 'ram')}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${server.ram}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                    <span className="text-[10px] text-text-muted">{server.os}</span>
                    <span className="text-[10px] text-text-muted font-mono">↑ {server.uptime}</span>
                  </div>
                </div>
              )}

              {server.status === 'offline' && (
                <div className="flex items-center justify-center py-4 text-text-muted">
                  <p className="text-xs">Nodo fuera de línea</p>
                </div>
              )}
            </GlassCard>
          </StaggerItem>
        ))}
      </div>
    </StaggerContainer>
  )
}

export default ResourcesPage
