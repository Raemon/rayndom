import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'
import { getKeylogsForTimeblock } from '../shared/keylogUtils'

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
      return NextResponse.json({ error: keylogResult.error, predictions: [], createdInstances: [] }, { status: 200 })
    }
    const { keylogText } = keylogResult
    const tags = await prisma.tag.findMany({ orderBy: [{ type: 'asc' }, { name: 'asc' }] })
    if (tags.length === 0) return NextResponse.json({ error: 'No tags defined', predictions: [], createdInstances: [] }, { status: 200 })
    const tagsByType: Record<string, { id: number, name: string }[]> = {}
    for (const tag of tags) {
      if (!tagsByType[tag.type]) tagsByType[tag.type] = []
      tagsByType[tag.type].push({ id: tag.id, name: tag.name })
    }
    const tagTypesDescription = Object.entries(tagsByType).map(([type, tagList]) => {
      const names = tagList.map(t => t.name).join(', ')
      return `- ${type}: ${names}`
    }).join('\n')
    const prompt = `You are analyzing keylogs from the past 15 minutes to determine which tags apply to this time period.

Here are the keylogs:
${keylogText}

Here are the available tag types and their possible values:
${tagTypesDescription}

For each tag type, select the ONE tag that best describes what was happening during this time period. If no tag from a type applies, don't include that type in your response.

For each tag, provide a brief reason explaining why you chose it. The reason should be 1-2 sentences and must end with your confidence level in parentheses: (high confidence), (medium confidence), or (low confidence).

Respond with ONLY a JSON array of objects with the format:
[{"type": "tagType", "name": "tagName", "reason": "Brief explanation of why this tag applies. (high confidence)"}, ...]

Example: [{"type": "activity", "name": "coding", "reason": "User was writing TypeScript code in VS Code based on keylog patterns. (high confidence)"}, {"type": "project", "name": "timer-app", "reason": "References to timer-related files suggest work on the timer project. (medium confidence)"}]

Your response must be valid JSON and nothing else.`
    const client = getOpenRouterClient()
    const completion = await client.chat.completions.create({
      model: 'anthropic/claude-sonnet-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
    })
    const responseText = completion.choices[0]?.message?.content || '[]'
    let predictions: { type: string, name: string, reason?: string }[] = []
    try {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/)
      if (jsonMatch) predictions = JSON.parse(jsonMatch[0])
    } catch (e) {
      return NextResponse.json({ error: 'Failed to parse LLM response', raw: responseText }, { status: 500 })
    }
    const createdInstances = []
    for (const pred of predictions) {
      const tag = tags.find(t => t.type === pred.type && t.name === pred.name)
      if (!tag) continue
      const existing = await prisma.tagInstance.findFirst({ where: { tagId: tag.id, datetime: blockDatetime } })
      if (existing) continue
      const tagInstance = await prisma.tagInstance.create({
        data: { tagId: tag.id, datetime: blockDatetime, llmPredicted: true, approved: false, llmReason: pred.reason || null },
        include: { tag: { include: { parentTag: true } } }
      })
      createdInstances.push(tagInstance)
    }
    return NextResponse.json({ predictions, createdInstances })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
