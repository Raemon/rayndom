import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'
import { marked } from 'marked'
import { getKeylogsForTimeblock } from '../shared/keylogUtils'
import { getAiNotesPrompt } from '../predict-tags/aiNotesPrompt'

const getRequiredEnv = (key: string) => {
  const value = process.env[key]
  if (!value) throw new Error(`Missing ${key}`)
  return value
}

const getOpenRouterClient = () => {
  const apiKey = getRequiredEnv('OPENROUTER_API_KEY')
  return new OpenAI({ apiKey, baseURL: 'https://openrouter.ai/api/v1' })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const datetime = body?.datetime
    if (!datetime) return NextResponse.json({ error: 'Missing datetime' }, { status: 400 })
    const blockDatetime = new Date(datetime)
    const keylogResult = await getKeylogsForTimeblock(datetime)
    if ('error' in keylogResult) {
      return NextResponse.json({ error: keylogResult.error, aiNotes: null }, { status: 200 })
    }
    const { keylogText } = keylogResult
    const promptTemplate = body?.prompt
    const prompt = promptTemplate ? promptTemplate.replace('{{keylogText}}', keylogText) : getAiNotesPrompt({ keylogText })
    const client = getOpenRouterClient()
    const aiNotesCompletion = await client.chat.completions.create({
      model: 'anthropic/claude-opus-4.5',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
    })
    const aiNotesMarkdown = aiNotesCompletion.choices[0]?.message?.content || null
    const aiNotes = aiNotesMarkdown ? (marked.parse(aiNotesMarkdown) as string) : null
    if (aiNotes !== null) {
      const existingTimeblock = await prisma.timeblock.findFirst({ where: { datetime: blockDatetime } })
      if (existingTimeblock) {
        await prisma.timeblock.update({ where: { id: existingTimeblock.id }, data: { aiNotes } })
      } else {
        await prisma.timeblock.create({ data: { datetime: blockDatetime, rayNotes: null, assistantNotes: null, aiNotes } })
      }
    }
    return NextResponse.json({ aiNotes })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
