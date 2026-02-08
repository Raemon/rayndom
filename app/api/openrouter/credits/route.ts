import { NextResponse } from 'next/server'

const getRequiredEnv = (key: string) => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing ${key}`)
  }
  return value
}

export async function GET() {
  try {
    const apiKey = getRequiredEnv('OPENROUTER_MANAGEMENT_API_KEY')
    const response = await fetch('https://openrouter.ai/api/v1/credits', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`)
    }
    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
