'use client'
import { useState } from 'react'
import type { Timeblock } from '../types'

const RunAIButton = ({ ensureTimeblock, onComplete }: {
  ensureTimeblock: () => Promise<Timeblock>,
  onComplete?: () => void,
}) => {
  const [loadingTags, setLoadingTags] = useState(false)
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
      body: JSON.stringify({ datetime }),
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
      {isLoading && (
        <span className="ml-2 text-xs text-gray-500">
          {loadingTags && 'tags'}
          {loadingTags && loadingQuestions && ', '}
          {loadingQuestions && 'questions'}
        </span>
      )}
      {error && <span className="ml-2 text-xs text-red-500">{error}</span>}
    </div>
  )
}

export default RunAIButton
