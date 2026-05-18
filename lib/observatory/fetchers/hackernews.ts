import { extractStoryContent, extractStoryContentHtml, truncateForPreview } from '@/app/observatory/extractStoryContent'
import { prisma } from '@/lib/prisma'
import { fetchHtml, checkCanIframe } from './util'

type HackerNewsItem = {
  id: number
  title?: string
  url?: string
  by?: string
  score?: number
  descendants?: number
  time?: number
}

type StoryCard = {
  id: number
  title: string
  url: string
  domain: string
  byline: string
  snippet: string
  snippetHtml?: string
  iframe?: boolean
}

const NITTER_INSTANCES = ['https://xcancel.com', 'https://nitter.privacydev.net', 'https://nitter.poast.org']
const HN_BASE_URL = 'https://hacker-news.firebaseio.com/v0'
const STORIES_TO_FETCH = 100
const FALLBACK_SNIPPET = 'No readable body text found for this URL.'
const SNIPPET_CONCURRENCY = 5
const SOURCE = 'hackernews'

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

const fetchTwitterSnippet = async (card: StoryCard): Promise<string> => {
  for (const instance of NITTER_INSTANCES) {
    try {
      const nitterUrl = toNitterUrl(card.url, instance)
      const html = await fetchHtml(nitterUrl)
      if (html && !isBlockedPage(html)) return html
      console.log(`  Nitter instance ${instance} blocked/empty, trying next...`)
    } catch { /* try next */ }
  }
  console.log(`  All Nitter instances failed for ${card.url}, falling back to original`)
  return await fetchHtml(card.url)
}

const fetchSnippetForCard = async (card: StoryCard): Promise<StoryCard> => {
  try {
    const [html, canIframe] = await Promise.all([
      isTwitterUrl(card.url) ? fetchTwitterSnippet(card) : fetchHtml(card.url),
      checkCanIframe(card.url),
    ])
    if (!html) return { ...card, snippet: FALLBACK_SNIPPET, snippetHtml: '', ...(!canIframe && { iframe: false }) }
    const extractedText = extractStoryContent(html, card.url)
    const extractedHtml = extractStoryContentHtml(html, card.url)
    const snippet = extractedText ? truncateForPreview(extractedText) : FALLBACK_SNIPPET
    return { ...card, snippet, snippetHtml: extractedHtml || undefined, ...(!canIframe && { iframe: false }) }
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
    snippet: '',
  }
}

export const fetchHackerNews = async () => {
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
  const cardsWithMeta = validStoryItems.map(item => {
    const card = buildStoryCard(item)
    if (!card) return null
    return { card, postedAt: item.time ? new Date(item.time * 1000) : null }
  }).filter((entry): entry is { card: StoryCard, postedAt: Date | null } => Boolean(entry))
  const cards = cardsWithMeta.map(e => e.card)
  console.log(`Built ${cards.length} story cards. Fetching snippets (${SNIPPET_CONCURRENCY} at a time)...`)
  const hydratedCards: StoryCard[] = []
  for (let i = 0; i < cards.length; i += SNIPPET_CONCURRENCY) {
    const snippetBatch = cards.slice(i, i + SNIPPET_CONCURRENCY)
    const results = await Promise.all(snippetBatch.map(fetchSnippetForCard))
    hydratedCards.push(...results)
    console.log(`  Snippets: ${Math.min(i + SNIPPET_CONCURRENCY, cards.length)}/${cards.length}`)
  }
  console.log(`Upserting ${hydratedCards.length} stories into database...`)
  const fetchedAt = new Date()
  const DB_BATCH = 10
  for (let i = 0; i < hydratedCards.length; i += DB_BATCH) {
    const batch = hydratedCards.slice(i, i + DB_BATCH)
    await Promise.all(batch.map((card, j) => {
      const rank = i + j
      const postedAt = cardsWithMeta[i + j].postedAt
      return prisma.story.upsert({
        where: { source_url: { source: SOURCE, url: card.url } },
        update: { externalId: card.id, title: card.title, domain: card.domain, byline: card.byline, snippet: card.snippet, snippetHtml: card.snippetHtml ?? null, iframe: card.iframe ?? null, rank, postedAt, fetchedAt },
        create: { source: SOURCE, externalId: card.id, title: card.title, url: card.url, domain: card.domain, byline: card.byline, snippet: card.snippet, snippetHtml: card.snippetHtml ?? null, iframe: card.iframe ?? null, rank, postedAt, fetchedAt },
      })
    }))
    console.log(`  DB: ${Math.min(i + DB_BATCH, hydratedCards.length)}/${hydratedCards.length}`)
  }
  const currentUrls = hydratedCards.map(c => c.url)
  await prisma.story.deleteMany({ where: { source: SOURCE, url: { notIn: currentUrls } } })
  console.log('Done!')
}
