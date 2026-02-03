import { useCallback, useState } from 'react'
import type { TagInstance } from '../types'

type PredictTagsResult = {
  predictions: { type: string, name: string, reason?: string }[]
  createdInstances: TagInstance[]
  keylogCount: number
  aiNotes: string | null
}

export const useAiTags = () => {
  const [isPredicting, setIsPredicting] = useState(false)
  const [result, setResult] = useState<PredictTagsResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const predictTags = useCallback(async ({ datetime }:{ datetime: string }) => {
    setIsPredicting(true)
    setError(null)
    try {
      const res = await fetch('/api/timer/predict-tags', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ datetime }) })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Failed to predict tags')
        return null
      }
      setResult(json)
      return json as PredictTagsResult
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error'
      setError(message)
      return null
    } finally {
      setIsPredicting(false)
    }
  }, [])

  return { isPredicting, result, error, predictTags }
}
