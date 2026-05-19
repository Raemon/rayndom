'use client'
import { BubbleMenu } from '@tiptap/react/menus'
import type { Editor } from '@tiptap/react'

const preventBlur = (e: React.MouseEvent) => e.preventDefault()

const BubbleMenuToolbar = ({ editor }: { editor: Editor }) => {
  return (
    <BubbleMenu editor={editor}>
      <div className="flex items-center gap-1 bg-gray-800 text-black px-1 py-0.5 text-xs">
        <button onMouseDown={preventBlur} onClick={() => editor.chain().focus().toggleBold().run()} className={`px-1 ${editor.isActive('bold') ? 'bg-gray-600' : ''}`} title="Bold (Cmd+B)">B</button>
        <button onMouseDown={preventBlur} onClick={() => editor.chain().focus().toggleItalic().run()} className={`px-1 ${editor.isActive('italic') ? 'bg-gray-600' : ''}`} title="Italic (Cmd+I)">I</button>
        <button onMouseDown={preventBlur} onClick={() => editor.chain().focus().toggleStrike().run()} className={`px-1 ${editor.isActive('strike') ? 'bg-gray-600' : ''}`} title="Strikethrough">S</button>
        <button onMouseDown={preventBlur} onClick={() => editor.chain().focus().setParagraph().run()} className={`px-1 ${editor.isActive('paragraph') ? 'bg-gray-600' : ''}`} title="Paragraph (Cmd+0)">¶</button>
        <button onMouseDown={preventBlur} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`px-1 font-bold text-sm leading-none ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-600' : ''}`} title="Heading (Cmd+1)">H</button>
        <button onMouseDown={preventBlur} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`px-1 opacity-50 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-600' : ''}`} title="Small heading (Cmd+2)">h</button>
        <button onMouseDown={preventBlur} onClick={() => editor.chain().focus().toggleTaskList().run()} className={`px-1 ${editor.isActive('taskList') ? 'bg-gray-600' : ''}`} title="Task List (Cmd+Shift+9)">☑</button>
      </div>
    </BubbleMenu>
  )
}

export default BubbleMenuToolbar
