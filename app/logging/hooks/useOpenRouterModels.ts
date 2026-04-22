import { useEffect, useState } from 'react'

export type OpenRouterModel = {
  id: string
  name: string
  context_length?: number
  pricing?: { prompt?: string, completion?: string }
}

export const useOpenRouterModels = () => {
  const [models, setModels] = useState<OpenRouterModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const res = await fetch('/api/timer/openrouter-models')
        const json = await res.json()
        if (cancelled) return
        if (!res.ok && !json.models) {
          setError(json.error || 'Failed to fetch OpenRouter models')
          setModels([])
        } else {
          setModels(json.models || [])
        }
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [])

  return { models, isLoading, error }
}
