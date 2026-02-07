'use client'
import { useMemo, useState } from 'react'
import type { Timeblock } from '../types'

type TaskItem = { text: string, timeblockId: number, taskIndex: number }
type CheckedTaskItem = TaskItem & { checked: boolean }
type FatebookLink = { url: string, text: string }

const TASK_ITEM_SELECTOR = 'li[data-type="taskItem"]'
const UNCHECKED_TASK_SELECTOR = `${TASK_ITEM_SELECTOR}[data-checked="false"]`
const CHECKED_TASK_SELECTOR = `${TASK_ITEM_SELECTOR}[data-checked="true"]`

const extractNotesInfo = (timeblocks: Timeblock[], checkedKeys: Set<string>): { tasks: CheckedTaskItem[], fatebookLinks: FatebookLink[] } => {
  if (typeof window === 'undefined') return { tasks: [], fatebookLinks: [] }
  const tasks: CheckedTaskItem[] = []
  const fatebookLinks: FatebookLink[] = []
  const seenUrls = new Set<string>()
  const parser = new DOMParser()
  for (const tb of timeblocks) {
    if (!tb.rayNotes) continue
    const doc = parser.parseFromString(tb.rayNotes, 'text/html')
    // Use same selector as toggleTaskInHtml so indices stay aligned
    const uncheckedItems = doc.querySelectorAll(UNCHECKED_TASK_SELECTOR)
    for (let i = 0; i < uncheckedItems.length; i++) {
      const text = uncheckedItems[i].textContent?.trim()
      if (!text) continue
      const key = `${tb.id}:${text}`
      tasks.push({ text, timeblockId: tb.id, taskIndex: i, checked: checkedKeys.has(key) })
    }
    const checkedItems = doc.querySelectorAll(CHECKED_TASK_SELECTOR)
    for (const item of checkedItems) {
      const text = item.textContent?.trim()
      if (!text) continue
      const key = `${tb.id}:${text}`
      if (checkedKeys.has(key)) tasks.push({ text, timeblockId: tb.id, taskIndex: -1, checked: true })
    }
    const links = doc.querySelectorAll('a[href*="fatebook" i]')
    for (const link of links) {
      const url = (link as HTMLAnchorElement).href
      if (!seenUrls.has(url)) {
        seenUrls.add(url)
        fatebookLinks.push({ url, text: link.textContent?.trim() || url })
      }
    }
    const textContent = doc.body.textContent || ''
    const urlMatches = textContent.match(/https?:\/\/(?:www\.)?fatebook\.io\/[^\s.,)]+/gi) || []
    for (const url of urlMatches) {
      if (!seenUrls.has(url)) {
        seenUrls.add(url)
        fatebookLinks.push({ url, text: url })
      }
    }
  }
  return { tasks, fatebookLinks }
}

const toggleTaskInHtml = (html: string, taskText: string, newChecked: boolean): string => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const sourceSelector = newChecked ? UNCHECKED_TASK_SELECTOR : CHECKED_TASK_SELECTOR
  const items = doc.querySelectorAll(sourceSelector)
  for (const item of items) {
    if (item.textContent?.trim() === taskText) {
      item.setAttribute('data-checked', newChecked ? 'true' : 'false')
      const checkbox = item.querySelector('input[type="checkbox"]')
      if (checkbox) {
        if (newChecked) checkbox.setAttribute('checked', 'checked')
        else checkbox.removeAttribute('checked')
      }
      break
    }
  }
  return doc.body.innerHTML
}

const CollapsedNotesSummary = ({ timeblocks, onPatchTimeblockDebounced }: {
  timeblocks: Timeblock[],
  onPatchTimeblockDebounced: (args: { id: number, rayNotes?: string | null, debounceMs?: number }) => void,
}) => {
  const [checkedKeys, setCheckedKeys] = useState(() => new Set<string>())
  const { tasks, fatebookLinks } = useMemo(() => extractNotesInfo(timeblocks, checkedKeys), [timeblocks, checkedKeys])

  if (tasks.length === 0 && fatebookLinks.length === 0) return null
  
  const handleToggleTask = (task: CheckedTaskItem) => {
    const key = `${task.timeblockId}:${task.text}`
    const newChecked = !task.checked
    setCheckedKeys(prev => {
      const next = new Set(prev)
      if (newChecked) next.add(key)
      else next.delete(key)
      return next
    })
    const tb = timeblocks.find(t => t.id === task.timeblockId)
    if (!tb?.rayNotes) return
    const newHtml = toggleTaskInHtml(tb.rayNotes, task.text, newChecked)
    onPatchTimeblockDebounced({ id: tb.id, rayNotes: newHtml, debounceMs: 0 })
  }
  
  return (
    <div className="text-xs text-gray-200 mt-4 flex flex-col gap-2">
      {tasks.map((task) => (
        <label key={`${task.timeblockId}:${task.text}`} className="truncate flex items-center gap-1 cursor-pointer" onClick={e => e.stopPropagation()}>
          <input type="checkbox" checked={task.checked} className="cursor-pointer" onChange={() => handleToggleTask(task)} />
          <span className={task.checked ? 'line-through text-gray-300' : ''}>{task.text}</span>
        </label>
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
