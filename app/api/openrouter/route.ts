import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const getRequiredEnv = (key: string) => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing ${key}`)
  }
  return value
}

const getOpenRouterClient = () => {
  const apiKey = getRequiredEnv('OPENROUTER_API_KEY')
  const headers: Record<string, string> = {}
  return new OpenAI({ apiKey, baseURL: 'https://openrouter.ai/api/v1', defaultHeaders: headers })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    const client = getOpenRouterClient()
    const data = await client.chat.completions.create(body as OpenAI.Chat.Completions.ChatCompletionCreateParams)
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
