'use client'
import { useMemo, useState, useRef, useEffect } from 'react'
import type { Tag, TagInstance } from './types'
import { getTagColor } from './TagCell'

const TagTypeahead = ({ tags, allTagInstances, placeholder, onSelectTag, onCreateTag }:{ tags: Tag[], allTagInstances: TagInstance[], placeholder: string, onSelectTag: (tag: Tag) => void, onCreateTag: (name: string) => Promise<Tag> }) => {
  const [query, setQuery] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const tagToLatestInstance = useMemo(() => {
    const map = new Map<number, TagInstance>()
    for (const ti of allTagInstances) {
      const existing = map.get(ti.tagId)
      if (!existing || new Date(ti.datetime) > new Date(existing.datetime)) map.set(ti.tagId, ti)
    }
    return map
  }, [allTagInstances])
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q ? tags.filter(t => t.name.toLowerCase().includes(q)) : tags
    const sorted = [...filtered].sort((a, b) => {
      const aLatest = tagToLatestInstance.get(a.id)
      const bLatest = tagToLatestInstance.get(b.id)
      if (!aLatest && !bLatest) return 0
      if (!aLatest) return 1
      if (!bLatest) return -1
      return new Date(bLatest.datetime).getTime() - new Date(aLatest.datetime).getTime()
    })
    return sorted.slice(0, 8)
  }, [query, tags, tagToLatestInstance])

  const exactMatch = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    return tags.find(t => t.name.toLowerCase() === q) || null
  }, [query, tags])

  const showCreateOption = !exactMatch && query.trim().length > 0
  const totalItems = matches.length + (showCreateOption ? 1 : 0)

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
        className="px-2 py-1 outline-none w-40 bg-transparent! hover:bg-white/10! w-full"
        placeholder={"+"}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0) }}
        onFocus={() => setIsEditing(true)}
        onBlur={() => setIsEditing(false)}
        onKeyDown={async (e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex(i => Math.min(i + 1, totalItems - 1))
          }
          if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex(i => Math.max(i - 1, 0))
          }
          if (e.key === 'Enter') {
            e.preventDefault()
            if (totalItems === 0) return
            if (selectedIndex < matches.length) {
              onSelectTag(matches[selectedIndex])
              setQuery('')
            } else if (showCreateOption) {
              const created = await onCreateTag(query.trim())
              onSelectTag(created)
              setQuery('')
            }
          }
          if (e.key === 'Escape') {
            setQuery('')
            setIsEditing(false)
            ;(e.target as HTMLInputElement).blur()
          }
        }}
      />
      {isEditing && (query.trim() || matches.length > 0) && (
        <div className="absolute z-10 mt-1 bg-gray-900 text-white text-xs">
          {matches.map((t, i) => (
            <div key={t.id} className={`flex items-center gap-2 text-left px-2 py-1 w-full text-xs! rounded-xs ${selectedIndex === i ? 'bg-white/40!' : 'bg-gray-700!'}`} onMouseDown={(e) => { e.preventDefault(); onSelectTag(t); setQuery('') }}>
              <span className="px-1 rounded-xs text-white" style={{ backgroundColor: getTagColor(t.name) }}>
               {t.name}
              </span>
            </div>
          ))}
          {showCreateOption && (
            <button className={`block text-left px-2 py-1 w-full ${selectedIndex === matches.length ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`} onMouseDown={async (e) => {
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
