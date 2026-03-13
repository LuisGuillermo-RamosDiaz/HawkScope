import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '../components/GlassCard'
import StatusBadge from '../components/StatusBadge'
import Icon from '../components/icons/Icon'
import { StaggerContainer, StaggerItem } from '../components/animations/StaggerContainer'

const mockServers = [
  { id: 1, name: 'prod-api-01', ip: '10.0.1.10', cpu: 42, ram: 65, disk: 45, status: 'healthy', uptime: '45d 12h', os: 'Ubuntu 22.04', region: 'US-East' },
  { id: 2, name: 'prod-api-02', ip: '10.0.1.11', cpu: 38, ram: 58, disk: 52, status: 'healthy', uptime: '45d 12h', os: 'Ubuntu 22.04', region: 'US-East' },
  { id: 3, name: 'worker-03', ip: '10.0.2.20', cpu: 87, ram: 72, disk: 60, status: 'warning', uptime: '12d 3h', os: 'Debian 12', region: 'US-West' },
  { id: 4, name: 'db-main', ip: '10.0.3.10', cpu: 55, ram: 80, disk: 70, status: 'healthy', uptime: '90d 1h', os: 'Ubuntu 22.04', region: 'US-East' },
  { id: 5, name: 'db-replica', ip: '10.0.3.11', cpu: 30, ram: 45, disk: 68, status: 'healthy', uptime: '90d 1h', os: 'Ubuntu 22.04', region: 'EU-West' },
  { id: 6, name: 'cache-redis', ip: '10.0.4.10', cpu: 12, ram: 35, disk: 15, status: 'healthy', uptime: '60d 8h', os: 'Alpine 3.18', region: 'US-East' },
  { id: 7, name: 'monitor-agent', ip: '10.0.5.10', cpu: 8, ram: 22, disk: 10, status: 'healthy', uptime: '30d 5h', os: 'Alpine 3.18', region: 'US-East' },
  { id: 8, name: 'srv-legacy-12', ip: '10.0.6.50', cpu: 0, ram: 0, disk: 0, status: 'offline', uptime: '0d', os: 'CentOS 7', region: 'EU-West' },
]

const filters = ['Todos', 'Healthy', 'Warning', 'Critical', 'Offline']

const ResourcesPage = () => {
  const [activeFilter, setActiveFilter] = useState('Todos')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedServer, setSelectedServer] = useState(null)

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
    if (value > 80) return 'bg-status-critical'
    if (value > 60) return type === 'cpu' ? 'bg-status-warning' : 'bg-accent-purple'
    return type === 'cpu' ? 'bg-accent-cyan' : type === 'ram' ? 'bg-accent-emerald' : 'bg-accent-blue'
  }

  const getBarGlow = (value) => {
    if (value > 80) return '0 0 8px rgba(239, 68, 68, 0.3)'
    return 'none'
  }

  return (
    <StaggerContainer className="space-y-5">
      <StaggerItem>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-primary mb-0.5">Infraestructura</h1>
            <p className="text-xs text-text-secondary">Monitoreo y gestion de recursos del cluster</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-white/[0.06] overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-all ${viewMode === 'grid' ? 'bg-accent-cyan/10 text-accent-cyan' : 'text-text-muted hover:text-text-secondary'}`}
              >
                <Icon name="layers" size={14} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-all ${viewMode === 'list' ? 'bg-accent-cyan/10 text-accent-cyan' : 'text-text-muted hover:text-text-secondary'}`}
              >
                <Icon name="menu" size={14} />
              </button>
            </div>
            <span className="text-[10px] text-text-muted font-mono px-2 py-1 rounded bg-surface-2 border border-white/[0.04]">
              {mockServers.length} nodos
            </span>
          </div>
        </div>
      </StaggerItem>

      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Healthy', count: statusCounts.Healthy, icon: 'check-circle', color: 'text-status-healthy', bg: 'bg-status-healthy/5', border: 'border-status-healthy/10' },
          { label: 'Warning', count: statusCounts.Warning, icon: 'alert-triangle', color: 'text-status-warning', bg: 'bg-status-warning/5', border: 'border-status-warning/10' },
          { label: 'Critical', count: statusCounts.Critical, icon: 'x-circle', color: 'text-status-critical', bg: 'bg-status-critical/5', border: 'border-status-critical/10' },
          { label: 'Offline', count: statusCounts.Offline, icon: 'monitor', color: 'text-gray-500', bg: 'bg-gray-500/5', border: 'border-gray-500/10' },
        ].map((item) => (
          <StaggerItem key={item.label}>
            <GlassCard padding="p-4" hover={false}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] text-text-muted uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-2xl font-bold font-mono text-text-primary">{item.count}</p>
                </div>
                <div className={`w-9 h-9 rounded-lg ${item.bg} border ${item.border} flex items-center justify-center`}>
                  <Icon name={item.icon} size={16} className={item.color} />
                </div>
              </div>
            </GlassCard>
          </StaggerItem>
        ))}
      </div>

      {/* Filters */}
      <StaggerItem>
        <div className="flex items-center gap-1.5">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-medium uppercase tracking-wider transition-all duration-200 ${
                activeFilter === filter
                  ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/15'
                  : 'text-text-muted hover:text-text-secondary hover:bg-surface-3 border border-transparent'
              }`}
            >
              {filter} <span className="ml-1 font-mono opacity-60">{statusCounts[filter]}</span>
            </button>
          ))}
        </div>
      </StaggerItem>

      {/* Server Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFilter}
          className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-2'}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {filteredServers.map((server, idx) => (
            <motion.div
              key={server.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              {viewMode === 'grid' ? (
                <GlassCard
                  glow={server.status === 'warning' ? 'amber' : server.status === 'critical' ? 'red' : 'none'}
                  className="hover:border-accent-cyan/15 transition-all group"
                  onClick={() => setSelectedServer(selectedServer?.id === server.id ? null : server)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-surface-3/50 border border-white/[0.04] flex items-center justify-center group-hover:border-accent-cyan/10 transition-colors">
                        <Icon name="server" size={15} className="text-text-secondary group-hover:text-accent-cyan transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{server.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] text-text-muted font-mono">{server.ip}</p>
                          <span className="text-[8px] text-text-muted px-1.5 py-0.5 rounded bg-surface-3 border border-white/[0.04]">{server.region}</span>
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={server.status} size="xs" />
                  </div>

                  {server.status !== 'offline' ? (
                    <div className="space-y-2.5">
                      {[
                        { label: 'CPU', value: server.cpu, type: 'cpu' },
                        { label: 'RAM', value: server.ram, type: 'ram' },
                        { label: 'DISK', value: server.disk, type: 'disk' },
                      ].map((metric) => (
                        <div key={metric.label}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] text-text-muted uppercase tracking-wider">{metric.label}</span>
                            <span className={`text-[10px] font-mono font-medium ${
                              metric.value > 80 ? 'text-status-critical' : 'text-text-primary'
                            }`}>{metric.value}%</span>
                          </div>
                          <div className="h-1 rounded-full bg-surface-3 overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${getBarColor(metric.value, metric.type)}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${metric.value}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                              style={{ boxShadow: getBarGlow(metric.value) }}
                            />
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.04]">
                        <span className="text-[9px] text-text-muted">{server.os}</span>
                        <span className="text-[9px] text-text-muted font-mono flex items-center gap-1">
                          <Icon name="clock" size={9} />
                          {server.uptime}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-text-muted">
                      <Icon name="monitor" size={24} className="mb-2 opacity-30" />
                      <p className="text-xs">Nodo fuera de linea</p>
                      <p className="text-[9px] mt-1">{server.os}</p>
                    </div>
                  )}
                </GlassCard>
              ) : (
                /* List view */
                <GlassCard
                  padding="px-4 py-3"
                  hover={false}
                  className="hover:border-accent-cyan/10 transition-all"
                  onClick={() => setSelectedServer(selectedServer?.id === server.id ? null : server)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-surface-3/50 border border-white/[0.04] flex items-center justify-center flex-shrink-0">
                      <Icon name="server" size={14} className="text-text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary">{server.name}</p>
                      <p className="text-[10px] text-text-muted font-mono">{server.ip}</p>
                    </div>
                    {server.status !== 'offline' && (
                      <div className="hidden md:flex items-center gap-6 text-[10px]">
                        <div>
                          <span className="text-text-muted">CPU</span>
                          <span className={`ml-1.5 font-mono font-medium ${server.cpu > 80 ? 'text-status-critical' : 'text-text-primary'}`}>{server.cpu}%</span>
                        </div>
                        <div>
                          <span className="text-text-muted">RAM</span>
                          <span className="ml-1.5 font-mono font-medium text-text-primary">{server.ram}%</span>
                        </div>
                        <div>
                          <span className="text-text-muted">DISK</span>
                          <span className="ml-1.5 font-mono font-medium text-text-primary">{server.disk}%</span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] text-text-muted font-mono hidden sm:block">{server.uptime}</span>
                      <StatusBadge status={server.status} size="xs" />
                    </div>
                  </div>
                </GlassCard>
              )}
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredServers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-text-muted">
          <Icon name="server" size={40} className="mb-3 opacity-30" />
          <p className="text-sm">No hay servidores con el filtro seleccionado</p>
        </div>
      )}
    </StaggerContainer>
  )
}

export default ResourcesPage
