import React from 'react'

const ResourcesPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Recursos</h1>
        <p className="text-text-secondary">Gestión y monitoreo de recursos del sistema</p>
      </div>
      
      <div className="card">
        <h3 className="text-lg font-semibold text-primary mb-4">Lista de Recursos</h3>
        <div className="h-64 bg-tertiary rounded-lg flex items-center justify-center">
          <p className="text-text-secondary">Tabla de recursos en desarrollo</p>
        </div>
      </div>
    </div>
  )
}

export default ResourcesPage
