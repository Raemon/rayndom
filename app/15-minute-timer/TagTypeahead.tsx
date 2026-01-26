'use client'
import { useMemo, useState, useRef, useEffect } from 'react'
import type { Tag } from './types'

const TagTypeahead = ({ tags, placeholder, onSelectTag, onCreateTag }:{ tags: Tag[], placeholder: string, onSelectTag: (tag: Tag) => void, onCreateTag: (name: string) => Promise<Tag> }) => {
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return tags.slice(0, 8)
    return tags.filter(t => t.name.toLowerCase().includes(q)).slice(0, 8)
  }, [query, tags])

  const exactMatch = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    return tags.find(t => t.name.toLowerCase() === q) || null
  }, [query, tags])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={containerRef}>
      <input
        className="px-2 py-1 bg-gray-900 outline-none w-40"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={async (e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            const q = query.trim()
            if (!q) return
            if (exactMatch) { onSelectTag(exactMatch); setQuery(''); return }
            const created = await onCreateTag(q)
            onSelectTag(created)
            setQuery('')
          }
          if (e.key === 'Escape') {
            setQuery('')
          }
        }}
      />
      {(query.trim() || matches.length > 0) && (
        <div className="absolute z-10 mt-1 bg-gray-900 text-white text-sm">
          {matches.map(t => (
            <button key={t.id} className="block text-left px-2 py-1 w-full" onMouseDown={(e) => { e.preventDefault(); onSelectTag(t); setQuery('') }}>
              {t.name}
            </button>
          ))}
          {!exactMatch && query.trim().length > 0 && (
            <button className="block text-left px-2 py-1 w-full text-gray-700" onMouseDown={async (e) => {
              e.preventDefault()
              const created = await onCreateTag(query.trim())
              onSelectTag(created)
              setQuery('')
            }}>
              Create “{query.trim()}”
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default TagTypeahead
