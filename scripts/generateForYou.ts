import 'dotenv/config'
import * as fs from 'fs'
import * as path from 'path'
import OpenAI from 'openai'
import { prisma } from '../lib/prisma'

const PROMPT_PATH = path.resolve(__dirname, 'interestFilterPrompt.md')
const MODEL = 'anthropic/claude-sonnet-4'
const MIN_RELEVANCE = 2

const SOURCE_TO_PROMPT: Record<string, string> = { hackernews: 'hackernews', lw: 'lesswrong', arxiv: 'arxiv' }
const PROMPT_TO_SOURCE: Record<string, string> = { hackernews: 'hackernews', lesswrong: 'lw', arxiv: 'arxiv' }

const getOpenRouterClient = () => {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('Missing OPENROUTER_API_KEY')
  return new OpenAI({ apiKey, baseURL: 'https://openrouter.ai/api/v1' })
}

type ScoredItem = { url: string, source: string, relevance: number, explanation: string }

const main = async () => {
  const prompt = fs.readFileSync(PROMPT_PATH, 'utf-8')

  const stories = await prisma.story.findMany({
    where: { source: { in: ['hackernews', 'lw', 'arxiv'] } },
    orderBy: { rank: 'asc' },
    select: { url: true, title: true, source: true, snippet: true },
  })
  console.log(`Loaded ${stories.length} stories from database`)

  const storiesJson = stories.map(s => ({
    url: s.url,
    title: s.title,
    source: SOURCE_TO_PROMPT[s.source] ?? s.source,
    snippet: s.snippet.slice(0, 200),
  }))

  const client = getOpenRouterClient()
  console.log(`Sending ${stories.length} stories to ${MODEL}...`)
  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: 'You MUST respond with ONLY a single JSON array. No markdown, no commentary, no code fences. Just a raw JSON array of objects with keys: url, source, relevance, explanation.',
      },
      { role: 'user', content: `${prompt}\n\n---\n\nStories:\n\n${JSON.stringify(storiesJson, null, 2)}` },
    ],
    max_tokens: 16000,
  })

  const responseText = completion.choices[0]?.message?.content ?? ''
  console.log(`Got response (${responseText.length} chars)`)

  const scored: ScoredItem[] = []
  const jsonBlocks = responseText.match(/\[[\s\S]*?\]/g)
  if (!jsonBlocks) {
    console.error('Could not find JSON array in response. Raw response:')
    console.error(responseText)
    process.exit(1)
  }
  for (const block of jsonBlocks) {
    try {
      const items = JSON.parse(block) as ScoredItem[]
      scored.push(...items)
    } catch {
      console.log(`  Skipping unparseable block (${block.length} chars)`)
    }
  }
  const relevant = scored
    .filter(item => item.relevance >= MIN_RELEVANCE)
    .sort((a, b) => b.relevance - a.relevance)
  console.log(`${relevant.length}/${scored.length} items scored >= ${MIN_RELEVANCE}`)

  const allStories = await prisma.story.findMany({ select: { id: true, source: true, url: true } })
  const storyBySourceUrl = new Map(allStories.map(s => [`${s.source}:${s.url}`, s.id]))

  const rows: { storyId: number, reason: string, relevance: number, sortOrder: number }[] = []
  for (let i = 0; i < relevant.length; i++) {
    const item = relevant[i]
    const source = PROMPT_TO_SOURCE[item.source] ?? item.source
    const storyId = storyBySourceUrl.get(`${source}:${item.url}`)
    if (!storyId) { console.log(`  Story not found: [${source}] ${item.url}`); continue }
    rows.push({ storyId, reason: item.explanation, relevance: item.relevance, sortOrder: i })
  }

  await prisma.forYouItem.deleteMany()
  await prisma.forYouItem.createMany({ data: rows })
  console.log(`Saved ${rows.length} ForYou items`)
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
}).finally(() => prisma.$disconnect())
