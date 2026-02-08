'use client'
import { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import OptionsMenu from './OptionsMenu'
import ImageGalleryModal from './ImageGalleryModal'
import CellContent from './CellContent'
import { getCellContent, extractAllImages } from './cellRenderers'

type EditingCell = { rowIndex: number; column: string; isHeader?: boolean } | null
type SortConfig = { column: string; direction: 'asc' | 'desc' } | null
type FileInfo = { topic: string; domain: string; file: string; source?: string }

const CsvDataGrid = ({columns: initialColumns, rows: initialRows, fileInfo, onDataChange}:{columns: string[], rows: Record<string, string>[], fileInfo?: FileInfo, onDataChange?: (columns: string[], rows: Record<string, string>[]) => void}) => {
  const [localColumns, setLocalColumns] = useState<string[] | null>(null)
  const [localRows, setLocalRows] = useState<Record<string, string>[] | null>(null)
  const columns = localColumns ?? initialColumns
  const rows = localRows ?? initialRows
  const setColumns = (cols: string[]) => setLocalColumns(cols)
  const setRows = (r: Record<string, string>[]) => setLocalRows(r)
  const [editingCell, setEditingCell] = useState<EditingCell>(null)
  const [editValue, setEditValue] = useState('')
  const [sortConfig, setSortConfig] = useState<SortConfig>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { if (editingCell && inputRef.current) inputRef.current.focus() }, [editingCell])
  const saveToFile = useCallback(async (newColumns: string[], newRows: Record<string, string>[]) => {
    if (!fileInfo) return
    try {
      await fetch('/api/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fileInfo, columns: newColumns, rows: newRows })
      })
      onDataChange?.(newColumns, newRows)
    } catch (e) { console.error('Failed to save CSV:', e) }
  }, [fileInfo, onDataChange])
  const handleDoubleClick = (sortedRowIndex: number, column: string, isHeader = false) => {
    const value = isHeader ? column : sortedRows[sortedRowIndex]?.[column] || ''
    setEditValue(value)
    setEditingCell({ rowIndex: sortedRowIndex, column, isHeader })
  }
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setEditingCell(null); return }
    if (e.key === 'Enter') {
      if (!editingCell) return
      if (editingCell.isHeader) {
        const oldColumn = editingCell.column
        const newColumn = editValue.trim()
        if (newColumn && newColumn !== oldColumn) {
          const newColumns = columns.map(c => c === oldColumn ? newColumn : c)
          const newRows = rows.map(row => {
            const newRow: Record<string, string> = {}
            for (const col of columns) newRow[col === oldColumn ? newColumn : col] = row[col] || ''
            return newRow
          })
          setColumns(newColumns)
          setRows(newRows)
          saveToFile(newColumns, newRows)
        }
      } else {
        const { rowIndex: sortedRowIndex, column } = editingCell
        const targetRow = sortedRows[sortedRowIndex]
        const newRows = rows.map(row => row === targetRow ? { ...row, [column]: editValue } : row)
        setRows(newRows)
        saveToFile(columns, newRows)
      }
      setEditingCell(null)
    }
  }
  const handleSort = (column: string) => {
    setSortConfig(prev => {
      if (prev?.column === column) {
        if (prev.direction === 'asc') return { column, direction: 'desc' }
        return null
      }
      return { column, direction: 'asc' }
    })
  }
  const sortedRows = useMemo(() => {
    if (!sortConfig) return rows
    return [...rows].sort((a, b) => {
      const aVal = a[sortConfig.column] || ''
      const bVal = b[sortConfig.column] || ''
      const aNum = parseFloat(aVal)
      const bNum = parseFloat(bVal)
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum
      }
      return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    })
  }, [rows, sortConfig])
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(() => new Set())
  const [maxLines, setMaxLines] = useState<number | null>(null)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const allImages = useMemo(() => extractAllImages(rows, columns), [rows, columns])
  const handleImageClick = (imageUrl: string) => {
    const idx = allImages.indexOf(imageUrl)
    setGalleryIndex(idx >= 0 ? idx : 0)
    setGalleryOpen(true)
  }
  const visibleColumns = useMemo(() => columns.filter((column) => !hiddenColumns.has(column)), [columns, hiddenColumns])
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
        </div>
        <OptionsMenu columns={columns} hiddenColumns={hiddenColumns} onToggleColumn={toggleColumn} maxLines={maxLines} onSetMaxLines={setMaxLines} />
      </div>
      <div>
        <table className="w-full text-[14px]">
          <thead className="sticky top-0 bg-[var(--background)]">
            <tr>
              {visibleColumns.map((column) => (
                <th key={column} className="text-left font-bold p-2 align-bottom whitespace-nowrap">
                  {editingCell?.isHeader && editingCell.column === column ? (
                    <input ref={inputRef} type="text" value={editValue} onChange={e => setEditValue(e.target.value)} onKeyDown={handleKeyDown} onBlur={() => setEditingCell(null)} className="bg-transparent border-b border-white outline-none w-full" />
                  ) : (
                    <span className="flex items-center gap-1">
                      <span onDoubleClick={() => handleDoubleClick(-1, column, true)} className="cursor-text">{column}</span>
                      <button onClick={() => handleSort(column)} className="cursor-pointer opacity-50 hover:opacity-100 text-xs">
                        {sortConfig?.column === column ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '⇅'}
                      </button>
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, rowIndex) => {
              return (
                <tr key={rowIndex}>
                  {visibleColumns.map((column) => {
                    const isEditing = editingCell && !editingCell.isHeader && editingCell.rowIndex === rowIndex && editingCell.column === column
                    const content = getCellContent(row[column] || '', column)
                    return (
                      <td key={column} className="p-2 border-b border-gray-600 align-top" onDoubleClick={() => handleDoubleClick(rowIndex, column)}>
                        {isEditing ? (
                          <input ref={inputRef} type="text" value={editValue} onChange={e => setEditValue(e.target.value)} onKeyDown={handleKeyDown} onBlur={() => setEditingCell(null)} className="bg-transparent border-b border-white outline-none w-full" />
                        ) : (
                          <CellContent content={content} cellClampStyle={cellClampStyle} onImageClick={handleImageClick} />
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {galleryOpen && <ImageGalleryModal images={allImages} initialIndex={galleryIndex} onClose={() => setGalleryOpen(false)} />}
    </div>
  )
}

export default CsvDataGrid
