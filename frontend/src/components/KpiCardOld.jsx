import React from 'react'

const KpiCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend = null, 
  status = 'normal', // normal, success, warning, danger
  onClick = null 
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-400 bg-green-400 bg-opacity-10 border-green-400'
      case 'warning':
        return 'text-yellow-400 bg-yellow-400 bg-opacity-10 border-yellow-400'
      case 'danger':
        return 'text-alert-red bg-alert-red bg-opacity-10 border-alert-red'
      default:
        return 'text-accent-cyan bg-accent-cyan bg-opacity-10 border-accent-cyan'
    }
  }

  const getTrendIcon = () => {
    if (!trend) return null
    return trend > 0 ? '📈' : trend < 0 ? '📉' : '➡️'
  }

  const getTrendColor = () => {
    if (!trend) return ''
    return trend > 0 ? 'text-green-400' : trend < 0 ? 'text-alert-red' : 'text-text-secondary'
  }

  return (
    <div 
      className={`card p-6 cursor-pointer transition-all duration-200 hover:scale-105 ${onClick ? 'hover:shadow-xl' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-text-secondary mb-1">{title}</h3>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-primary">{value}</span>
            {subtitle && (
              <span className="text-sm text-text-secondary">{subtitle}</span>
            )}
          </div>
          
          {trend !== null && (
            <div className={`flex items-center space-x-1 mt-2 ${getTrendColor()}`}>
              <span className="text-sm">{getTrendIcon()}</span>
              <span className="text-xs font-medium">
                {Math.abs(trend)}%
              </span>
            </div>
          )}
        </div>
        
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl border ${getStatusColor()}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export default KpiCard
