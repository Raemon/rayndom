import { NextRequest, NextResponse } from 'next/server'
import { requireUserPrisma } from '@/lib/userPrisma'
import OpenAI from 'openai'
import { getAiNotesPrompt, getPredictSingleTagPrompt, getPredictTagsByTypePrompt, getOverallStoryPrompt } from './aiNotesPrompt'
import { getKeylogsForTimeblock, getScreenshotSummariesForTimeblock } from '../shared/keylogUtils'
import { buildTriggerRuleSet, decideTriggerTag } from '../shared/triggerRules'
import { fetchScreenshotEvidenceForDate, getDateString, getEntriesInRange } from '../shared/screenshotEvidence'
import type { TimeblockEvidence } from '../shared/historicalEvidence'
import { marked } from 'marked'
import fs from 'fs'
import path from 'path'

const getRequiredEnv = (key: string) => {
  const value = process.env[key]
  if (!value) throw new Error(`Missing ${key}`)
  return value
}

const getOpenRouterClient = () => {
  const apiKey = getRequiredEnv('OPENROUTER_API_KEY')
  return new OpenAI({ apiKey, baseURL: 'https://openrouter.ai/api/v1' })
}

type TagResult = { type: string, name: string, decision: boolean, reason: string }
type TagRecord = { id: number, name: string, type: string, description: string | null, noAiSuggest: boolean }
const floorTo15 = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), Math.floor(d.getMinutes() / 15) * 15, 0, 0)

// Old approach: one LLM query per individual tag
async function predictTagsIndividually({ client, tags, overallStory }: { client: OpenAI, tags: TagRecord[], overallStory: string }): Promise<TagResult[]> {
  console.log(`[predict-tags] Sending ${tags.length} individual Haiku requests...`)
  const tagPromises = tags.map(async (tag) => {
    const prompt = getPredictSingleTagPrompt({ overallStory, tagType: tag.type, tagName: tag.name, tagDescription: tag.description, allTags: tags.map(t => ({ type: t.type, name: t.name, description: t.description })) })
    try {
      const completion = await client.chat.completions.create({
        model: 'anthropic/claude-haiku-4.5',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
      })
      const responseText = completion.choices[0]?.message?.content || '{}'
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) return { type: tag.type, name: tag.name, decision: false, reason: 'No JSON in response' }
      const result = JSON.parse(jsonMatch[0])
      const reason = [result.whyItMightApply, result.whyItMightNotApply, result.confidence].filter(Boolean).join('\n\n')
      if (result.decision) {
        console.log(`[predict-tags] Tag ${tag.type}/${tag.name}: applies - ${reason}`)
      } else {
        console.log(`[predict-tags] Tag ${tag.type}/${tag.name}: does not apply`)
      }
      return { type: tag.type, name: tag.name, decision: !!result.decision, reason }
    } catch (e) {
      console.error(`[predict-tags] Failed for tag ${tag.type}/${tag.name}:`, e)
      return { type: tag.type, name: tag.name, decision: false, reason: `Error: ${e instanceof Error ? e.message : 'Unknown'}` }
    }
  })
  return Promise.all(tagPromises)
}

// New approach: one LLM query per tag type, returning yes/no for each tag in that type
async function predictTagsByType({ client, tags, tagsByType, overallStory }: { client: OpenAI, tags: TagRecord[], tagsByType: Record<string, { id: number, name: string, description: string | null }[]>, overallStory: string }): Promise<TagResult[]> {
  const tagTypes = Object.keys(tagsByType)
  console.log(`[predict-tags] Sending ${tagTypes.length} per-type Haiku requests (${tags.length} tags total)...`)
  const typePromises = tagTypes.map(async (tagType) => {
    const typeTags = tagsByType[tagType]
    const prompt = getPredictTagsByTypePrompt({ overallStory, tagType, tags: typeTags })
    try {
      const completion = await client.chat.completions.create({
        model: 'anthropic/claude-haiku-4.5',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200 + typeTags.length * 150,
      })
      const responseText = completion.choices[0]?.message?.content || '{}'
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error(`[predict-tags] No JSON in response for type "${tagType}"`)
        return typeTags.map(t => ({ type: tagType, name: t.name, decision: false, reason: 'No JSON in response' }))
      }
      const result: Record<string, { applies: boolean, reason: string }> = JSON.parse(jsonMatch[0])
      return typeTags.map(tag => {
        const tagResult = result[tag.name]
        if (!tagResult) {
          console.log(`[predict-tags] Tag ${tagType}/${tag.name}: missing from response`)
          return { type: tagType, name: tag.name, decision: false, reason: 'Tag missing from LLM response' }
        }
        if (tagResult.applies) {
          console.log(`[predict-tags] Tag ${tagType}/${tag.name}: applies - ${tagResult.reason}`)
        } else {
          console.log(`[predict-tags] Tag ${tagType}/${tag.name}: does not apply`)
        }
        return { type: tagType, name: tag.name, decision: !!tagResult.applies, reason: tagResult.reason || '' }
      })
    } catch (e) {
      console.error(`[predict-tags] Failed for type "${tagType}":`, e)
      return typeTags.map(t => ({ type: tagType, name: t.name, decision: false, reason: `Error: ${e instanceof Error ? e.message : 'Unknown'}` }))
    }
  })
  const resultsByType = await Promise.all(typePromises)
  return resultsByType.flat()
}

async function runDeterministicTriggerPass({ tagsByType, prevBlockDatetime }: { tagsByType: Record<string, { id: number, name: string, description: string | null }[]>, prevBlockDatetime: Date }): Promise<TagResult[]> {
  const deterministicResults: TagResult[] = []
  const triggerTypeTags = tagsByType['Triggers'] || []
  if (triggerTypeTags.length === 0) return deterministicResults
  try {
    // Build the exact previous 15-minute slot we want deterministic evidence for.
    const startSlot = floorTo15(prevBlockDatetime)
    const endSlot = new Date(startSlot.getTime() + 15 * 60 * 1000)
    const dateStr = getDateString(startSlot)
    const screenshotResult = await fetchScreenshotEvidenceForDate(dateStr)
    const entries = 'error' in screenshotResult ? [] : screenshotResult.entries
    const windowEntries = entries.length > 0 ? getEntriesInRange(entries, startSlot, endSlot) : []
    if (windowEntries.length === 0) {
      console.log('[predict-tags] No screenshot entries found for previous 15m window; skipping deterministic triggers')
      return deterministicResults
    }
    // Convert screenshot entries into the TimeblockEvidence shape required by trigger rules.
    const screenshotSummaryText = windowEntries.map(e => `[${e.timestamp}] ${e.summary}`).join('\n')
    const evidenceForRules: TimeblockEvidence = { datetime: startSlot.toISOString(), durationMinutes: 15, screenshotEvidence: windowEntries, screenshotSummaryText }
    const triggerRuleMap = buildTriggerRuleSet({ triggerTags: triggerTypeTags.map(t => ({ id: t.id, name: t.name })) })
    const triggersForLLM: { id: number, name: string, description: string | null }[] = []
    // Keep only high-confidence deterministic outcomes; defer uncertain ones to the LLM pass.
    for (const triggerTag of triggerTypeTags) {
      const decision = decideTriggerTag({ ruleMap: triggerRuleMap, tagId: triggerTag.id, evidence: evidenceForRules })
      if (decision.confidence === 'high') {
        deterministicResults.push({ type: 'Triggers', name: triggerTag.name, decision: decision.applies, reason: `[deterministic][high] ${decision.reason}` })
      } else {
        triggersForLLM.push(triggerTag)
      }
    }
    if (triggersForLLM.length > 0) {
      tagsByType['Triggers'] = triggersForLLM
    } else {
      delete tagsByType['Triggers']
    }
    console.log(`[predict-tags] Deterministic triggers: ${deterministicResults.length} (remaining for LLM: ${triggersForLLM.length})`)
  } catch (e) {
    console.error('[predict-tags] Deterministic trigger pass failed:', e)
  }
  return deterministicResults
}

export async function POST(request: NextRequest) {
  const auth = await requireUserPrisma(request)
  if ('error' in auth) return auth.error
  const { prisma } = auth
  try {
    const body = await request.json()
    const datetime = body?.datetime // The datetime for the timeblock we're predicting tags for
    console.log('[predict-tags] Request received for datetime:', datetime)
    if (!datetime) return NextResponse.json({ error: 'Missing datetime' }, { status: 400 })
    const blockDatetime = new Date(datetime)
    // Apply tags to the previous timeblock (15 minutes before)
    const prevBlockDatetime = new Date(blockDatetime.getTime() - 15 * 60 * 1000)
    console.log('[predict-tags] Will apply tags to previous block:', prevBlockDatetime.toISOString())
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
    const tags = await prisma.tag.findMany({ where: { noAiSuggest: false }, orderBy: [{ type: 'asc' }, { name: 'asc' }] })
    console.log('[predict-tags] Found', tags.length, 'tags')
    if (tags.length === 0) return NextResponse.json({ error: 'No tags defined', predictions: [] }, { status: 200 })
    // Group tags by type
    const tagsByType: Record<string, { id: number, name: string, description: string | null }[]> = {}
    for (const tag of tags) {
      if (!tagsByType[tag.type]) tagsByType[tag.type] = []
      tagsByType[tag.type].push({ id: tag.id, name: tag.name, description: tag.description })
    }
    console.log('[predict-tags] Tag types:', Object.keys(tagsByType).join(', '))
    const deterministicResults = await runDeterministicTriggerPass({ tagsByType, prevBlockDatetime })
    // 3. Get overall story first
    const client = getOpenRouterClient()
    console.log('[predict-tags] Getting overall story...')
    let overallStory = 'Unable to determine overall story'
    try {
      const overallStoryPrompt = getOverallStoryPrompt({ keylogText, screenshotSummariesText })
      const overallStoryCompletion = await client.chat.completions.create({
        model: 'anthropic/claude-haiku-4.5',
        messages: [{ role: 'user', content: overallStoryPrompt }],
        max_tokens: 300,
      })
      const overallStoryResponseText = overallStoryCompletion.choices[0]?.message?.content || '{}'
      const overallStoryJsonMatch = overallStoryResponseText.match(/\{[\s\S]*\}/)
      if (overallStoryJsonMatch) {
        const overallStoryResult = JSON.parse(overallStoryJsonMatch[0])
        overallStory = overallStoryResult.overallStory || overallStory
      }
      console.log('[predict-tags] Overall story:', overallStory)
    } catch (e) {
      console.error('[predict-tags] Failed to get overall story:', e)
      const keylogSnippet = keylogText ? keylogText.slice(0, 500) : ''
      const screenshotSnippet = screenshotSummariesText ? screenshotSummariesText.slice(0, 500) : ''
      overallStory = `[Raw data - story extraction failed]\nKeylogs: ${keylogSnippet}\nScreenshots: ${screenshotSnippet}`
    }
    // 4. Run tag predictions
    const llmResults = await predictTagsByType({ client, tags, tagsByType, overallStory })
    const allResults = [...deterministicResults, ...llmResults]
    // 5. Save all tag decision results as md files
    const tagReasonsDir = path.join(process.cwd(), 'app', 'tag-reasons', 'output', prevBlockDatetime.toISOString().replace(/:/g, '-').replace(/\.\d+Z$/, ''))
    fs.mkdirSync(tagReasonsDir, { recursive: true })
    for (const result of allResults) {
      const sanitizedName = result.name.replace(/\//g, '--')
      const filename = `${result.type}--${sanitizedName}.md`
      const md = `# ${result.type} / ${result.name}\n\n**Decision:** ${result.decision ? 'APPLIES' : 'Does not apply'}\n\n${result.reason}`
      fs.writeFileSync(path.join(tagReasonsDir, filename), md)
    }
    console.log(`[predict-tags] Saved ${allResults.length} tag reason files to ${tagReasonsDir}`)
    const predictions = allResults.filter(r => r.decision)
    console.log('[predict-tags] Predictions:', JSON.stringify(predictions))
    // 6. Create tag instances for each prediction
    console.log('[predict-tags] Processing', predictions.length, 'predictions...')
    const createdInstances = []
    for (const pred of predictions) {
      const tag = tags.find(t => t.type === pred.type && t.name === pred.name)
      if (!tag) {
        console.log('[predict-tags] Tag not found:', pred.type, pred.name)
        continue
      }
      // Check if this tag already exists for the previous timeblock
      const existing = await prisma.tagInstance.findFirst({ where: { tagId: tag.id, datetime: prevBlockDatetime } })
      if (existing) {
        console.log('[predict-tags] Tag instance already exists:', pred.type, pred.name)
        continue
      }
      const tagInstance = await prisma.tagInstance.create({
        data: { tagId: tag.id, datetime: prevBlockDatetime, llmPredicted: true, approved: false, llmReason: pred.reason || null },
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
        const existingTimeblock = await prisma.timeblock.findFirst({ where: { datetime: prevBlockDatetime } })
        if (existingTimeblock) {
          await prisma.timeblock.update({ where: { id: existingTimeblock.id }, data: { aiNotes } })
        } else {
          await prisma.timeblock.create({ data: { datetime: prevBlockDatetime, rayNotes: null, assistantNotes: null, aiNotes } })
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
