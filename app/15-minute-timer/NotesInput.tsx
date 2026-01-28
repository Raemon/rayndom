'use client'
import { useEffect, useRef, useCallback, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { useFocusedNotes } from './FocusedNotesContext'

const NotesInput = ({ noteKey, initialValue, externalValue, placeholder, onSave, minHeight=25 }:{ noteKey?: string, initialValue: string, externalValue?: string, placeholder: string, onSave?: (content: string) => void, minHeight?: number }) => {
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedRef = useRef<string>(initialValue || '')
  const initializedRef = useRef(false)
  const isFocusedRef = useRef(false)
  const [isFocused, setIsFocused] = useState(false)
  const { registerFocus, unregisterFocus } = useFocusedNotes()
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
      TaskItem.configure({ nested: true })
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
      className={`text-xs transition-all duration-200 ease-in-out relative ${isFocused ? 'z-50 shadow-lg' : ''}`}
      style={{ 
        minHeight,
        maxHeight: isFocused ? 'none' : '250px',
        width: isFocused ? 'calc(100% + 200px)' : '100%',
        overflow: isFocused ? 'visible' : 'hidden'
      }}
    >
      <BubbleMenu editor={editor}>
        <div className="flex gap-1 bg-gray-800 text-black px-1 py-0.5 text-xs">
          <button onClick={() => editor.chain().focus().toggleBold().run()} className={`px-1 ${editor.isActive('bold') ? 'bg-gray-600' : ''}`} title="Bold (Cmd+B)">B</button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`px-1 ${editor.isActive('italic') ? 'bg-gray-600' : ''}`} title="Italic (Cmd+I)">I</button>
          <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`px-1 ${editor.isActive('strike') ? 'bg-gray-600' : ''}`} title="Strikethrough">S</button>
          <button onClick={() => editor.chain().focus().toggleTaskList().run()} className={`px-1 ${editor.isActive('taskList') ? 'bg-gray-600' : ''}`} title="Task List (Cmd+Shift+9)">☑</button>
        </div>
      </BubbleMenu>
      <EditorContent editor={editor} className="notes-input-editor" style={{ minHeight: `${minHeight}px`, transition: 'min-height 200ms ease-in-out' }} />
    </div>
  )
}

export default NotesInput
