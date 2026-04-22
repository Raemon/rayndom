'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { OpenRouterModel } from '../hooks/useOpenRouterModels'
import { sortModelsByFrontier, formatModelLabel, formatModelPriceHint } from './openRouterModelUtils'

const OpenRouterModelTypeahead = ({ models, selectedModelId, onSelect }:{ models: OpenRouterModel[], selectedModelId: string, onSelect: (modelId: string) => void }) => {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const sortedModels = useMemo(() => sortModelsByFrontier(models), [models])
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sortedModels.slice(0, 12)
    const filtered = sortedModels.filter(m => m.id.toLowerCase().includes(q) || (m.name || '').toLowerCase().includes(q))
    return filtered.slice(0, 12)
  }, [query, sortedModels])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedModel = sortedModels.find(m => m.id === selectedModelId)
  const displayValue = isFocused
    ? query
    : (selectedModel ? formatModelLabel(selectedModel) : selectedModelId)

  return (
    <div className="relative" ref={containerRef}>
      <input
        className="px-2 py-0.5 bg-gray-900 text-white text-xs outline-none w-[200px] focus:w-[260px] transition-all"
        placeholder="AI model"
        value={displayValue}
        onChange={e => { setQuery(e.target.value); setSelectedIndex(0) }}
        onFocus={() => { setIsFocused(true); setQuery('') }}
        onKeyDown={e => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex(i => Math.min(i + 1, matches.length - 1))
          }
          if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex(i => Math.max(i - 1, 0))
          }
          if (e.key === 'Enter') {
            e.preventDefault()
            const picked = matches[selectedIndex]
            if (picked) {
              onSelect(picked.id)
              setQuery('')
              setIsFocused(false)
              ;(e.target as HTMLInputElement).blur()
            }
          }
          if (e.key === 'Escape') {
            setQuery('')
            setIsFocused(false)
            ;(e.target as HTMLInputElement).blur()
          }
        }}
      />
      {isFocused && matches.length > 0 && (
        <div className="absolute z-20 mt-1 left-0 bg-gray-900 text-white text-xs min-w-[260px] max-h-[300px] overflow-y-auto">
          {matches.map((model, i) => {
            const priceHint = formatModelPriceHint(model)
            const isSelected = i === selectedIndex
            const isCurrent = model.id === selectedModelId
            return (
              <div
                key={model.id}
                className={`flex items-center justify-between gap-2 px-2 py-1 cursor-pointer ${isSelected ? 'bg-white/15' : isCurrent ? 'bg-white/5' : 'hover:bg-white/10'}`}
                onMouseEnter={() => setSelectedIndex(i)}
                onMouseDown={e => {
                  e.preventDefault()
                  onSelect(model.id)
                  setQuery('')
                  setIsFocused(false)
                }}
              >
                <div className="flex flex-col min-w-0">
                  <span className="truncate">{formatModelLabel(model)}</span>
                  <span className="text-gray-500 text-[10px] truncate">{model.id}</span>
                </div>
                {priceHint && <span className="text-gray-400 text-[10px] shrink-0">{priceHint}</span>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default OpenRouterModelTypeahead
