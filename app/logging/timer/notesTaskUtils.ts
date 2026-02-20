import type { Timeblock } from '../types'

export type NotesTaskItem = { text: string, timeblockId: number, checked: boolean, source: 'rayNotes' | 'assistantNotes' }
export type FatebookLink = { url: string, text: string }

const TASK_ITEM_SELECTOR = 'li[data-type="taskItem"]'
const UNCHECKED_TASK_SELECTOR = `${TASK_ITEM_SELECTOR}[data-checked="false"]`
const CHECKED_TASK_SELECTOR = `${TASK_ITEM_SELECTOR}[data-checked="true"]`

export const extractNotesTasksAndLinks = (timeblocks: Timeblock[], checkedKeys: Set<string>): { tasks: NotesTaskItem[], fatebookLinks: FatebookLink[] } => {
  if (typeof window === 'undefined') return { tasks: [], fatebookLinks: [] }
  const tasks: NotesTaskItem[] = []
  const fatebookLinks: FatebookLink[] = []
  const seenUrls = new Set<string>()
  const parser = new DOMParser()
  const noteFields = ['rayNotes', 'assistantNotes'] as const
  for (const tb of timeblocks) {
    for (const field of noteFields) {
      if (!tb[field]) continue
      const doc = parser.parseFromString(tb[field]!, 'text/html')
      const uncheckedItems = doc.querySelectorAll(UNCHECKED_TASK_SELECTOR)
      for (let i = 0; i < uncheckedItems.length; i++) {
        const text = uncheckedItems[i].textContent?.trim()
        if (!text) continue
        const key = `${tb.id}:${text}`
        tasks.push({ text, timeblockId: tb.id, checked: checkedKeys.has(key), source: field })
      }
      const checkedItems = doc.querySelectorAll(CHECKED_TASK_SELECTOR)
      for (const item of checkedItems) {
        const text = item.textContent?.trim()
        if (!text) continue
        const key = `${tb.id}:${text}`
        if (checkedKeys.has(key)) tasks.push({ text, timeblockId: tb.id, checked: true, source: field })
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
  }
  return { tasks, fatebookLinks }
}

export const extractOutstandingNotesTasks = (timeblocks: Timeblock[]): NotesTaskItem[] => {
  if (typeof window === 'undefined') return []
  const tasks: NotesTaskItem[] = []
  const parser = new DOMParser()
  const noteFields = ['rayNotes', 'assistantNotes'] as const
  for (const tb of timeblocks) {
    for (const field of noteFields) {
      if (!tb[field]) continue
      const doc = parser.parseFromString(tb[field]!, 'text/html')
      const uncheckedItems = doc.querySelectorAll(UNCHECKED_TASK_SELECTOR)
      for (let i = 0; i < uncheckedItems.length; i++) {
        const text = uncheckedItems[i].textContent?.trim()
        if (!text) continue
        tasks.push({ text, timeblockId: tb.id, checked: false, source: field })
      }
    }
  }
  return tasks
}

export const toggleTaskInHtml = (html: string, taskText: string, newChecked: boolean): string => {
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
