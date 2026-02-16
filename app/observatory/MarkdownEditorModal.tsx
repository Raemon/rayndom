'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { BubbleMenu } from '@tiptap/react/menus'
import { marked } from 'marked'
import TurndownService from 'turndown'

const turndown = new TurndownService({ headingStyle: 'atx', hr: '---', bulletListMarker: '-', codeBlockStyle: 'fenced' })

const MarkdownEditorModal = ({ onClose }:{ onClose: () => void }) => {
  const [markdown, setMarkdown] = useState('')
  const [html, setHtml] = useState('')
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    fetch('/api/observatory/prompt')
      .then(r => r.json())
      .then(data => {
        setMarkdown(data.content)
        setHtml(marked.parse(data.content) as string)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editing) setEditing(false)
        else onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, editing])
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } })],
    content: '',
    immediatelyRender: false,
    editorProps: {
      attributes: { class: 'outline-none px-4 py-3 min-h-[200px]' }
    }
  })
  const handleDoubleClick = useCallback(() => {
    if (editing || !editor) return
    const parsed = marked.parse(markdown) as string
    editor.commands.setContent(parsed)
    setEditing(true)
    setTimeout(() => editor.commands.focus(), 50)
  }, [editing, editor, markdown])
  const handleSave = useCallback(async () => {
    if (!editor) return
    setSaving(true)
    const editorHtml = editor.getHTML()
    const newMarkdown = turndown.turndown(editorHtml)
    try {
      await fetch('/api/observatory/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMarkdown })
      })
      setMarkdown(newMarkdown)
      setHtml(marked.parse(newMarkdown) as string)
      setEditing(false)
    } catch (e) {
      console.error('Failed to save', e)
    } finally {
      setSaving(false)
    }
  }, [editor])
  const handleCancel = useCallback(() => {
    setEditing(false)
  }, [])
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-[#fffff8] text-[#1f1f1f] w-[800px] max-w-[90vw] max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#ddd]">
          <span className="text-[13px] font-medium uppercase tracking-[0.5px]">Interest Filter Prompt</span>
          <div className="flex items-center gap-2">
            {editing && (
              <>
                <button onClick={handleCancel} className="text-[12px] px-2 py-0.5 text-[#666] cursor-pointer bg-transparent border-0 hover:text-[#333]">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="text-[12px] px-2 py-0.5 text-[#1f1f1f] cursor-pointer bg-transparent border-0 hover:text-[#666]">{saving ? 'Saving...' : 'Save'}</button>
              </>
            )}
            {!editing && <span className="text-[11px] text-[#999]">double-click to edit</span>}
            <button onClick={onClose} className="text-[18px] cursor-pointer bg-transparent border-0 text-[#999] hover:text-[#333] leading-none">✕</button>
          </div>
        </div>
        <div className="overflow-y-auto flex-1 px-4 py-3">
          {loading && <div className="text-[13px] text-[#999]">Loading...</div>}
          {!loading && !editing && (
            <div ref={contentRef} onDoubleClick={handleDoubleClick}
              className="text-[14px] leading-[1.6] font-[Georgia,serif] cursor-default
                [&_h1]:text-[22px] [&_h1]:font-bold [&_h1]:mt-5 [&_h1]:mb-2
                [&_h2]:text-[18px] [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2
                [&_h3]:text-[15px] [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1
                [&_p]:my-2
                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2
                [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2
                [&_li]:my-0.5
                [&_strong]:font-bold
                [&_em]:italic
                [&_hr]:my-4 [&_hr]:border-[#ccc]
                [&_code]:bg-[#f0f0e8] [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[13px] [&_code]:font-mono
                [&_pre]:bg-[#f0f0e8] [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre]:my-2
                [&_blockquote]:border-l-3 [&_blockquote]:border-[#ccc] [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-[#666]"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}
          {!loading && editing && editor && (
            <div className="text-[14px] font-[Georgia,serif] tiptap">
              <BubbleMenu editor={editor}>
                <div className="flex gap-1 bg-[#333] text-white px-1 py-0.5 text-xs">
                  <button onClick={() => editor.chain().focus().toggleBold().run()} className={`px-1 cursor-pointer border-0 bg-transparent text-white ${editor.isActive('bold') ? 'bg-[#555]' : ''}`}>B</button>
                  <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`px-1 cursor-pointer border-0 bg-transparent text-white ${editor.isActive('italic') ? 'bg-[#555]' : ''}`}>I</button>
                  <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`px-1 cursor-pointer border-0 bg-transparent text-white ${editor.isActive('strike') ? 'bg-[#555]' : ''}`}>S</button>
                </div>
              </BubbleMenu>
              <EditorContent editor={editor} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MarkdownEditorModal
