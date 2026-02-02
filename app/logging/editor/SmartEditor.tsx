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
import { createCommandSuggestion } from './commandSuggestion'
import { getThinkItFasterHtml } from './editorConstants'
import BubbleMenuToolbar from './BubbleMenuToolbar'

const SmartEditor = ({ noteKey, initialValue, externalValue, placeholder, onSave, minHeight=25, noExpand=false }:{ noteKey?: string, initialValue: string, externalValue?: string, placeholder: string, onSave?: (content: string) => void, minHeight?: number, noExpand?: boolean }) => {
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedRef = useRef<string>(initialValue || '')
  const initializedRef = useRef(false)
  const isFocusedRef = useRef(false)
  const [isFocused, setIsFocused] = useState(false)
  const { registerFocus, unregisterFocus } = useFocusedNotes()
  const { tags } = useTags()
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
      Mention.configure({
        HTMLAttributes: { class: 'mention' },
        renderLabel({ node }) { return `@${node.attrs.label || node.attrs.id}` },
        suggestions: [
          { ...mentionSuggestion, char: '@' },
          { ...commandSuggestion, char: '/', command: ({ editor, range, props }) => {
            if (props.id === 'think-it-faster') {
              editor.chain().focus().insertContentAt(range, getThinkItFasterHtml()).run()
            }
          } }
        ]
      })
    ],
    content: initialValue || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'px-2 py-1 outline-none',
        style: `min-height: ${minHeight}px;`
      }
    },
    onUpdate: ({ editor }) => {
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

  if (!editor) return null

  return (
    <div 
      className={`text-xs transition-all duration-200 ease-in-out relative ${isFocused && !noExpand ? 'z-50 shadow-lg' : ''}`}
      style={{ 
        minHeight,
        maxHeight: isFocused && !noExpand ? 'none' : '250px',
        width: isFocused && !noExpand ? 'calc(100% + 200px)' : '100%',
        overflow: isFocused && !noExpand ? 'visible' : 'hidden'
      }}
    >
      <BubbleMenuToolbar editor={editor} />
      <EditorContent editor={editor} className="notes-input-editor" style={{ minHeight: `${minHeight}px`, transition: 'min-height 200ms ease-in-out' }} />
    </div>
  )
}

export default SmartEditor
