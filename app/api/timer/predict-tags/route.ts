import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

const getRequiredEnv = (key: string) => {
  const value = process.env[key]
  if (!value) throw new Error(`Missing ${key}`)
  return value
}

const getOpenRouterClient = () => {
  const apiKey = getRequiredEnv('OPENROUTER_API_KEY')
  return new OpenAI({ apiKey, baseURL: 'https://openrouter.ai/api/v1' })
}

type KeylogEntry = { timestamp: string, text: string, app?: string }

const parseKeylogText = (text: string): KeylogEntry[] => {
  // Format: "2026-01-27 00.01.00: AppName\ntext content\n\n"
  const entries: KeylogEntry[] = []
  const blocks = text.split(/\n\n+/)
  for (const block of blocks) {
    if (!block.trim()) continue
    const lines = block.split('\n')
    const headerMatch = lines[0]?.match(/^(\d{4}-\d{2}-\d{2} \d{2}\.\d{2}\.\d{2}):\s*(.*)$/)
    if (headerMatch) {
      const [, timestampStr, app] = headerMatch
      // Convert "2026-01-27 00.01.00" to ISO format (local time, no Z suffix)
      const isoTimestamp = timestampStr.replace(/ /, 'T').replace(/\./g, ':')
      const textContent = lines.slice(1).join('\n').trim()
      entries.push({ timestamp: isoTimestamp, text: textContent, app: app || undefined })
    }
  }
  return entries
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const datetime = body?.datetime // The datetime for the timeblock we're predicting tags for
    console.log('[predict-tags] Request received for datetime:', datetime)
    if (!datetime) return NextResponse.json({ error: 'Missing datetime' }, { status: 400 })
    const blockDatetime = new Date(datetime)
    const fifteenMinutesAgo = new Date(blockDatetime.getTime() - 15 * 60 * 1000)
    console.log('[predict-tags] Time window:', fifteenMinutesAgo.toISOString(), 'to', blockDatetime.toISOString())
    // 1. Get keylogs from localhost:8765
    let keylogs: KeylogEntry[] = []
    try {
      console.log('[predict-tags] Fetching keylogs from localhost:8765...')
      const keylogRes = await fetch('http://localhost:8765/today')
      if (!keylogRes.ok) {
        console.error('[predict-tags] Keylog server returned error:', keylogRes.status, keylogRes.statusText)
        return NextResponse.json({ error: `Keylog server returned ${keylogRes.status}`, predictions: [] }, { status: 200 })
      }
      const responseText = await keylogRes.text()
      if (!responseText.trim()) {
        return NextResponse.json({ error: 'Keylog server returned empty response', predictions: [] }, { status: 200 })
      }
      // Parse plain text format: "2026-01-27 00.01.00: AppName\ntext\n\n"
      const allKeylogs = parseKeylogText(responseText)
      console.log('[predict-tags] Total keylogs from server:', allKeylogs.length)
      if (allKeylogs.length > 0) {
        console.log('[predict-tags] First keylog timestamp:', allKeylogs[0].timestamp, '-> Date:', new Date(allKeylogs[0].timestamp).toISOString())
        console.log('[predict-tags] Last keylog timestamp:', allKeylogs[allKeylogs.length - 1].timestamp, '-> Date:', new Date(allKeylogs[allKeylogs.length - 1].timestamp).toISOString())
      }
      console.log('[predict-tags] blockDatetime:', blockDatetime.toISOString(), 'fifteenMinutesAgo:', fifteenMinutesAgo.toISOString())
      keylogs = allKeylogs.filter((entry: KeylogEntry) => {
        const entryTime = new Date(entry.timestamp)
        return entryTime >= fifteenMinutesAgo && entryTime <= blockDatetime
      })
      console.log('[predict-tags] Keylogs in time window:', keylogs.length)
    } catch (e) {
      console.error('[predict-tags] Failed to fetch keylogs:', e)
      return NextResponse.json({ error: 'Keylog server not reachable at localhost:8765', predictions: [] }, { status: 200 })
    }
    if (keylogs.length === 0) {
      console.log('[predict-tags] No keylogs found for the past 15 minutes')
      return NextResponse.json({ error: 'No keylogs found for the past 15 minutes', predictions: [] }, { status: 200 })
    }
    // 2. Get all tags
    console.log('[predict-tags] Fetching tags from database...')
    const tags = await prisma.tag.findMany({ orderBy: [{ type: 'asc' }, { name: 'asc' }] })
    console.log('[predict-tags] Found', tags.length, 'tags')
    if (tags.length === 0) return NextResponse.json({ error: 'No tags defined', predictions: [] }, { status: 200 })
    // Group tags by type
    const tagsByType: Record<string, { id: number, name: string }[]> = {}
    for (const tag of tags) {
      if (!tagsByType[tag.type]) tagsByType[tag.type] = []
      tagsByType[tag.type].push({ id: tag.id, name: tag.name })
    }
    console.log('[predict-tags] Tag types:', Object.keys(tagsByType).join(', '))
    // 3. Make request to Claude Opus 4.5 via OpenRouter
    const keylogText = keylogs.map(k => `[${k.timestamp}]${k.app ? ` (${k.app})` : ''} ${k.text}`).join('\n')
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
    console.log('[predict-tags] Sending request to LLM (anthropic/claude-sonnet-4)...')
    console.log('[predict-tags] Prompt length:', prompt.length, 'chars')
    const completion = await client.chat.completions.create({
      model: 'anthropic/claude-sonnet-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
    })
    const responseText = completion.choices[0]?.message?.content || '[]'
    console.log('[predict-tags] LLM response:', responseText)
    // Parse the response
    let predictions: { type: string, name: string, reason?: string }[] = []
    try {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/)
      if (jsonMatch) predictions = JSON.parse(jsonMatch[0])
      console.log('[predict-tags] Parsed predictions:', JSON.stringify(predictions))
    } catch (e) {
      console.error('[predict-tags] Failed to parse LLM response:', responseText, e)
      return NextResponse.json({ error: 'Failed to parse LLM response', raw: responseText }, { status: 500 })
    }
    // 4. Create tag instances for each prediction
    console.log('[predict-tags] Processing', predictions.length, 'predictions...')
    const createdInstances = []
    for (const pred of predictions) {
      const tag = tags.find(t => t.type === pred.type && t.name === pred.name)
      if (!tag) {
        console.log('[predict-tags] Tag not found:', pred.type, pred.name)
        continue
      }
      // Check if this tag already exists for this datetime
      const existing = await prisma.tagInstance.findFirst({ where: { tagId: tag.id, datetime: blockDatetime } })
      if (existing) {
        console.log('[predict-tags] Tag instance already exists:', pred.type, pred.name)
        continue
      }
      const tagInstance = await prisma.tagInstance.create({
        data: { tagId: tag.id, datetime: blockDatetime, llmPredicted: true, approved: false, llmReason: pred.reason || null },
        include: { tag: true }
      })
      console.log('[predict-tags] Created tag instance:', pred.type, pred.name, '(id:', tagInstance.id, ')')
      createdInstances.push(tagInstance)
    }
    console.log('[predict-tags] Done. Created', createdInstances.length, 'tag instances')
    return NextResponse.json({ predictions, createdInstances, keylogCount: keylogs.length })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[predict-tags] Unhandled error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
