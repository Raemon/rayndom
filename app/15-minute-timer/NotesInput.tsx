'use client'
import { useEffect, useRef, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

const NotesInput = ({ initialValue, placeholder, onSave }:{ initialValue: string, placeholder: string, onSave?: (content: string) => void }) => {
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedRef = useRef<string>(initialValue || '')
  const initializedRef = useRef(false)
  const saveContent = useCallback((content: string) => {
    if (onSave && content !== lastSavedRef.current) {
      lastSavedRef.current = content
      onSave(content)
    }
  }, [onSave])
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder })
    ],
    content: initialValue || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'px-2 py-1 outline-none',
        style: 'min-height: 100px;'
      }
    },
    onUpdate: ({ editor }) => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = setTimeout(() => {
        saveContent(editor.getHTML())
      }, 500)
    },
    onBlur: ({ editor }) => {
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
    if (editor && !initializedRef.current && initialValue) {
      editor.commands.setContent(initialValue)
      lastSavedRef.current = initialValue
      initializedRef.current = true
    }
  }, [initialValue, editor])

  if (!editor) return null

  return (
    <div className="flex-1 min-w-0 bg-gray-100" style={{ minHeight: '100px' }}>
      <BubbleMenu editor={editor}>
        <div className="flex gap-1 bg-gray-800 text-black px-1 py-0.5 text-xs">
          <button onClick={() => editor.chain().focus().toggleBold().run()} className={`px-1 ${editor.isActive('bold') ? 'bg-gray-600' : ''}`} title="Bold (Cmd+B)">B</button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`px-1 ${editor.isActive('italic') ? 'bg-gray-600' : ''}`} title="Italic (Cmd+I)">I</button>
          <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`px-1 ${editor.isActive('strike') ? 'bg-gray-600' : ''}`} title="Strikethrough">S</button>
        </div>
      </BubbleMenu>
      <EditorContent editor={editor} style={{ minHeight: '100px' }} />
    </div>
  )
}

export default NotesInput
