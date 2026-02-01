'use client'
import { BubbleMenu } from '@tiptap/react/menus'
import type { Editor } from '@tiptap/react'

const BubbleMenuToolbar = ({ editor }: { editor: Editor }) => {
  return (
    <BubbleMenu editor={editor}>
      <div className="flex gap-1 bg-gray-800 text-black px-1 py-0.5 text-xs">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={`px-1 ${editor.isActive('bold') ? 'bg-gray-600' : ''}`} title="Bold (Cmd+B)">B</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`px-1 ${editor.isActive('italic') ? 'bg-gray-600' : ''}`} title="Italic (Cmd+I)">I</button>
        <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`px-1 ${editor.isActive('strike') ? 'bg-gray-600' : ''}`} title="Strikethrough">S</button>
        <button onClick={() => editor.chain().focus().toggleTaskList().run()} className={`px-1 ${editor.isActive('taskList') ? 'bg-gray-600' : ''}`} title="Task List (Cmd+Shift+9)">☑</button>
      </div>
    </BubbleMenu>
  )
}

export default BubbleMenuToolbar
