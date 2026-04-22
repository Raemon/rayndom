'use client'
import { useEffect, useRef, useState } from 'react'
import type { Prompt } from '../types'

const PromptDropdown = ({ prompts, selectedPromptId, onSelect, onCreateNew }:{ prompts: Prompt[], selectedPromptId: number | null, onSelect: (promptId: number) => void, onCreateNew: () => void }) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedPrompt = prompts.find(p => p.id === selectedPromptId) || prompts[0] || null
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  return (
    <div className="relative" ref={containerRef}>
      <button className="text-xs text-gray-400 hover:text-white px-1 py-0.5 flex items-center gap-1" onClick={() => setIsOpen(o => !o)}>
        <span className="max-w-[160px] truncate">{selectedPrompt ? selectedPrompt.title : '(no prompt)'}</span>
        <span className="text-gray-600">▾</span>
      </button>
      {isOpen && (
        <div className="absolute z-20 mt-1 left-0 bg-gray-900 text-white text-xs min-w-[180px] max-h-[260px] overflow-y-auto">
          {prompts.length === 0 && <div className="px-2 py-1 text-gray-500">No prompts</div>}
          {prompts.map(prompt => {
            const isSelected = selectedPrompt?.id === prompt.id
            return (
              <button
                key={prompt.id}
                className={`block text-left px-2 py-1 w-full hover:bg-white/10 ${isSelected ? 'bg-white/5 text-white' : 'text-gray-300'}`}
                onClick={() => { onSelect(prompt.id); setIsOpen(false) }}
              >
                {prompt.title}
              </button>
            )
          })}
          <button
            className="block text-left px-2 py-1 mt-1 w-full text-gray-500 hover:text-white hover:bg-white/10"
            onClick={() => { setIsOpen(false); onCreateNew() }}
          >
            + new
          </button>
        </div>
      )}
    </div>
  )
}

export default PromptDropdown
