import { motion } from 'framer-motion'

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

export const KpiCardSkeleton = () => (
  <div className="glass-card p-5 space-y-4">
    <div className="flex items-start justify-between">
      <div className="space-y-3 flex-1">
        <Skeleton variant="text" width="55%" height={10} />
        <Skeleton variant="text" width="35%" height={26} />
        <Skeleton variant="text" width="25%" height={10} />
      </div>
      <Skeleton variant="circle" width={44} height={44} className="rounded-xl" />
    </div>
    <motion.div
      className="h-[2px] rounded-full skeleton-shimmer"
      initial={{ width: 0 }}
      animate={{ width: '60%' }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
    />
  </div>
)

export const ChartSkeleton = () => (
  <div className="glass-card p-5 space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <Skeleton variant="circle" width={28} height={28} className="rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton variant="text" width={120} height={14} />
          <Skeleton variant="text" width={80} height={9} />
        </div>
      </div>
      <Skeleton variant="text" width={80} height={14} />
    </div>
    <div className="flex items-end gap-1 h-48 pt-4">
      {Array.from({ length: 20 }).map((_, i) => (
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

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-0">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-white/[0.03]">
        <Skeleton variant="circle" width={28} height={28} className="rounded-lg" />
        <Skeleton variant="text" width="22%" height={13} />
        <Skeleton variant="text" width="18%" height={13} />
        <Skeleton variant="text" width="15%" height={13} />
        <Skeleton variant="text" width="10%" height={22} className="rounded-full ml-auto" />
      </div>
    ))}
  </div>
)

export default Skeleton
