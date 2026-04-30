import type { MentionNodeAttrs } from '@tiptap/extension-mention'
import type { SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion'
import type { CommandItem } from './editorConstants'

let cachedCommands: { id: number, name: string, html: string, order: number }[] = []
export const updateCachedCommands = (commands: { id: number, name: string, html: string, order: number }[]) => { cachedCommands = commands }
export const getCachedCommands = () => cachedCommands

export const createCommandSuggestion = () => ({
  items: ({ query }:{ query: string }) => {
    const normalizedQuery = query.trim().toLowerCase()
    const commandItems: CommandItem[] = cachedCommands.map(command => ({ id: command.id.toString(), label: command.name, html: command.html }))
    if (!normalizedQuery) return commandItems.slice(0, 8)
    const prefixMatches = commandItems.filter(item => item.label.toLowerCase().startsWith(normalizedQuery))
    const internalMatches = commandItems.filter(item => !item.label.toLowerCase().startsWith(normalizedQuery) && item.label.toLowerCase().includes(normalizedQuery))
    return [...prefixMatches, ...internalMatches].slice(0, 8)
  },
  render: () => {
    let container: HTMLDivElement | null = null
    let selectedIndex = 0
    let currentItems: CommandItem[] = []
    let currentCommand: ((item: MentionNodeAttrs) => void) | null = null
    let currentQuery = ''
    let blurCleanup: (() => void) | null = null
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
      const wrapper = document.createElement('div')
      wrapper.className = 'flex'
      const leftCol = document.createElement('div')
      leftCol.className = 'min-w-32'
      const normalizedQuery = currentQuery.trim().toLowerCase()
      const prefixMatchCount = normalizedQuery ? items.filter(item => item.label.toLowerCase().startsWith(normalizedQuery)).length : items.length
      const commandItems = items
      for (let i = 0; i < commandItems.length; i++) {
        if (normalizedQuery && i === prefixMatchCount && prefixMatchCount > 0 && prefixMatchCount < commandItems.length) {
          const divider = document.createElement('div')
          divider.className = 'h-px bg-white/20 my-1'
          leftCol.appendChild(divider)
        }
        const item = commandItems[i]
        const row = document.createElement('div')
        row.className = `px-2 py-1 text-xs cursor-pointer ${i === selectedIndex ? 'bg-white/50' : ''}`
        const label = document.createElement('span')
        label.className = 'text-white'
        label.textContent = item.label
        row.appendChild(label)
        row.addEventListener('mousedown', (event) => {
          event.preventDefault()
          command({ id: item.id, label: item.label })
        })
        leftCol.appendChild(row)
      }
      wrapper.appendChild(leftCol)
      const rightCol = document.createElement('div')
      rightCol.className = 'px-2 py-1 bg-gray-800 min-w-48 max-w-96 cursor-pointer max-h-48 overflow-y-auto tiptap'
      rightCol.style.fontSize = '15px'
      rightCol.style.lineHeight = '1.5'
      const selectedItem = items[selectedIndex]
      rightCol.innerHTML = selectedItem?.html || ''
      rightCol.addEventListener('mousedown', (event) => {
        event.preventDefault()
        if (selectedItem && currentCommand) currentCommand({ id: selectedItem.id, label: selectedItem.label })
      })
      wrapper.appendChild(rightCol)
      container.appendChild(wrapper)
    }
    return {
      onStart: (props: SuggestionProps<CommandItem, MentionNodeAttrs>) => {
        selectedIndex = 0
        currentCommand = props.command
        currentQuery = props.query
        container = document.createElement('div')
        container.className = 'bg-gray-900 text-white text-xs'
        container.style.position = 'fixed'
        container.style.zIndex = '50'
        container.style.minWidth = '280px'
        container.style.pointerEvents = 'auto'
        document.body.appendChild(container)
        renderItems(props.items as CommandItem[], props.command)
        updatePosition(props.clientRect ? props.clientRect() : null)
        const handleBlur = () => {
          if (container) container.remove()
          container = null
        }
        props.editor.on('blur', handleBlur)
        blurCleanup = () => props.editor.off('blur', handleBlur)
      },
      onUpdate: (props: SuggestionProps<CommandItem, MentionNodeAttrs>) => {
        currentCommand = props.command
        currentQuery = props.query
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
        if (blurCleanup) { blurCleanup(); blurCleanup = null }
        if (container) container.remove()
        container = null
      }
    }
  }
})
