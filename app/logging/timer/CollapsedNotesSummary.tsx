'use client'
import { useMemo, useState } from 'react'
import type { Timeblock } from '../types'
import NotesTaskCheckbox from './NotesTaskCheckbox'
import { extractNotesTasksAndLinks, toggleTaskInHtml, type NotesTaskItem } from './notesTaskUtils'

const CollapsedNotesSummary = ({ timeblocks, onPatchTimeblockDebounced }: {
  timeblocks: Timeblock[],
  onPatchTimeblockDebounced: (args: { id: number, rayNotes?: string | null, debounceMs?: number }) => void,
}) => {
  const [checkedKeys, setCheckedKeys] = useState(() => new Set<string>())
  const { tasks, fatebookLinks } = useMemo(() => extractNotesTasksAndLinks(timeblocks, checkedKeys), [timeblocks, checkedKeys])

  if (tasks.length === 0 && fatebookLinks.length === 0) return null
  
  const handleToggleTask = (task: NotesTaskItem) => {
    const key = `${task.timeblockId}:${task.text}`
    const newChecked = !task.checked
    setCheckedKeys(prev => {
      const next = new Set(prev)
      if (newChecked) next.add(key)
      else next.delete(key)
      return next
    })
    const tb = timeblocks.find(t => t.id === task.timeblockId)
    const field = task.source
    if (!tb?.[field]) return
    const newHtml = toggleTaskInHtml(tb[field]!, task.text, newChecked)
    onPatchTimeblockDebounced({ id: tb.id, [field]: newHtml, debounceMs: 0 })
  }
  
  return (
    <div className="text-xs text-gray-200 mt-4 flex flex-col gap-2">
      {tasks.map((task) => (
        <NotesTaskCheckbox key={`${task.timeblockId}:${task.text}`} checked={task.checked} text={task.text} onToggle={() => handleToggleTask(task)} />
      ))}
      {fatebookLinks.map((link) => (
        <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="block truncate text-blue-200 hover:text-blue-100 text-sm" onClick={e => e.stopPropagation()}>
          {link.text}
        </a>
      ))}
    </div>
  )
}

export default CollapsedNotesSummary
