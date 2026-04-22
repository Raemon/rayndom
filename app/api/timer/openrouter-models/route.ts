import { NextRequest, NextResponse } from 'next/server'

// In-memory cache for the OpenRouter models list. The list is large (~300 models) but
// changes infrequently, so we serve a cached copy and refresh in the background.
type OpenRouterModel = {
  id: string
  name: string
  context_length?: number
  pricing?: { prompt?: string, completion?: string }
}

let cachedModels: OpenRouterModel[] | null = null
let cachedAt = 0
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

const fetchModels = async (): Promise<OpenRouterModel[]> => {
  const res = await fetch('https://openrouter.ai/api/v1/models', { headers: { 'Content-Type': 'application/json' } })
  if (!res.ok) throw new Error(`OpenRouter /models returned ${res.status}`)
  const json = await res.json()
  const models: OpenRouterModel[] = Array.isArray(json?.data) ? json.data : []
  return models
}

export async function GET(_request: NextRequest) {
  try {
    const now = Date.now()
    if (!cachedModels || now - cachedAt > CACHE_TTL_MS) {
      cachedModels = await fetchModels()
      cachedAt = now
    }
    return NextResponse.json({ models: cachedModels })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[openrouter-models] Failed:', error)
    if (cachedModels) return NextResponse.json({ models: cachedModels, warning: message })
    return NextResponse.json({ error: message, models: [] }, { status: 500 })
  }
}
