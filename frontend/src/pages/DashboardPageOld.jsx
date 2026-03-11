import React from 'react'

const DashboardPage = () => {
  const stats = [
    { title: 'Recursos Activos', value: '24', change: '+2', positive: true },
    { title: 'Alertas Críticas', value: '3', change: '-1', positive: true },
    { title: 'Score Seguridad', value: '92%', change: '+5%', positive: true },
    { title: 'Auditorías Pendientes', value: '7', change: '+3', positive: false },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Dashboard Principal</h1>
        <p className="text-text-secondary">Vista general del estado del sistema DevSecOps</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
              </div>
              <div className={`text-sm font-medium ${stat.positive ? 'text-accent-cyan' : 'text-alert-red'}`}>
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-primary mb-4">Uso de Recursos</h3>
          <div className="h-64 bg-tertiary rounded-lg flex items-center justify-center">
            <p className="text-text-secondary">Gráfico de recursos</p>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-primary mb-4">Tendencias de Seguridad</h3>
          <div className="h-64 bg-tertiary rounded-lg flex items-center justify-center">
            <p className="text-text-secondary">Gráfico de seguridad</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-primary mb-4">Actividad Reciente</h3>
        <div className="space-y-3">
          {[
            { action: 'Nueva alerta de seguridad', time: 'Hace 5 minutos', type: 'alert' },
            { action: 'Auditoría completada', time: 'Hace 1 hora', type: 'success' },
            { action: 'Recurso actualizado', time: 'Hace 2 horas', type: 'info' },
            { action: 'Mantenimiento programado', time: 'Hace 3 horas', type: 'warning' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-tertiary rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'alert' ? 'bg-alert-red' :
                  activity.type === 'success' ? 'bg-accent-cyan' :
                  activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}></div>
                <span className="text-primary">{activity.action}</span>
              </div>
              <span className="text-sm text-text-secondary">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
