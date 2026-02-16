import * as fs from 'fs'
import * as path from 'path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { extractStoryContent, extractStoryContentHtml, truncateForPreview } from '../app/hackernews/extractStoryContent'

const execFileAsync = promisify(execFile)

type HackerNewsItem = {
  id: number
  title?: string
  url?: string
  by?: string
  score?: number
  descendants?: number
}

type StoryCard = {
  id: number
  title: string
  url: string
  domain: string
  byline: string
  snippet: string
  snippetHtml?: string
}

const NITTER_INSTANCES = ['https://xcancel.com', 'https://nitter.privacydev.net', 'https://nitter.poast.org']
const HN_BASE_URL = 'https://hacker-news.firebaseio.com/v0'
const STORIES_TO_FETCH = 100
const FALLBACK_SNIPPET = 'No readable body text found for this URL.'
const SNIPPET_CONCURRENCY = 5
const OUTPUT_PATH = path.resolve(__dirname, '../app/hackernews/hackerNewsData.json')

const getStoryUrlDomain = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return 'unknown'
  }
}

const fetchTopStoryIds = async (): Promise<number[]> => {
  const response = await fetch(`${HN_BASE_URL}/topstories.json`)
  if (!response.ok) throw new Error(`Failed to fetch top stories: ${response.status}`)
  const ids = (await response.json()) as number[]
  return ids.slice(0, STORIES_TO_FETCH)
}

const fetchStory = async (id: number): Promise<HackerNewsItem | null> => {
  const response = await fetch(`${HN_BASE_URL}/item/${id}.json`)
  if (!response.ok) return null
  const item = (await response.json()) as HackerNewsItem | null
  if (!item?.url || !item.title) return null
  if (!item.url.startsWith('http://') && !item.url.startsWith('https://')) return null
  return item
}

const isTwitterUrl = (url: string) => {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '')
    return hostname === 'twitter.com' || hostname === 'x.com'
  } catch { return false }
}
const toNitterUrl = (url: string, instance: string) => {
  const parsed = new URL(url)
  return `${instance}${parsed.pathname}${parsed.search}${parsed.hash}`
}
const isBlockedPage = (html: string) => {
  const blockedSignals = ['Verifying your browser', 'Just a moment', 'cf-browser-verification', 'antibot', 'pass the test', 'enable JavaScript']
  return blockedSignals.some(s => html.includes(s))
}
const fetchHtmlWithCurl = async (url: string): Promise<string> => {
  const commonArgs = ['--compressed', '--silent', '--show-error', '--max-time', '14', '--connect-timeout', '6',
    '-A', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
    url]
  const tryArgs = [['-L', ...commonArgs], ['--http1.1', '-L', ...commonArgs]]
  for (const args of tryArgs) {
    try {
      const { stdout } = await execFileAsync('curl', args, { maxBuffer: 1024 * 1024 * 4 })
      if (stdout.trim()) return stdout
    } catch { /* continue */ }
  }
  return ''
}

const fetchTwitterSnippet = async (card: StoryCard): Promise<string> => {
  for (const instance of NITTER_INSTANCES) {
    try {
      const nitterUrl = toNitterUrl(card.url, instance)
      const html = await fetchHtmlWithCurl(nitterUrl)
      if (html && !isBlockedPage(html)) return html
      console.log(`  Nitter instance ${instance} blocked/empty, trying next...`)
    } catch { /* try next */ }
  }
  console.log(`  All Nitter instances failed for ${card.url}, falling back to original`)
  return await fetchHtmlWithCurl(card.url)
}
const fetchSnippetForCard = async (card: StoryCard): Promise<StoryCard> => {
  try {
    const html = isTwitterUrl(card.url) ? await fetchTwitterSnippet(card) : await fetchHtmlWithCurl(card.url)
    if (!html) return { ...card, snippet: FALLBACK_SNIPPET, snippetHtml: '' }
    const extractedText = extractStoryContent(html, card.url)
    const extractedHtml = extractStoryContentHtml(html, card.url)
    const snippet = extractedText ? truncateForPreview(extractedText) : FALLBACK_SNIPPET
    return { ...card, snippet, snippetHtml: extractedHtml || undefined }
  } catch {
    return { ...card, snippet: FALLBACK_SNIPPET, snippetHtml: '' }
  }
}

const buildStoryCard = (item: HackerNewsItem): StoryCard | null => {
  if (!item.url || !item.title) return null
  const commentsCount = item.descendants ?? 0
  const score = item.score ?? 0
  return {
    id: item.id,
    title: item.title,
    url: item.url,
    domain: getStoryUrlDomain(item.url),
    byline: `${score} points, ${commentsCount} comments`,
    snippet: 'Loading article text...',
  }
}

const main = async () => {
  console.log(`Fetching top ${STORIES_TO_FETCH} HN story IDs...`)
  const topStoryIds = await fetchTopStoryIds()
  console.log(`Got ${topStoryIds.length} IDs. Fetching story details...`)
  const BATCH_SIZE = 20
  const storyBatches: (HackerNewsItem | null)[][] = []
  for (let i = 0; i < topStoryIds.length; i += BATCH_SIZE) {
    const batchIds = topStoryIds.slice(i, i + BATCH_SIZE)
    const batch = await Promise.all(batchIds.map(fetchStory))
    storyBatches.push(batch)
    console.log(`  Fetched ${Math.min(i + BATCH_SIZE, topStoryIds.length)}/${topStoryIds.length}`)
  }
  const storyItems = storyBatches.flat()
  const validStoryItems = storyItems.filter((item): item is HackerNewsItem => Boolean(item))
  const cards = validStoryItems.map(buildStoryCard).filter((card): card is StoryCard => Boolean(card))
  console.log(`Built ${cards.length} story cards. Fetching snippets (${SNIPPET_CONCURRENCY} at a time)...`)
  const hydratedCards: StoryCard[] = []
  for (let i = 0; i < cards.length; i += SNIPPET_CONCURRENCY) {
    const snippetBatch = cards.slice(i, i + SNIPPET_CONCURRENCY)
    const results = await Promise.all(snippetBatch.map(fetchSnippetForCard))
    hydratedCards.push(...results)
    console.log(`  Snippets: ${Math.min(i + SNIPPET_CONCURRENCY, cards.length)}/${cards.length}`)
  }
  console.log(`Writing ${hydratedCards.length} cards to ${OUTPUT_PATH}...`)
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ fetchedAt: new Date().toISOString(), stories: hydratedCards }, null, 2))
  console.log('Done!')
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
