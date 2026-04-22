'use client'
import { useEffect, useState } from 'react'
import { useAiTags } from '../hooks/useAiTags'
import { usePrompts } from '../hooks/usePrompts'
import { useOpenRouterModels } from '../hooks/useOpenRouterModels'
import PromptDropdown from './PromptDropdown'
import PromptEditModal from './PromptEditModal'
import OpenRouterModelTypeahead from './OpenRouterModelTypeahead'

const SELECTED_PROMPT_LS_KEY = 'logging.runAi.selectedPromptId'
const SELECTED_MODEL_LS_KEY = 'logging.runAi.selectedModelId'
const DEFAULT_AI_MODEL = 'anthropic/claude-opus-4.5'

const RunAiCommandPanel = ({ datetime, onComplete }:{ datetime: string, onComplete?: () => void }) => {
  const { isPredicting, predictTags, error } = useAiTags()
  const { prompts, isLoading: isLoadingPrompts, createPrompt, updatePrompt, deletePrompt } = usePrompts()
  const { models, isLoading: isLoadingModels } = useOpenRouterModels()
  const [selectedPromptId, setSelectedPromptId] = useState<number | null>(null)
  const [selectedModelId, setSelectedModelId] = useState<string>(DEFAULT_AI_MODEL)
  const [isEditOpen, setIsEditOpen] = useState(false)

  // Hydrate selection from localStorage on mount
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    const storedPromptId = typeof window !== 'undefined' ? window.localStorage.getItem(SELECTED_PROMPT_LS_KEY) : null
    if (storedPromptId) {
      const parsed = Number(storedPromptId)
      if (Number.isFinite(parsed)) setSelectedPromptId(parsed)
    }
    const storedModelId = typeof window !== 'undefined' ? window.localStorage.getItem(SELECTED_MODEL_LS_KEY) : null
    if (storedModelId) setSelectedModelId(storedModelId)
  }, [])

  // Default to first prompt once they load if nothing valid is stored
  useEffect(() => {
    if (prompts.length === 0) return
    if (selectedPromptId !== null && prompts.some(p => p.id === selectedPromptId)) return
    setSelectedPromptId(prompts[0].id)
  }, [prompts, selectedPromptId])

  const handleSelectPrompt = (promptId: number) => {
    setSelectedPromptId(promptId)
    if (typeof window !== 'undefined') window.localStorage.setItem(SELECTED_PROMPT_LS_KEY, String(promptId))
  }
  const handleSelectModel = (modelId: string) => {
    setSelectedModelId(modelId)
    if (typeof window !== 'undefined') window.localStorage.setItem(SELECTED_MODEL_LS_KEY, modelId)
  }

  const handleRun = async () => {
    await predictTags({ datetime, promptId: selectedPromptId ?? undefined, model: selectedModelId })
    onComplete?.()
  }

  const handleCreateNewPrompt = async () => {
    const created = await createPrompt({ title: 'Untitled prompt', text: '' })
    if (created) handleSelectPrompt(created.id)
    setIsEditOpen(true)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={handleRun}
        disabled={isPredicting}
        className="text-xs text-gray-400 hover:text-white disabled:opacity-50"
      >
        {isPredicting ? 'Running...' : 'Run AI'}
      </button>
      <span className="text-gray-700">·</span>
      {isLoadingPrompts ? (
        <span className="text-xs text-gray-600">loading prompts…</span>
      ) : (
        <PromptDropdown prompts={prompts} selectedPromptId={selectedPromptId} onSelect={handleSelectPrompt} onCreateNew={handleCreateNewPrompt} />
      )}
      <button className="text-xs text-gray-500 hover:text-white" onClick={() => setIsEditOpen(true)}>edit</button>
      <span className="text-gray-700">·</span>
      {isLoadingModels ? (
        <span className="text-xs text-gray-600">loading models…</span>
      ) : (
        <OpenRouterModelTypeahead models={models} selectedModelId={selectedModelId} onSelect={handleSelectModel} />
      )}
      {error && <div className="text-xs text-red-500">Error: {error}</div>}
      {isEditOpen && (
        <PromptEditModal
          prompts={prompts}
          selectedPromptId={selectedPromptId}
          onSelectPrompt={handleSelectPrompt}
          onClose={() => setIsEditOpen(false)}
          onCreatePrompt={createPrompt}
          onUpdatePrompt={updatePrompt}
          onDeletePrompt={deletePrompt}
        />
      )}
    </div>
  )
}

export default RunAiCommandPanel
