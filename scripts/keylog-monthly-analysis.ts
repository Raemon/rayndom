import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import OpenAI from 'openai'

const KEYLOG_API_BASE_URL = process.env.KEYLOG_API_BASE_URL || 'http://localhost:8765'
const DAYS_TO_FETCH = 31
const MIN_KEYLOG_CHARS = 500
const CONCURRENCY = 4
const MODEL = process.env.OPENROUTER_MONTHLY_KEYLOG_MODEL || 'anthropic/claude-sonnet-4.6'
const MAX_PROMPT_APPROX_TOKENS = 9000
const MAX_KEYLOG_CHARS_FOR_PROMPT = 22000
const MAX_SCREENSHOT_SUMMARIES_CHARS_FOR_PROMPT = 6000
const MAX_PER_DAY_SUMMARY_CHARS_FOR_AGGREGATE = 2500

const getRequiredEnv = (key: string) => {
  const value = process.env[key]
  if (!value) throw new Error(`Missing ${key}`)
  return value
}

const getOpenRouterClient = () => {
  const apiKey = getRequiredEnv('OPENROUTER_API_KEY')
  return new OpenAI({ apiKey, baseURL: 'https://openrouter.ai/api/v1' })
}

const pad2 = (n: number) => String(n).padStart(2, '0')

const formatDateYYYYMMDD = (d: Date) => {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

const getPastDateStrings = ({ daysToFetch }:{ daysToFetch: number }) => {
  const now = new Date()
  const dates: string[] = []
  for (let i = daysToFetch - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    dates.push(formatDateYYYYMMDD(d))
  }
  return dates
}

const fetchText = async ({ url }:{ url: string }) => {
  const response = await fetch(url)
  const text = await response.text()
  return { ok: response.ok, status: response.status, text }
}

const listOpenRouterModelIds = async ({ apiKey }:{ apiKey: string }) => {
  const response = await fetch('https://openrouter.ai/api/v1/models', { headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' } })
  if (!response.ok) throw new Error(`Failed to list OpenRouter models: ${response.status}`)
  const data = await response.json() as { data?: { id?: string }[] }
  return (data.data || []).map(m => m.id).filter((id): id is string => !!id)
}

const isUsableKeylogText = ({ keylogText }:{ keylogText: string }) => {
  if (!keylogText) return false
  if (keylogText.length <= MIN_KEYLOG_CHARS) return false
  if (keylogText.startsWith('No keylog')) return false
  if (keylogText.startsWith('Failed to read log')) return false
  return true
}

const approxTokens = ({ text }:{ text: string }) => {
  return Math.ceil(text.length / 4)
}

const truncateKeepingEnds = ({ text, maxChars, label }:{ text: string, maxChars: number, label: string }) => {
  if (text.length <= maxChars) return text
  const headChars = Math.floor(maxChars * 0.6)
  const tailChars = maxChars - headChars
  const omitted = text.length - maxChars
  const head = text.slice(0, headChars)
  const tail = text.slice(text.length - tailChars)
  return `${head}\n\n[...truncated ${omitted} chars from ${label}...]\n\n${tail}`
}

const buildDayPromptWithinLimit = ({ date, keylogText, screenshotSummariesText }:{ date: string, keylogText: string, screenshotSummariesText: string }) => {
  let keylogForPrompt = truncateKeepingEnds({ text: keylogText, maxChars: MAX_KEYLOG_CHARS_FOR_PROMPT, label: 'keylogs' })
  const screenshotsForPrompt = truncateKeepingEnds({ text: screenshotSummariesText, maxChars: MAX_SCREENSHOT_SUMMARIES_CHARS_FOR_PROMPT, label: 'screenshot summaries' })
  let prompt = summarizeDayPrompt({ date, keylogText: keylogForPrompt, screenshotSummariesText: screenshotsForPrompt })
  while (approxTokens({ text: prompt }) > MAX_PROMPT_APPROX_TOKENS && keylogForPrompt.length > 2000) {
    keylogForPrompt = truncateKeepingEnds({ text: keylogForPrompt, maxChars: Math.max(2000, Math.floor(keylogForPrompt.length * 0.8)), label: 'keylogs' })
    prompt = summarizeDayPrompt({ date, keylogText: keylogForPrompt, screenshotSummariesText: screenshotsForPrompt })
  }
  return { prompt, keylogForPromptChars: keylogForPrompt.length, screenshotsForPromptChars: screenshotsForPrompt.length }
}

const summarizeDayPrompt = ({ date, keylogText, screenshotSummariesText }:{ date: string, keylogText: string, screenshotSummariesText: string }) => {
  return `You are analyzing a single day's activity logs.

Date label: ${date}

Keylogs:
${keylogText}

Screenshot summaries (may be empty):
${screenshotSummariesText || '[none]'}

Write a concise Markdown summary with these exact sections and bullet lists:

## Goals
- ... (max 3 bullets; each bullet <= 12 words)

## Stuck_or_confused
- ... (max 3 bullets; each bullet <= 12 words)

## Commitments
- ... (max 3 bullets; each bullet <= 12 words)

## Surprises_or_updates
- ... (max 3 bullets; each bullet <= 12 words)

Rules:
- Prefer concrete claims grounded in the logs over speculation.
- If something is unclear, say "Unclear".
- Keep it compact. No preamble.`
}

const aggregatePrompt = ({ perDaySummaries }:{ perDaySummaries: { date: string, summaryMd: string }[] }) => {
  const summariesText = perDaySummaries.map(s => {
    const trimmed = (s.summaryMd || '').trim()
    const clipped = trimmed.length <= MAX_PER_DAY_SUMMARY_CHARS_FOR_AGGREGATE ? trimmed : truncateKeepingEnds({ text: trimmed, maxChars: MAX_PER_DAY_SUMMARY_CHARS_FOR_AGGREGATE, label: 'per-day summary' })
    return `### ${s.date}\n${clipped}`
  }).join('\n\n')
  return `You will be given per-day summaries of a person's activity logs over the past month.

Per-day summaries:

${summariesText}

Now write a higher-level synthesis as Markdown with these sections:

## a) Persistent_problems

## b) Commitments_made

## c) Surprises_or_updates

## d) Products_that_might_help

## e) Specific_domain_knowledge_gaps
(By "specific facts", I mean concrete facts or techniques, not broad areas.)

## f) Related_goals_to_consider

Rules:
- Be specific and actionable.
- If a category has no evidence, say "No clear evidence".`
}

const mapWithConcurrency = async <T, R>({ items, concurrency, mapper }:{ items: T[], concurrency: number, mapper: (item: T) => Promise<R> }) => {
  const results: R[] = new Array(items.length)
  let nextIndex = 0
  const runWorker = async () => {
    while (true) {
      const currentIndex = nextIndex
      nextIndex++
      if (currentIndex >= items.length) return
      results[currentIndex] = await mapper(items[currentIndex])
    }
  }
  const workerCount = Math.max(1, Math.min(concurrency, items.length))
  const workers: Promise<void>[] = []
  for (let i = 0; i < workerCount; i++) {
    workers.push(runWorker())
  }
  await Promise.all(workers)
  return results
}

const analyzeMonth = async () => {
  const datesToFetch = getPastDateStrings({ daysToFetch: DAYS_TO_FETCH })
  console.log(`[keylog-monthly-analysis] Fetching ${datesToFetch.length} days from ${KEYLOG_API_BASE_URL}`)

  const perDayResults = await mapWithConcurrency({
    items: datesToFetch,
    concurrency: CONCURRENCY,
    mapper: async (date) => {
      const keylogUrl = `${KEYLOG_API_BASE_URL}/${date}`
      const screenshotsUrl = `${KEYLOG_API_BASE_URL}/${date}/screenshots/summaries`
      const keylogResponse = await fetchText({ url: keylogUrl })
      const keylogText = keylogResponse.text || ''
      const usable = isUsableKeylogText({ keylogText })
      if (!usable) {
        return { date, status: 'skipped' as const, keylogText, screenshotSummariesText: '', summaryMd: '' }
      }

      const screenshotResponse = await fetchText({ url: screenshotsUrl })
      const screenshotSummariesText = (screenshotResponse.ok && !screenshotResponse.text.startsWith('No screenshot summaries')) ? screenshotResponse.text : ''

      return { date, status: 'ready' as const, keylogText, screenshotSummariesText, summaryMd: '' }
    }
  })

  const readyDays = perDayResults.filter(r => r.status === 'ready')
  const skippedDays = perDayResults.filter(r => r.status === 'skipped')

  console.log(`[keylog-monthly-analysis] Ready days: ${readyDays.length}, skipped days: ${skippedDays.length}`)
  console.log(`[keylog-monthly-analysis] Using model: ${MODEL}`)

  const apiKey = getRequiredEnv('OPENROUTER_API_KEY')
  const modelIds = await listOpenRouterModelIds({ apiKey })
  if (!modelIds.includes(MODEL)) {
    const candidates = modelIds.filter(id => id.includes('anthropic/claude-sonnet-4'))
    throw new Error(`Model not found on OpenRouter: ${MODEL}\nAvailable similar models:\n${candidates.sort().join('\n')}`)
  }

  const client = getOpenRouterClient()

  const perDaySummaries = await mapWithConcurrency({
    items: readyDays,
    concurrency: CONCURRENCY,
    mapper: async (day) => {
      const { prompt, keylogForPromptChars } = buildDayPromptWithinLimit({ date: day.date, keylogText: day.keylogText, screenshotSummariesText: day.screenshotSummariesText })
      const completion = await client.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 700,
      })
      const content = completion.choices[0]?.message?.content || ''
      const summaryMd = typeof content === 'string' ? content : JSON.stringify(content)
      console.log(`[keylog-monthly-analysis] Summarized ${day.date} (${day.keylogText.length} chars keylog, ${keylogForPromptChars} chars sent${day.screenshotSummariesText ? ', screenshots present' : ''})`)
      return { date: day.date, summaryMd, keylogChars: day.keylogText.length, hasScreenshotSummaries: !!day.screenshotSummariesText }
    }
  })

  console.log(`[keylog-monthly-analysis] Aggregating...`)
  const aggregateCompletion = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: aggregatePrompt({ perDaySummaries }) }],
    max_tokens: 2000,
  })
  const aggregateContent = aggregateCompletion.choices[0]?.message?.content || ''
  const aggregateMd = typeof aggregateContent === 'string' ? aggregateContent : JSON.stringify(aggregateContent)

  const outputParts: string[] = []
  outputParts.push(`# Monthly Keylog Analysis`)
  outputParts.push(``)
  outputParts.push(`Generated: ${new Date().toISOString()}`)
  outputParts.push(`Source: ${KEYLOG_API_BASE_URL}`)
  outputParts.push(`Model: ${MODEL}`)
  outputParts.push(`Days requested: ${DAYS_TO_FETCH}`)
  outputParts.push(`Days analyzed: ${perDaySummaries.length}`)
  outputParts.push(`Days skipped: ${skippedDays.length}`)
  if (skippedDays.length > 0) {
    outputParts.push(``)
    outputParts.push(`Skipped dates:`)
    for (const d of skippedDays) {
      outputParts.push(`- ${d.date}`)
    }
  }
  outputParts.push(``)
  outputParts.push(`## Per-day summaries`)
  outputParts.push(``)
  for (const s of perDaySummaries) {
    outputParts.push(`### ${s.date}`)
    outputParts.push(``)
    outputParts.push(s.summaryMd.trim())
    outputParts.push(``)
  }
  outputParts.push(`## Aggregate synthesis`)
  outputParts.push(``)
  outputParts.push(aggregateMd.trim())
  outputParts.push(``)

  const outputDir = path.resolve(process.cwd(), 'outputs')
  fs.mkdirSync(outputDir, { recursive: true })
  const outputPath = path.join(outputDir, 'monthly-keylog-analysis.md')
  fs.writeFileSync(outputPath, outputParts.join('\n'), 'utf8')
  console.log(`[keylog-monthly-analysis] Wrote ${outputPath}`)
}

analyzeMonth().catch((error) => {
  console.error('[keylog-monthly-analysis] Failed:', error)
  process.exit(1)
})
