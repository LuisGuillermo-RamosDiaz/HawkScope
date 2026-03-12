import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from './icons/Icon'

const DataTable = ({
  columns = [],
  data = [],
  pageSize = 8,
  emptyMessage = 'No hay datos disponibles',
  emptyIcon = 'file-search',
  onRowClick = null,
  className = '',
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(data.length / pageSize)
  const startIdx = (currentPage - 1) * pageSize
  const visibleData = data.slice(startIdx, startIdx + pageSize)

  if (!data || data.length === 0) {
    return (
      <motion.div
        className={`flex flex-col items-center justify-center py-16 ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Icon name={emptyIcon} size={48} className="text-text-muted mb-4" />
        <p className="text-text-secondary text-sm">{emptyMessage}</p>
      </motion.div>
    )
  }

  return (
    <div className={className}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`text-left text-text-secondary font-medium px-4 py-3 text-xs uppercase tracking-wider ${col.headerClass || ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="wait">
              {visibleData.map((row, rowIdx) => (
                <motion.tr
                  key={row.id || startIdx + rowIdx}
                  className={`border-b border-border-subtle transition-colors duration-150 ${
                    onRowClick ? 'cursor-pointer hover:bg-surface-3' : 'hover:bg-surface-2'
                  }`}
                  onClick={() => onRowClick?.(row)}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: rowIdx * 0.03 }}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 text-text-primary ${col.cellClass || ''}`}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle">
          <span className="text-xs text-text-secondary">
            {startIdx + 1}–{Math.min(startIdx + pageSize, data.length)} de {data.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-3 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Icon name="chevron-left" size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
              Math.max(0, currentPage - 3),
              currentPage + 2
            ).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 text-xs rounded-md transition-colors ${
                  page === currentPage
                    ? 'bg-accent-cyan text-surface-base font-semibold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-3'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-3 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Icon name="chevron-right" size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable
