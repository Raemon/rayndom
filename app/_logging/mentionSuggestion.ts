import type { MentionNodeAttrs } from '@tiptap/extension-mention'
import type { SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion'
import type { MentionItem } from './editorConstants'
import type { Tag } from './types'
import { getTagColor } from './tagUtils'
import { getTagUsageTimestamps } from './tagUsageTracker'

let cachedMentionTags: Tag[] = []
export const updateCachedMentionTags = (tags: Tag[]) => { cachedMentionTags = tags }
export const createMentionSuggestion = () => ({
  items: async ({ query }:{ query: string }) => {
    const normalizedQuery = query.trim().toLowerCase()
    const usageTimestamps = await getTagUsageTimestamps()
    const sortedTags = [...cachedMentionTags].sort((a, b) => {
      const aTime = usageTimestamps[a.id] || 0
      const bTime = usageTimestamps[b.id] || 0
      return bTime - aTime
    })
    const matchingTags = normalizedQuery ? sortedTags.filter(tag => tag.name.toLowerCase().includes(normalizedQuery)) : sortedTags
    const suggestionItems = matchingTags.slice(0, 8).map(tag => ({ id: tag.id.toString(), label: tag.name, badgeColor: getTagColor(tag.name) }))
    return suggestionItems
  },
  render: () => {
    let container: HTMLDivElement | null = null
    let selectedIndex = 0
    let currentItems: MentionItem[] = []
    let currentCommand: ((item: MentionNodeAttrs) => void) | null = null
    const updatePosition = (clientRect: DOMRect | null) => {
      if (!container || !clientRect) return
      container.style.left = `${clientRect.left}px`
      container.style.top = `${clientRect.top + clientRect.height + 4}px`
    }
    const renderItems = (items: MentionItem[], command: (item: MentionNodeAttrs) => void) => {
      if (!container) return
      container.innerHTML = ''
      currentItems = items
      if (selectedIndex >= items.length) selectedIndex = 0
      if (items.length === 0) {
        const empty = document.createElement('div')
        empty.className = 'px-2 py-1 text-xs text-gray-400'
        empty.textContent = 'No tags'
        container.appendChild(empty)
        return
      }
      const suggestionItems = items
      for (let i = 0; i < suggestionItems.length; i++) {
        const item = suggestionItems[i]
        const row = document.createElement('div')
        row.className = `flex items-center gap-2 px-2 py-1 text-xs ${i === selectedIndex ? 'bg-white/10' : ''}`
        const badge = document.createElement('span')
        badge.className = 'px-1 text-white'
        badge.style.backgroundColor = item.badgeColor || 'transparent'
        badge.textContent = item.label || item.id || ''
        row.appendChild(badge)
        row.addEventListener('mousedown', (event) => {
          event.preventDefault()
          command({ id: item.id, label: item.label })
        })
        container.appendChild(row)
      }
    }
    return {
      onStart: (props: SuggestionProps<MentionItem, MentionNodeAttrs>) => {
        selectedIndex = 0
        currentCommand = props.command
        container = document.createElement('div')
        container.className = 'bg-gray-900 text-white text-xs'
        container.style.position = 'fixed'
        container.style.zIndex = '50'
        container.style.minWidth = '140px'
        container.style.pointerEvents = 'auto'
        document.body.appendChild(container)
        renderItems(props.items as MentionItem[], props.command)
        updatePosition(props.clientRect ? props.clientRect() : null)
      },
      onUpdate: (props: SuggestionProps<MentionItem, MentionNodeAttrs>) => {
        currentCommand = props.command
        renderItems(props.items as MentionItem[], props.command)
        updatePosition(props.clientRect ? props.clientRect() : null)
      },
      onKeyDown: (props: SuggestionKeyDownProps) => {
        if (props.event.key === 'ArrowDown') {
          props.event.preventDefault()
          selectedIndex = currentItems.length ? (selectedIndex + 1) % currentItems.length : 0
          if (currentCommand) renderItems(currentItems, currentCommand)
          return true
        }
        if (props.event.key === 'ArrowUp') {
          props.event.preventDefault()
          selectedIndex = currentItems.length ? (selectedIndex - 1 + currentItems.length) % currentItems.length : 0
          if (currentCommand) renderItems(currentItems, currentCommand)
          return true
        }
        if (props.event.key === 'Enter') {
          props.event.preventDefault()
          const selectedItem = currentItems[selectedIndex]
          if (selectedItem) {
            if (currentCommand) currentCommand({ id: selectedItem.id, label: selectedItem.label })
            return true
          }
        }
        if (props.event.key === 'Escape') {
          if (container) container.remove()
          container = null
          return true
        }
        return false
      },
      onExit: () => {
        if (container) container.remove()
        container = null
      }
    }
  }
})
