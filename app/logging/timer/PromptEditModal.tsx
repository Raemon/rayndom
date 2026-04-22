'use client'
import { useEffect, useState } from 'react'
import type { Prompt } from '../types'

type PromptEditModalProps = {
  prompts: Prompt[]
  selectedPromptId: number | null
  onSelectPrompt: (promptId: number) => void
  onClose: () => void
  onCreatePrompt: (args: { title: string, text: string }) => Promise<Prompt | undefined>
  onUpdatePrompt: (args: { id: number, title?: string, text?: string }) => Promise<boolean>
  onDeletePrompt: (args: { id: number }) => Promise<void>
}

const PromptEditModal = ({ prompts, selectedPromptId, onSelectPrompt, onClose, onCreatePrompt, onUpdatePrompt, onDeletePrompt }:PromptEditModalProps) => {
  const [editingId, setEditingId] = useState<number | null>(selectedPromptId)
  const editingPrompt = prompts.find(p => p.id === editingId) || null
  const [draftTitle, setDraftTitle] = useState(editingPrompt?.title || '')
  const [draftText, setDraftText] = useState(editingPrompt?.text || '')
  const [prevEditingId, setPrevEditingId] = useState<number | null>(editingId)
  if (editingId !== prevEditingId) {
    setPrevEditingId(editingId)
    setDraftTitle(editingPrompt?.title || '')
    setDraftText(editingPrompt?.text || '')
  }
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const saveDraft = async () => {
    if (!editingPrompt) return
    if (draftTitle === editingPrompt.title && draftText === editingPrompt.text) return
    await onUpdatePrompt({ id: editingPrompt.id, title: draftTitle, text: draftText })
  }

  const handleAddNew = async () => {
    const created = await onCreatePrompt({ title: 'Untitled prompt', text: '' })
    if (created) {
      setEditingId(created.id)
      onSelectPrompt(created.id)
    }
  }

  const handleDelete = async () => {
    if (!editingPrompt) return
    await onDeletePrompt({ id: editingPrompt.id })
    const remaining = prompts.filter(p => p.id !== editingPrompt.id)
    if (remaining.length > 0) {
      setEditingId(remaining[0].id)
      onSelectPrompt(remaining[0].id)
    } else {
      setEditingId(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-gray-800 p-4 w-[860px] max-w-[95vw] h-[80vh] flex" onClick={e => e.stopPropagation()}>
        <div className="w-48 shrink-0 mr-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/70 text-xs uppercase tracking-wider">Prompts</span>
            <button className="text-white/40 hover:text-white text-xs px-1" onClick={handleAddNew} title="New prompt">+</button>
          </div>
          <div className="flex-1 overflow-y-auto flex flex-col gap-px">
            {prompts.map(prompt => (
              <button
                key={prompt.id}
                className={`text-left text-xs px-2 py-1 truncate ${editingId === prompt.id ? 'bg-white/15 text-white' : 'text-gray-300 hover:bg-white/5'}`}
                onClick={async () => {
                  await saveDraft()
                  setEditingId(prompt.id)
                  onSelectPrompt(prompt.id)
                }}
              >
                {prompt.title || '(untitled)'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          {editingPrompt ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <input
                  className="flex-1 px-2 py-1 bg-gray-900 text-white text-sm outline-none"
                  value={draftTitle}
                  onChange={e => setDraftTitle(e.target.value)}
                  onBlur={saveDraft}
                  placeholder="Prompt title"
                />
                <button className="text-xs text-gray-500 hover:text-red-400 px-2" onClick={handleDelete}>delete</button>
                <button className="text-xs text-gray-300 hover:text-white px-2" onClick={async () => { await saveDraft(); onClose() }}>done</button>
              </div>
              <textarea
                className="flex-1 px-2 py-2 bg-gray-900 text-white text-xs font-mono outline-none resize-none w-full"
                value={draftText}
                onChange={e => setDraftText(e.target.value)}
                onBlur={saveDraft}
                placeholder="Prompt text. Use {{keylogText}}, {{screenshotSummariesText}}, {{openRouterBalance}} as placeholders."
              />
              <div className="text-[10px] text-gray-500 mt-1">
                Available placeholders: <code>{`{{keylogText}}`}</code> <code>{`{{screenshotSummariesText}}`}</code> <code>{`{{openRouterBalance}}`}</code>
              </div>
            </>
          ) : (
            <div className="text-gray-500 text-xs flex-1 flex items-center justify-center">Select a prompt or add a new one.</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PromptEditModal
