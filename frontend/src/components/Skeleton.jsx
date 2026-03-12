const Skeleton = ({ className = '', variant = 'rect', width, height }) => {
  const baseClass = 'skeleton-shimmer rounded'

  if (variant === 'circle') {
    return (
      <div
        className={`${baseClass} rounded-full ${className}`}
        style={{ width: width || 40, height: height || 40 }}
      />
    )
  }

  if (variant === 'text') {
    return (
      <div
        className={`${baseClass} rounded-md ${className}`}
        style={{ width: width || '100%', height: height || 14 }}
      />
    )
  }

  return (
    <div
      className={`${baseClass} ${className}`}
      style={{ width: width || '100%', height: height || 20 }}
    />
  )
}

// Pre-built skeleton for KPI cards
export const KpiCardSkeleton = () => (
  <div className="glass-card p-5 space-y-4">
    <div className="flex items-start justify-between">
      <div className="space-y-2 flex-1">
        <Skeleton variant="text" width="60%" height={12} />
        <Skeleton variant="text" width="40%" height={28} />
        <Skeleton variant="text" width="30%" height={12} />
      </div>
      <Skeleton variant="circle" width={44} height={44} className="rounded-xl" />
    </div>
  </div>
)

// Pre-built skeleton for chart
export const ChartSkeleton = () => (
  <div className="glass-card p-5 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton variant="text" width="30%" height={18} />
      <Skeleton variant="text" width="20%" height={14} />
    </div>
    <div className="flex items-end gap-1 h-48 pt-4">
      {Array.from({ length: 24 }).map((_, i) => (
        <Skeleton
          key={i}
          width="100%"
          height={`${20 + Math.random() * 80}%`}
          className="rounded-sm flex-1"
        />
      ))}
    </div>
  </div>
)

// Pre-built skeleton for table rows
export const TableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-4 py-3">
        <Skeleton variant="circle" width={32} height={32} />
        <Skeleton variant="text" width="25%" height={14} />
        <Skeleton variant="text" width="20%" height={14} />
        <Skeleton variant="text" width="15%" height={14} />
        <Skeleton variant="text" width="10%" height={24} className="rounded-full ml-auto" />
      </div>
    ))}
  </div>
)

export default Skeleton
