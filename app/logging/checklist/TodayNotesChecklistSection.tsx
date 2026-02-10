'use client'
import { useEffect, useMemo, useState } from 'react'
import type { Timeblock } from '../types'
import NotesTaskCheckbox from '../timer/NotesTaskCheckbox'
import { extractOutstandingNotesTasks, toggleTaskInHtml, type NotesTaskItem } from '../timer/notesTaskUtils'

const dayStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)

const TodayNotesChecklistSection = ({ textSize='text-sm' }:{ textSize?: string }) => {
  const [timeblocksById, setTimeblocksById] = useState<Record<number, Timeblock>>({})
  const [tasks, setTasks] = useState<NotesTaskItem[]>([])
  const [loading, setLoading] = useState(false)
  const [loadedOnce, setLoadedOnce] = useState(false)
  const refreshTasks = async () => {
    setLoading(true)
    const today = dayStart(new Date())
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    const start = encodeURIComponent(today.toISOString())
    const end = encodeURIComponent(tomorrow.toISOString())
    const res = await fetch(`/api/timer/timeblocks?start=${start}&end=${end}`)
    const json = await res.json()
    const timeblocks = (json.timeblocks || []) as Timeblock[]
    const map: Record<number, Timeblock> = {}
    for (const timeblock of timeblocks) map[timeblock.id] = timeblock
    setTimeblocksById(map)
    setTasks(extractOutstandingNotesTasks(timeblocks))
    setLoading(false)
    setLoadedOnce(true)
  }

  useEffect(() => {
    refreshTasks()
    const interval = setInterval(refreshTasks, 5000)
    return () => clearInterval(interval)
  }, [])

  const hasTasks = tasks.length > 0
  const sectionTitleClass = useMemo(() => textSize === 'text-2xl' ? 'text-xl font-semibold' : 'text-sm font-semibold', [textSize])

  const handleToggleTask = async (task: NotesTaskItem) => {
    setTasks(prev => prev.filter(t => !(t.timeblockId === task.timeblockId && t.text === task.text)))
    const timeblock = timeblocksById[task.timeblockId]
    if (!timeblock?.rayNotes) return
    const newHtml = toggleTaskInHtml(timeblock.rayNotes, task.text, true)
    setTimeblocksById(prev => ({ ...prev, [task.timeblockId]: { ...timeblock, rayNotes: newHtml } }))
    await fetch('/api/timer/timeblocks', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: task.timeblockId, rayNotes: newHtml }) })
  }

  if (loadedOnce && !hasTasks) return null

  return (
    <div className="mt-4">
      <div className={sectionTitleClass}>Outstanding from today&apos;s notes:</div>
      <div className="mt-2 flex flex-col gap-1">
        {tasks.map(task => (
          <NotesTaskCheckbox key={`${task.timeblockId}:${task.text}`} checked={false} text={task.text} onToggle={() => handleToggleTask(task)} className={textSize} />
        ))}
        {loading && !loadedOnce && <div className={`${textSize} text-gray-500`}>Loading...</div>}
      </div>
    </div>
  )
}

export default TodayNotesChecklistSection
