import 'dotenv/config'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import OpenAI from 'openai'

// ===== CONFIGURATION (modify these to adjust behavior) =====
const CONFIG = {
  model: 'anthropic/claude-opus-4.6',
  outputDir: path.resolve(process.cwd(), 'outputs', 'daily-log'),
  searchLogsScript: path.join(process.env.HOME || '', '.cursor/skills/search-keylogs/scripts/search_logs.py'),
  maxEntries: 5000,
  maxCharsPerHour: 8000,
  maxOutputTokens: 4000,
  includeFrames: false,
}

// ===== OUTPUT SCHEMA =====
// Modify this interface and the SUMMARIZATION_PROMPT below to change the output format.
interface DailyLogOutput {
  hourlyLog: Record<string, string>
  medical: string
  commitments: string
}

// ===== PROMPT (modify to change what the LLM extracts) =====
const SYSTEM_PROMPT = `You analyze daily activity logs and produce a structured JSON summary.
You will receive keylog and screenshot data from a single day, organized by hour.
Output ONLY valid JSON with no other text, no markdown fences.`

const buildUserPrompt = ({date, hourlyLogsText}: {date: string, hourlyLogsText: string}) => {
  return `Analyze the following activity logs from ${date} and produce a JSON object with exactly this structure:

{
  "hourlyLog": {
    "HH:00": "Brief summary of activity during this hour"
  },
  "summary": "A shortlist of the projects I was working on, in very short bullet points",
  "surprisesAndUpdates": "A list of how I was surprised or how I changed my mind",
  "medical": "Markdown-formatted notes about anything medically relevant",
  "commitments": "Markdown-formatted list of commitments"
}

Rules for hourlyLog:
- Only include hours where there was actual activity
- Use 24-hour format keys matching the section headers below: "09:00", "10:00", "14:00", etc.
- Each summary should be 1-2 sentences describing the main activities
- Combine related activities within the same hour
– Do not summarize nsfw/adult content activity (just completely omit it from the summary)

Rules for medical:
- Include food/drink consumption, exercise, health symptoms, medications, sleep info
- Use bullet points in markdown format
- Be specific about quantities and times when available
- If nothing medically relevant found, use "No medical information recorded."

Rules for commitments:
- Include explicit commitments ("I'll do X"), scheduled meetings, deadlines
- Include things said to others that imply a promise or plan
- Use bullet points in markdown format
- If no commitments found, use "No commitments recorded."

Activity logs by hour:
${hourlyLogsText}`
}

// ===== UTILITIES =====
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

const getYesterday = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

const parseLogTimestamp = (ts: string): number | null => {
  // Format: "2026-03-18_03.13.15PM" -> hour in 24h
  const match = ts.match(/_(\d{2})\.(\d{2})\.\d{2}(AM|PM)$/i)
  if (!match) return null
  let hour = parseInt(match[1], 10)
  const ampm = match[3].toUpperCase()
  if (ampm === 'AM' && hour === 12) hour = 0
  else if (ampm === 'PM' && hour !== 12) hour += 12
  return hour
}

type LogEntry = {
  type: string
  timestamp?: string
  start?: string
  [key: string]: unknown
}

const getEntryHour = (entry: LogEntry): number | null => {
  const ts = entry.timestamp || entry.start || ''
  return parseLogTimestamp(ts)
}

const fetchAndGroupByHour = ({date}: {date: string}): Record<number, LogEntry[]> => {
  const framesFlag = CONFIG.includeFrames ? ' --include-frames' : ''
  const cmd = `python3 "${CONFIG.searchLogsScript}" --start "${date}" --end "${date}" --max-entries ${CONFIG.maxEntries}${framesFlag}`
  console.log(`[daily-log] Running: ${cmd}`)
  const output = execSync(cmd, { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 })
  const entries: LogEntry[] = JSON.parse(output)
  console.log(`[daily-log] Fetched ${entries.length} entries`)
  const byHour: Record<number, LogEntry[]> = {}
  for (const entry of entries) {
    const hour = getEntryHour(entry)
    if (hour === null) continue
    if (!byHour[hour]) byHour[hour] = []
    byHour[hour].push(entry)
  }
  return byHour
}

const truncateIfNeeded = ({text, maxChars}: {text: string, maxChars: number}) => {
  if (text.length <= maxChars) return text
  const headChars = Math.floor(maxChars * 0.6)
  const tailChars = maxChars - headChars
  return `${text.slice(0, headChars)}\n[...truncated ${text.length - maxChars} chars...]\n${text.slice(text.length - tailChars)}`
}

const buildHourlyLogsText = ({byHour}: {byHour: Record<number, LogEntry[]>}) => {
  const sortedHours = Object.keys(byHour).map(Number).sort((a, b) => a - b)
  const sections: string[] = []
  for (const hour of sortedHours) {
    const hourLabel = `${pad2(hour)}:00`
    const hourEntries = byHour[hour]
    let hourText = JSON.stringify(hourEntries, null, 1)
    hourText = truncateIfNeeded({text: hourText, maxChars: CONFIG.maxCharsPerHour})
    sections.push(`=== ${hourLabel} (${hourEntries.length} entries) ===\n${hourText}`)
  }
  return sections.join('\n\n')
}

// ===== MAIN =====
const generateDailyLog = async () => {
  const date = process.argv[2] || getYesterday()
  console.log(`[daily-log] Generating log for ${date}`)
  console.log(`[daily-log] Model: ${CONFIG.model}`)
  const byHour = fetchAndGroupByHour({date})
  const activeHours = Object.keys(byHour).length
  if (activeHours === 0) {
    console.log('[daily-log] No logs found for this day, skipping')
    return
  }
  const totalEntries = Object.values(byHour).reduce((sum, entries) => sum + entries.length, 0)
  console.log(`[daily-log] ${activeHours} active hours, ${totalEntries} total entries`)
  const hourlyLogsText = buildHourlyLogsText({byHour})
  const approxTokens = Math.ceil(hourlyLogsText.length / 4)
  console.log(`[daily-log] Prompt data: ${hourlyLogsText.length} chars, ~${approxTokens} tokens`)
  const client = getOpenRouterClient()
  const completion = await client.chat.completions.create({
    model: CONFIG.model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt({date, hourlyLogsText}) },
    ],
    max_tokens: CONFIG.maxOutputTokens,
  })
  const content = completion.choices[0]?.message?.content || '{}'
  const usage = completion.usage as Record<string, unknown> | undefined
  const cost = (usage as any)?.cost as number | undefined
  const promptTokens = usage?.prompt_tokens as number | undefined
  const completionTokens = usage?.completion_tokens as number | undefined
  if (cost !== undefined) {
    console.log(`[daily-log] Cost: $${cost.toFixed(4)} (${promptTokens ?? '?'} prompt, ${completionTokens ?? '?'} completion tokens)`)
  }
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    console.error('[daily-log] No JSON found in LLM response')
    console.error('[daily-log] Raw response:', content)
    process.exit(1)
  }
  let result: DailyLogOutput
  try {
    result = JSON.parse(jsonMatch[0])
  } catch (e) {
    console.error('[daily-log] Failed to parse JSON from LLM response:', e)
    console.error('[daily-log] Extracted text:', jsonMatch[0].slice(0, 500))
    process.exit(1)
  }
  const output = {
    ...result,
    _meta: {
      model: CONFIG.model,
      cost: cost ?? null,
      promptTokens: promptTokens ?? null,
      completionTokens: completionTokens ?? null,
      generatedAt: new Date().toISOString(),
    },
  }
  fs.mkdirSync(CONFIG.outputDir, { recursive: true })
  const outputPath = path.join(CONFIG.outputDir, `${date}.json`)
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2))
  console.log(`[daily-log] Wrote ${outputPath}`)
  const hourCount = Object.keys(result.hourlyLog || {}).length
  console.log(`[daily-log] Summary: ${hourCount} hours logged, medical=${result.medical ? 'yes' : 'no'}, commitments=${result.commitments ? 'yes' : 'no'}`)
}

generateDailyLog().catch((error) => {
  console.error('[daily-log] Failed:', error)
  process.exit(1)
})
