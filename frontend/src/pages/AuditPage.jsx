import React from 'react'

const AuditPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Auditoría DevSecOps</h1>
        <p className="text-text-secondary">Tablas de auditoría y registros de seguridad</p>
      </div>
      
      <div className="card">
        <h3 className="text-lg font-semibold text-primary mb-4">Registros de Auditoría</h3>
        <div className="h-64 bg-tertiary rounded-lg flex items-center justify-center">
          <p className="text-text-secondary">Tabla de auditoría en desarrollo</p>
        </div>
      </div>
    </div>
  )
}

export default AuditPage
