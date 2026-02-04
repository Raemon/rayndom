import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'
import { getAiNotesPrompt } from './aiNotesPrompt'
import { getKeylogsForTimeblock, getScreenshotSummariesForTimeblock } from '../shared/keylogUtils'
import { marked } from 'marked'

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
    const datetime = body?.datetime // The datetime for the timeblock we're predicting tags for
    console.log('[predict-tags] Request received for datetime:', datetime)
    if (!datetime) return NextResponse.json({ error: 'Missing datetime' }, { status: 400 })
    const blockDatetime = new Date(datetime)
    const keylogResult = await getKeylogsForTimeblock(datetime)
    const keylogs = 'error' in keylogResult ? [] : keylogResult.keylogs
    const keylogText = 'error' in keylogResult ? '' : keylogResult.keylogText
    if ('error' in keylogResult) {
      console.log('[predict-tags] No keylogs found for the past hour, continuing with screenshot summaries only')
    }
    const screenshotSummariesText = await getScreenshotSummariesForTimeblock()
    if (!screenshotSummariesText) {
      console.log('[predict-tags] No screenshots available, skipping prediction')
      return NextResponse.json({ error: 'No screenshots available', predictions: [], createdInstances: [], keylogCount: keylogs.length, aiNotes: null }, { status: 200 })
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
    const tagTypesDescription = Object.entries(tagsByType).map(([type, tagList]) => {
      const names = tagList.map(t => t.name).join(', ')
      return `- ${type}: ${names}`
    }).join('\n')
    const prompt = `You are analyzing keylogs and/or screenshot summaries from the past hour to determine which tags apply to this time period.

${keylogText ? `\nHere are keylogs:\n${keylogText}\n` : ''}
${screenshotSummariesText ? `\nHere are screenshot summaries:\n${screenshotSummariesText}\n` : ''}
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
        include: { tag: { include: { parentTag: true } } }
      })
      console.log('[predict-tags] Created tag instance:', pred.type, pred.name, '(id:', tagInstance.id, ')')
      createdInstances.push(tagInstance)
    }
    console.log('[predict-tags] Done. Created', createdInstances.length, 'tag instances')
    let aiNotes: string | null = null
    try {
      console.log('[predict-tags] Sending request to LLM for aiNotes (anthropic/claude-opus-4.5)...')
      const aiNotesCompletion = await client.chat.completions.create({
        model: 'anthropic/claude-opus-4.5',
        messages: [{ role: 'user', content: getAiNotesPrompt({ keylogText, screenshotSummariesText }) }],
        max_tokens: 800,
      })
      const aiNotesMarkdown = aiNotesCompletion.choices[0]?.message?.content || null
      aiNotes = aiNotesMarkdown ? (marked.parse(aiNotesMarkdown) as string) : null
      if (aiNotes !== null) {
        const existingTimeblock = await prisma.timeblock.findFirst({ where: { datetime: blockDatetime } })
        if (existingTimeblock) {
          await prisma.timeblock.update({ where: { id: existingTimeblock.id }, data: { aiNotes } })
        } else {
          await prisma.timeblock.create({ data: { datetime: blockDatetime, rayNotes: null, assistantNotes: null, aiNotes } })
        }
      }
    } catch (e) {
      console.error('[predict-tags] Failed to generate aiNotes:', e)
    }
    return NextResponse.json({ predictions, createdInstances, keylogCount: keylogs.length, aiNotes })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[predict-tags] Unhandled error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
