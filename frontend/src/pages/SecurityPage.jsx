import React from 'react'

const SecurityPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Seguridad</h1>
        <p className="text-text-secondary">Panel de control de seguridad y manejo de tokens</p>
      </div>
      
      <div className="card">
        <h3 className="text-lg font-semibold text-primary mb-4">Estado de Seguridad</h3>
        <div className="h-64 bg-tertiary rounded-lg flex items-center justify-center">
          <p className="text-text-secondary">Panel de seguridad en desarrollo</p>
        </div>
      </div>
    </div>
  )
}

export default SecurityPage
