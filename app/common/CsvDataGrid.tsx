'use client'
import { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import OptionsMenu from './OptionsMenu'

const HTML_TAG_REGEX = /<\/?[a-z][\s\S]*?>/i
const MARKDOWN_PATTERNS = [
  /\*\*[^*]+\*\*/,  // bold
  /\*[^*]+\*/,      // italic
  /__[^_]+__/,      // bold underscore
  /_[^_]+_/,        // italic underscore
  /\[[^\]]+\]\([^)]+\)/, // links
  /^#{1,6}\s/m,     // headings
  /^\s*[-*+]\s/m,   // unordered lists
  /^\s*\d+\.\s/m,   // ordered lists
  /`[^`]+`/,        // inline code
]
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: ['a', 'b', 'strong', 'i', 'em', 'u', 'code', 'pre', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'hr', 'span', 'div'],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'title', 'class'],
}
const sanitize = (html: string) => DOMPurify.sanitize(html, SANITIZE_CONFIG)
const isHtml = (text: string) => HTML_TAG_REGEX.test(text)
const isMarkdown = (text: string) => MARKDOWN_PATTERNS.some(pattern => pattern.test(text))
const IMAGE_URL_PATTERN = /^https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp)(\?[^\s]*)?$/i
const isImageUrl = (value: string) => IMAGE_URL_PATTERN.test(value)
const renderCellContent = (value: string, column: string): { html: string } | { text: string } | { image: string } => {
  if (!value) return { text: '' }
  if (column.toLowerCase() === 'image' || isImageUrl(value)) {
    return { image: value }
  }
  if (isHtml(value)) {
    return { html: sanitize(value) }
  }
  if (isMarkdown(value)) {
    const html = marked.parse(value, { async: false }) as string
    return { html: sanitize(html) }
  }
  return { text: value }
}

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
  const [pageIndex, setPageIndex] = useState(0)
  const pageSize = 50
  const visibleColumns = useMemo(() => columns.filter((column) => !hiddenColumns.has(column)), [columns, hiddenColumns])
  const pageCount = useMemo(() => Math.max(1, Math.ceil(sortedRows.length / pageSize)), [sortedRows.length])
  const clampedPageIndex = Math.min(pageIndex, pageCount - 1)
  const pageRows = useMemo(() => {
    const start = clampedPageIndex * pageSize
    const end = start + pageSize
    return sortedRows.slice(start, end)
  }, [sortedRows, clampedPageIndex])
  const getActualRowIndex = (pageRowIndex: number) => clampedPageIndex * pageSize + pageRowIndex
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
            {pageRows.map((row, pageRowIndex) => {
              const actualRowIndex = getActualRowIndex(pageRowIndex)
              return (
                <tr key={pageRowIndex}>
                  {visibleColumns.map((column) => {
                    const isEditing = editingCell && !editingCell.isHeader && editingCell.rowIndex === actualRowIndex && editingCell.column === column
                    const content = renderCellContent(row[column] || '', column)
                    return (
                      <td key={column} className="p-2 border-b border-gray-600 align-top" onDoubleClick={() => handleDoubleClick(actualRowIndex, column)}>
                        {isEditing ? (
                          <input ref={inputRef} type="text" value={editValue} onChange={e => setEditValue(e.target.value)} onKeyDown={handleKeyDown} onBlur={() => setEditingCell(null)} className="bg-transparent border-b border-white outline-none w-full" />
                        ) : 'image' in content ? (
                          <img src={content.image} alt="" className="max-w-[120px] max-h-[80px] object-cover" />
                        ) : 'html' in content ? (
                          <div className="whitespace-pre-wrap break-words cursor-text" style={cellClampStyle} dangerouslySetInnerHTML={{__html: content.html}} />
                        ) : (
                          <div className="whitespace-pre-wrap break-words cursor-text" style={cellClampStyle}>{content.text}</div>
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
    </div>
  )
}

export default CsvDataGrid
