import type { MentionNodeAttrs } from '@tiptap/extension-mention'
import type { SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion'
import type { CommandItem } from './editorConstants'

let cachedCommands: { id: number, name: string, html: string }[] = []
export const updateCachedCommands = (commands: { id: number, name: string, html: string }[]) => { cachedCommands = commands }
export const getCachedCommands = () => cachedCommands

export const createCommandSuggestion = () => ({
  items: ({ query }:{ query: string }) => {
    const normalizedQuery = query.trim().toLowerCase()
    const commandItems: CommandItem[] = cachedCommands.map(command => ({ id: command.id.toString(), label: command.name }))
    const filteredItems = normalizedQuery ? commandItems.filter(item => item.label.toLowerCase().includes(normalizedQuery)) : commandItems
    return filteredItems.slice(0, 8)
  },
  render: () => {
    let container: HTMLDivElement | null = null
    let selectedIndex = 0
    let currentItems: CommandItem[] = []
    let currentCommand: ((item: MentionNodeAttrs) => void) | null = null
    const updatePosition = (clientRect: DOMRect | null) => {
      if (!container || !clientRect) return
      container.style.left = `${clientRect.left}px`
      container.style.top = `${clientRect.top + clientRect.height + 4}px`
    }
    const renderItems = (items: CommandItem[], command: (item: MentionNodeAttrs) => void) => {
      if (!container) return
      container.innerHTML = ''
      currentItems = items
      if (selectedIndex >= items.length) selectedIndex = 0
      if (items.length === 0) {
        const empty = document.createElement('div')
        empty.className = 'px-2 py-1 text-xs text-gray-400'
        empty.textContent = 'No commands'
        container.appendChild(empty)
        return
      }
      const commandItems = items
      for (let i = 0; i < commandItems.length; i++) {
        const item = commandItems[i]
        const row = document.createElement('div')
        row.className = `flex items-center gap-2 px-2 py-1 text-xs ${i === selectedIndex ? 'bg-white/10' : ''}`
        const label = document.createElement('span')
        label.className = 'text-white'
        label.textContent = item.label
        row.appendChild(label)
        row.addEventListener('mousedown', (event) => {
          event.preventDefault()
          command({ id: item.id, label: item.label })
        })
        container.appendChild(row)
      }
    }
    return {
      onStart: (props: SuggestionProps<CommandItem, MentionNodeAttrs>) => {
        selectedIndex = 0
        currentCommand = props.command
        container = document.createElement('div')
        container.className = 'bg-gray-900 text-white text-xs'
        container.style.position = 'fixed'
        container.style.zIndex = '50'
        container.style.minWidth = '140px'
        container.style.pointerEvents = 'auto'
        document.body.appendChild(container)
        renderItems(props.items as CommandItem[], props.command)
        updatePosition(props.clientRect ? props.clientRect() : null)
      },
      onUpdate: (props: SuggestionProps<CommandItem, MentionNodeAttrs>) => {
        currentCommand = props.command
        renderItems(props.items as CommandItem[], props.command)
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
