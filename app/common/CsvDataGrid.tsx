'use client'
import { useMemo, useState } from 'react'
import OptionsMenu from './OptionsMenu'

const CsvDataGrid = ({columns, rows}:{columns: string[], rows: Record<string, string>[]}) => {
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(() => new Set())
  const [maxLines, setMaxLines] = useState<number | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const pageSize = 50
  const visibleColumns = useMemo(() => columns.filter((column) => !hiddenColumns.has(column)), [columns, hiddenColumns])
  const pageCount = useMemo(() => Math.max(1, Math.ceil(rows.length / pageSize)), [rows.length])
  const clampedPageIndex = Math.min(pageIndex, pageCount - 1)
  const pageRows = useMemo(() => {
    const start = clampedPageIndex * pageSize
    const end = start + pageSize
    return rows.slice(start, end)
  }, [rows, clampedPageIndex])
  const toggleColumn = (column: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev)
      if (next.has(column)) next.delete(column)
      else next.add(column)
      return next
    })
  }
  const cellClampStyle = useMemo(() => {
    if (maxLines === null) return undefined
    return {display: '-webkit-box', WebkitLineClamp: maxLines, WebkitBoxOrient: 'vertical', overflow: 'hidden'} as const
  }, [maxLines])
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="text-[var(--foreground)] opacity-70">
          {rows.length} rows
          {pageCount > 1 && (
            <>
              <button onClick={() => setPageIndex(Math.max(0, clampedPageIndex - 1))} disabled={clampedPageIndex === 0} className="ml-2 cursor-pointer disabled:opacity-40">‹</button>
              <span className="mx-1">{clampedPageIndex + 1}/{pageCount}</span>
              <button onClick={() => setPageIndex(Math.min(pageCount - 1, clampedPageIndex + 1))} disabled={clampedPageIndex === pageCount - 1} className="cursor-pointer disabled:opacity-40">›</button>
            </>
          )}
        </div>
        <OptionsMenu columns={columns} hiddenColumns={hiddenColumns} onToggleColumn={toggleColumn} maxLines={maxLines} onSetMaxLines={setMaxLines} />
      </div>
      <div>
        <table className="w-full">
          <thead className="sticky top-0 bg-[var(--background)]">
            <tr>
              {visibleColumns.map((column) => (
                <th key={column} className="text-left font-bold p-2 align-bottom whitespace-nowrap">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {visibleColumns.map((column) => (
                  <td key={column} className="p-2 border-b border-gray-600 align-top">
                    <div className="whitespace-pre-wrap break-words" style={cellClampStyle}>
                      {row[column] || ''}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CsvDataGrid
