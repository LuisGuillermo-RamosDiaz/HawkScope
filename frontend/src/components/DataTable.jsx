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
        <div className="w-14 h-14 rounded-xl bg-surface-3 border border-white/[0.04] flex items-center justify-center mb-4">
          <Icon name={emptyIcon} size={28} className="text-text-muted" />
        </div>
        <p className="text-text-secondary text-sm">{emptyMessage}</p>
      </motion.div>
    )
  }

  return (
    <div className={className}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`text-left text-text-muted font-medium px-4 py-3 text-[10px] uppercase tracking-widest ${col.headerClass || ''}`}
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
                  className={`border-b border-white/[0.03] transition-colors duration-150 ${
                    onRowClick ? 'cursor-pointer hover:bg-accent-cyan/[0.02]' : 'hover:bg-white/[0.015]'
                  }`}
                  onClick={() => onRowClick?.(row)}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: rowIdx * 0.02 }}
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.04]">
          <span className="text-[10px] text-text-muted font-mono">
            {startIdx + 1}-{Math.min(startIdx + pageSize, data.length)} de {data.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/[0.04] disabled:opacity-25 disabled:cursor-not-allowed transition-all"
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
                className={`w-7 h-7 text-[10px] rounded-lg transition-all font-mono ${
                  page === currentPage
                    ? 'bg-accent-cyan/15 text-accent-cyan font-semibold border border-accent-cyan/15'
                    : 'text-text-muted hover:text-text-secondary hover:bg-white/[0.04]'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/[0.04] disabled:opacity-25 disabled:cursor-not-allowed transition-all"
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
