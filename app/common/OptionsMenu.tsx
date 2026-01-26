'use client'
import { useEffect, useRef, useState } from 'react'

const OptionsMenu = ({columns, hiddenColumns, onToggleColumn, maxLines, onSetMaxLines}:{columns: string[], hiddenColumns: Set<string>, onToggleColumn: (column: string) => void, maxLines: number | null, onSetMaxLines: (maxLines: number | null) => void}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!isOpen) return
    const handleMouseDown = (e: MouseEvent) => {
      const el = containerRef.current
      if (!el) return
      if (e.target instanceof Node && !el.contains(e.target)) {
        setIsOpen(false)
      }
    }
    window.addEventListener('mousedown', handleMouseDown)
    return () => window.removeEventListener('mousedown', handleMouseDown)
  }, [isOpen])
  const lineOptions: Array<{label: string, value: number | null}> = [
    {label: '1 line', value: 1},
    {label: '2 lines', value: 2},
    {label: '3 lines', value: 3},
    {label: 'Expand all', value: null},
  ]
  return (
    <div className="relative" ref={containerRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="text-[var(--foreground)] opacity-70 text-lg leading-none px-1 cursor-pointer">⋮</button>
      {isOpen && (
        <div className="absolute right-0 mt-1 bg-[var(--background)] text-[var(--foreground)] p-2 text-xs z-20 w-[220px]">
          <div className="font-bold mb-1">Columns</div>
          <div className="max-h-[160px] overflow-y-auto">
            {columns.map((column) => (
              <label key={column} className="flex items-center gap-2 whitespace-nowrap mb-1">
                <input type="checkbox" checked={!hiddenColumns.has(column)} onChange={() => onToggleColumn(column)} />
                <span>{column}</span>
              </label>
            ))}
          </div>
          <div className="font-bold mt-2 mb-1">Cell height</div>
          <div>
            {lineOptions.map((option) => (
              <label key={option.label} className="flex items-center gap-2 whitespace-nowrap mb-1">
                <input type="radio" name="csv-cell-height" checked={option.value === maxLines} onChange={() => onSetMaxLines(option.value)} />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default OptionsMenu
