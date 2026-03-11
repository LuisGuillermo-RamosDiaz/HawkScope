import React from 'react'
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const MetricsChart = ({ data = [], loading = false }) => {
  // Formatear datos para Recharts
  const chartData = data.map((item, index) => ({
    time: index % 10 === 0 ? `${index}s` : '', // Mostrar etiquetas cada 10 segundos
    cpu: item.cpu || 0,
    ram: item.ram || 0
  }))

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-secondary border border-gray-600 p-3 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-primary mb-2">{`Tiempo: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}%`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="h-80 bg-tertiary rounded-lg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-cyan"></div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-80 bg-tertiary rounded-lg flex items-center justify-center">
        <p className="text-text-secondary">No hay datos disponibles</p>
      </div>
    )
  }

  return (
    <div className="h-80 bg-tertiary rounded-lg p-4">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="time" 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
          <YAxis 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ color: '#9CA3AF' }}
            iconType="line"
          />
          <Line 
            type="monotone" 
            dataKey="cpu" 
            stroke="#36BFB1" 
            strokeWidth={2}
            name="CPU"
            dot={false}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="ram" 
            stroke="#FF4C4C" 
            strokeWidth={2}
            name="RAM"
            dot={false}
            activeDot={{ r: 6 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default MetricsChart
