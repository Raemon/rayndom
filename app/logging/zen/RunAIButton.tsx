'use client'
import { useState } from 'react'
import type { Timeblock } from '../types'

const defaultPrompt = `You are analyzing keylogs from the past 15 minutes.

Here are the keylogs:
{{keylogText}}

Please think to yourself (but do not say) what you think my goal is write now.

Then, think to yourself (but do not say) 10 very useful things I might benefit from knowing. Then, tell me the most useful seeming one of them. Render the rest as a collapsed detail section.
`

const RunAIButton = ({ ensureTimeblock, onComplete }: {
  ensureTimeblock: () => Promise<Timeblock>,
  onComplete?: () => void,
}) => {
  const [loadingTags, setLoadingTags] = useState(false)
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [prompt, setPrompt] = useState(defaultPrompt)
  const [showPrompt, setShowPrompt] = useState(false)
  const handleRunAI = async () => {
    setError(null)
    const tb = await ensureTimeblock()
    const datetime = tb.datetime
    setLoadingTags(true)
    setLoadingQuestions(true)
    const tagsPromise = fetch('/api/timer/check-tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ datetime }),
    }).then(async (res) => {
      setLoadingTags(false)
      return res.json()
    }).catch((err) => {
      setLoadingTags(false)
      console.error('Error checking tags:', err)
      return { error: err.message }
    })
    const questionsPromise = fetch('/api/timer/check-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ datetime, prompt }),
    }).then(async (res) => {
      setLoadingQuestions(false)
      return res.json()
    }).catch((err) => {
      setLoadingQuestions(false)
      console.error('Error checking questions:', err)
      return { error: err.message }
    })
    const [tagsResult, questionsResult] = await Promise.all([tagsPromise, questionsPromise])
    const errors: string[] = []
    if (tagsResult?.error) errors.push(`Tags: ${tagsResult.error}`)
    if (questionsResult?.error) errors.push(`Questions: ${questionsResult.error}`)
    if (errors.length > 0) {
      setError(errors.join('; '))
    }
    onComplete?.()
  }
  const isLoading = loadingTags || loadingQuestions
  return (
    <div className="mb-2">
      <button
        onClick={handleRunAI}
        disabled={isLoading}
        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
      >
        {isLoading ? 'running...' : 'run AI'}
      </button>
      <button
        onClick={() => setShowPrompt(!showPrompt)}
        className="ml-2 text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200"
      >
        edit
      </button>
      {isLoading && (
        <span className="ml-2 text-xs text-gray-500">
          {loadingTags && 'tags'}
          {loadingTags && loadingQuestions && ', '}
          {loadingQuestions && 'questions'}
        </span>
      )}
      {error && <span className="ml-2 text-xs text-red-500">{error}</span>}
      {showPrompt && (
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={6}
          className="mt-1 w-full text-xs px-2 py-1 bg-gray-50"
        />
      )}
    </div>
  )
}

export default RunAIButton
