'use client'
import { useEffect, useRef, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import BubbleMenuToolbar from '../editor/BubbleMenuToolbar'

const CommandHtmlEditor = ({ value, onChange, placeholder = 'HTML content...' }: { value: string, onChange: (html: string) => void, placeholder?: string }) => {
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedRef = useRef<string>(value || '')
  const initializedRef = useRef(false)
  const isFocusedRef = useRef(false)
  const saveContent = useCallback((content: string) => {
    if (content !== lastSavedRef.current) {
      lastSavedRef.current = content
      onChange(content)
    }
  }, [onChange])
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: value || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'px-2 py-1 outline-none bg-gray-900 text-white text-xs min-h-[60px]',
      }
    },
    onUpdate: ({ editor }) => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = setTimeout(() => {
        saveContent(editor.getHTML())
      }, 300)
    },
    onFocus: () => { isFocusedRef.current = true },
    onBlur: ({ editor }) => {
      isFocusedRef.current = false
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
      saveContent(editor.getHTML())
    }
  })
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [])
  useEffect(() => {
    if (editor && !initializedRef.current && value) {
      editor.commands.setContent(value)
      lastSavedRef.current = value
      initializedRef.current = true
    }
  }, [value, editor])
  useEffect(() => {
    if (editor && value !== undefined && !isFocusedRef.current && initializedRef.current) {
      const currentContent = editor.getHTML()
      if (value !== currentContent && value !== lastSavedRef.current) {
        editor.commands.setContent(value)
        lastSavedRef.current = value
      }
    }
  }, [value, editor])
  if (!editor) return null
  return (
    <div className="relative">
      <BubbleMenuToolbar editor={editor} />
      <EditorContent editor={editor} className="notes-input-editor" />
    </div>
  )
}

export default CommandHtmlEditor
