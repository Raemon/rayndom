'use client'
import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Mention from '@tiptap/extension-mention'
import { useFocusedNotes } from '../context/FocusedNotesContext'
import { useTags } from '../tags/TagsContext'
import { createMentionSuggestion, updateCachedMentionTags } from './mentionSuggestion'
import { createCommandSuggestion, updateCachedCommands, getCachedCommands } from './commandSuggestion'
import BubbleMenuToolbar from './BubbleMenuToolbar'
import { TagInstanceExtension, type TagInstanceCallbacks, getEditorTagInstanceState, setEditorCallbacks } from './TagInstanceExtension'
import { useCommands } from '../hooks/useCommands'

const extractTagInstanceIdsFromEditor = (editorInstance: ReturnType<typeof useEditor>) => {
  const ids = new Set<number>()
  if (!editorInstance) return ids
  editorInstance.state.doc.descendants((node) => {
    if (node.type.name === 'tagInstance' && node.attrs.tagInstanceId) {
      ids.add(parseInt(node.attrs.tagInstanceId))
    }
  })
  return ids
}

const SmartEditor = ({ noteKey, initialValue, externalValue, placeholder, onSave, minHeight=25,  expandable=true, datetime, onCreateTagInstance, onDeleteTagInstance }:{ noteKey?: string, initialValue: string, externalValue?: string, placeholder: string, onSave?: (content: string) => void, minHeight?: number | string, expandable?: boolean } & TagInstanceCallbacks) => {
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedRef = useRef<string>(initialValue || '')
  const initializedRef = useRef(false)
  const isFocusedRef = useRef(false)
  const [isFocused, setIsFocused] = useState(false)
  const { registerFocus, unregisterFocus } = useFocusedNotes()
  const { tags } = useTags()
  const { commands } = useCommands()
  useEffect(() => { updateCachedCommands(commands) }, [commands])
  useEffect(() => { updateCachedMentionTags(tags) }, [tags])
  const mentionSuggestion = useMemo(() => createMentionSuggestion(), [])
  const commandSuggestion = useMemo(() => createCommandSuggestion(), [])
  const saveContent = useCallback((content: string) => {
    if (onSave && content !== lastSavedRef.current) {
      lastSavedRef.current = content
      onSave(content)
    }
  }, [onSave])
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder }),
      TaskList,
      TaskItem.configure({ nested: true }),
      TagInstanceExtension,
      Mention.configure({
        HTMLAttributes: { class: 'mention' },
        renderLabel({ node }) { return `@${node.attrs.label || node.attrs.id}` },
        suggestions: [
          { ...mentionSuggestion, char: '@', command: async ({ editor, range, props }) => {
            const state = getEditorTagInstanceState(editor)
            const { datetime: dt, onCreateTagInstance: createTi } = state.callbacks
            if (dt && createTi && props.id) {
              const tagId = parseInt(props.id)
              const ti = await createTi({ tagId, datetime: dt })
              editor.chain().focus().deleteRange(range).insertContent({
                type: 'tagInstance',
                attrs: { id: props.id, label: props.label, tagInstanceId: ti.id.toString() }
              }).run()
              state.trackedIds.add(ti.id)
            } else {
              editor.chain().focus().deleteRange(range).insertContent({
                type: 'tagInstance',
                attrs: { id: props.id || '', label: props.label }
              }).run()
            }
          } },
          { ...commandSuggestion, char: '/', command: ({ editor, range, props }) => {
            const commandId = props.id ? parseInt(props.id) : NaN
            if (!Number.isFinite(commandId)) return
            const command = getCachedCommands().find(c => c.id === commandId)
            if (!command?.html) return
            editor.chain().focus().insertContentAt(range, command.html).run()
          } }
        ]
      })
    ],
    content: initialValue || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'px-2 py-1 outline-none',
        style: `min-height: ${typeof minHeight === 'number' ? `${minHeight}px` : minHeight};`
      }
    },
    onUpdate: ({ editor }) => {
      // Check for deleted tag instances
      const currentIds = extractTagInstanceIdsFromEditor(editor)
      const state = getEditorTagInstanceState(editor)
      const { onDeleteTagInstance: deleteTi } = state.callbacks
      if (deleteTi) {
        for (const id of state.trackedIds) {
          if (!currentIds.has(id)) {
            deleteTi({ id })
          }
        }
      }
      state.trackedIds = currentIds
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = setTimeout(() => {
        saveContent(editor.getHTML())
      }, 500)
    },
    onFocus: () => {
      isFocusedRef.current = true
      setIsFocused(true)
      if (noteKey) registerFocus(noteKey)
    },
    onBlur: ({ editor }) => {
      isFocusedRef.current = false
      setIsFocused(false)
      if (noteKey) unregisterFocus(noteKey)
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
      saveContent(editor.getHTML())
    }
  })
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
      if (noteKey) unregisterFocus(noteKey)
    }
  }, [noteKey, unregisterFocus])
  useEffect(() => {
    if (editor && !initializedRef.current && initialValue) {
      editor.commands.setContent(initialValue)
      lastSavedRef.current = initialValue
      getEditorTagInstanceState(editor).trackedIds = extractTagInstanceIdsFromEditor(editor)
      initializedRef.current = true
    }
  }, [initialValue, editor])
  // Update content from external source when not focused
  useEffect(() => {
    if (editor && externalValue !== undefined && !isFocusedRef.current && initializedRef.current) {
      const currentContent = editor.getHTML()
      if (externalValue !== currentContent && externalValue !== lastSavedRef.current) {
        editor.commands.setContent(externalValue)
        lastSavedRef.current = externalValue
      }
    }
  }, [externalValue, editor])
  // Store tag instance callbacks on editor for access in command handlers
  useEffect(() => {
    if (editor) {
      setEditorCallbacks(editor, { datetime, onCreateTagInstance, onDeleteTagInstance })
    }
  }, [editor, datetime, onCreateTagInstance, onDeleteTagInstance])
  const shouldExpand = isFocused && expandable

  if (!editor) return null

  return (
    <div className="relative" style={{ minHeight }}>
      <div 
        className={`text-xs transition-all duration-200 ease-in-out ${shouldExpand ? 'z-50 shadow-lg bg-gray-900' : ''}`}
        style={{ 
          position: shouldExpand ? 'absolute' : 'relative',
          top: 0,
          left: 0,
          minHeight,
          maxHeight: shouldExpand ? 'none' : '250px',
          width: shouldExpand ? '640px' : '100%',
          overflow: shouldExpand ? 'visible' : 'hidden'
        }}
      >
        <BubbleMenuToolbar editor={editor} />
        <EditorContent editor={editor} className={`notes-input-editor ${shouldExpand ? 'notes-input-expanded' : ''}`} />
      </div>
    </div>
  )
}

export default SmartEditor
