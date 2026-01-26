'use client'
import { useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

const NotesInput = ({ value, placeholder, onStartTyping, onDebouncedChange, debounceMs=500 }:{ value: string, placeholder: string, onStartTyping: () => Promise<unknown> | void, onDebouncedChange: (value: string) => Promise<void> | void, debounceMs?: number }) => {
  const hasStartedRef = useRef(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isExternalUpdate = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder })
    ],
    content: value || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'px-2 py-1 outline-none'
      }
    },
    onUpdate: async ({ editor }) => {
      if (isExternalUpdate.current) {
        isExternalUpdate.current = false
        return
      }
      const html = editor.getHTML()
      if (!hasStartedRef.current && editor.getText().trim().length > 0) {
        hasStartedRef.current = true
        await onStartTyping()
      }
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => onDebouncedChange(html), debounceMs)
    }
  })

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      isExternalUpdate.current = true
      editor.commands.setContent(value || '')
    }
  }, [value, editor])

  if (!editor) return null

  return (
    <div className="flex-1 min-w-0 bg-gray-100">
      <BubbleMenu editor={editor}>
        <div className="flex gap-1 bg-gray-800 text-white px-1 py-0.5 text-xs">
          <button onClick={() => editor.chain().focus().toggleBold().run()} className={`px-1 ${editor.isActive('bold') ? 'bg-gray-600' : ''}`} title="Bold (Cmd+B)">B</button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`px-1 ${editor.isActive('italic') ? 'bg-gray-600' : ''}`} title="Italic (Cmd+I)">I</button>
          <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`px-1 ${editor.isActive('strike') ? 'bg-gray-600' : ''}`} title="Strikethrough">S</button>
        </div>
      </BubbleMenu>
      <EditorContent editor={editor} />
    </div>
  )
}

export default NotesInput
