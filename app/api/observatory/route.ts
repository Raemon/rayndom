import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import { parseKeylogText, parseScreenshotSummaries } from '../timer/shared/keylogUtils'
import { getGoalsPrompt } from './prompts'

const OBSERVATORY_DIR = path.join(process.cwd(), 'data', 'observatory')
const GOALS_FILE = path.join(OBSERVATORY_DIR, 'goals.md')
const GOALS_SUBDIR = path.join(OBSERVATORY_DIR, 'goals')

const ensureDirs = () => {
  if (!fs.existsSync(OBSERVATORY_DIR)) fs.mkdirSync(OBSERVATORY_DIR, { recursive: true })
  if (!fs.existsSync(GOALS_SUBDIR)) fs.mkdirSync(GOALS_SUBDIR, { recursive: true })
}

const readGoalsDocument = (): string | null => {
  if (fs.existsSync(GOALS_FILE)) return fs.readFileSync(GOALS_FILE, 'utf-8')
  return null
}

const readSubdocuments = (): { name: string, content: string }[] => {
  if (!fs.existsSync(GOALS_SUBDIR)) return []
  const files = fs.readdirSync(GOALS_SUBDIR).filter(f => f.endsWith('.md'))
  return files.map(f => ({
    name: f.replace('.md', ''),
    content: fs.readFileSync(path.join(GOALS_SUBDIR, f), 'utf-8'),
  }))
}

const getRequiredEnv = (key: string) => {
  const value = process.env[key]
  if (!value) throw new Error(`Missing ${key}`)
  return value
}

const getOpenRouterClient = () => {
  const apiKey = getRequiredEnv('OPENROUTER_API_KEY')
  return new OpenAI({ apiKey, baseURL: 'https://openrouter.ai/api/v1' })
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const subdoc = searchParams.get('subdoc')
    if (subdoc) {
      const filePath = path.join(GOALS_SUBDIR, `${subdoc}.md`)
      if (!fs.existsSync(filePath)) return NextResponse.json({ error: 'Subdocument not found' }, { status: 404 })
      const content = fs.readFileSync(filePath, 'utf-8')
      return NextResponse.json({ content, name: subdoc })
    }
    const document = readGoalsDocument()
    const subdocuments = readSubdocuments().map(d => d.name)
    return NextResponse.json({ document, subdocuments })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST() {
  try {
    ensureDirs()
    const [todayRes, screenshotsRes] = await Promise.all([
      fetch('http://localhost:8765/today').catch(() => null),
      fetch('http://localhost:8765/today/screenshots/summaries').catch(() => null),
    ])
    let keylogText = ''
    if (todayRes?.ok) {
      const raw = await todayRes.text()
      const keylogs = parseKeylogText(raw)
      keylogText = keylogs.map(k => `[${k.timestamp}]${k.app ? ` (${k.app})` : ''} ${k.text}`).join('\n')
    }
    let screenshotText = ''
    if (screenshotsRes?.ok) {
      const raw = await screenshotsRes.text()
      const summaries = parseScreenshotSummaries(raw)
      screenshotText = summaries.map(s => `[${s.timestamp}] ${s.summary}`).join('\n')
    }
    if (!keylogText && !screenshotText) {
      return NextResponse.json({ error: 'No data available from localhost:8765' }, { status: 200 })
    }
    const existingDocument = readGoalsDocument()
    const existingSubdocuments = readSubdocuments()
    const client = getOpenRouterClient()
    const completion = await client.chat.completions.create({
      model: 'anthropic/claude-opus-4.5',
      messages: [{ role: 'user', content: getGoalsPrompt({ keylogText, screenshotText, existingDocument, existingSubdocuments }) }],
      max_tokens: 4000,
    })
    const response = completion.choices[0]?.message?.content || ''
    fs.writeFileSync(GOALS_FILE, response, 'utf-8')
    return NextResponse.json({ document: response, updated: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
