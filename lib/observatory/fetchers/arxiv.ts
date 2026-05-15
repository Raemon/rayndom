import { JSDOM } from 'jsdom'
import { truncateForPreview } from '@/app/observatory/extractStoryContent'
import { prisma } from '@/lib/prisma'
import { checkCanIframe } from './util'

type StoryCard = {
  id: number
  title: string
  url: string
  domain: string
  byline: string
  snippet: string
  snippetHtml?: string
  iframe?: boolean
  postedAt?: Date
}

const ARXIV_API_URL = 'http://export.arxiv.org/api/query'
const CATEGORIES = ['cs.AI', 'cs.LG', 'cs.CL']
const STORIES_TO_FETCH = 100
const SOURCE = 'arxiv'

const buildSearchQuery = () => {
  const categoryQueries = CATEGORIES.map(cat => `cat:${cat}`)
  return categoryQueries.join('+OR+')
}

const normalizeWhitespace = (text: string) => {
  return text.replace(/\s+/g, ' ').trim()
}

const fetchArxivEntries = async (): Promise<string> => {
  const query = buildSearchQuery()
  const url = `${ARXIV_API_URL}?search_query=${query}&start=0&max_results=${STORIES_TO_FETCH}&sortBy=submittedDate&sortOrder=descending`
  console.log(`Fetching from: ${url}`)
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch arxiv: ${response.status}`)
  return await response.text()
}

const parseArxivXml = (xml: string): StoryCard[] => {
  const dom = new JSDOM(xml, { contentType: 'text/xml' })
  const doc = dom.window.document
  const entries = doc.querySelectorAll('entry')
  const cards: StoryCard[] = []
  let index = 0
  for (const entry of entries) {
    const title = normalizeWhitespace(entry.querySelector('title')?.textContent ?? '')
    const abstractText = normalizeWhitespace(entry.querySelector('summary')?.textContent ?? '')
    const absLink = entry.querySelector('id')?.textContent?.trim() ?? ''
    const authorElements = entry.querySelectorAll('author name')
    const authorNames = Array.from(authorElements).map(el => el.textContent?.trim() ?? '')
    const published = entry.querySelector('published')?.textContent?.trim() ?? ''
    const date = published ? published.slice(0, 10) : ''
    const authorDisplay = authorNames.length <= 3
      ? authorNames.join(', ')
      : `${authorNames.slice(0, 3).join(', ')} et al.`
    if (!title || !absLink) continue
    index++
    cards.push({
      id: index,
      title,
      url: absLink,
      domain: 'arxiv.org',
      byline: `${authorDisplay} · ${date}`,
      snippet: truncateForPreview(abstractText),
      snippetHtml: `<p>${abstractText}</p>`,
      postedAt: published ? new Date(published) : undefined,
    })
  }
  return cards
}

export const fetchArxiv = async () => {
  console.log(`Fetching top ${STORIES_TO_FETCH} arxiv papers from [${CATEGORIES.join(', ')}]...`)
  const xml = await fetchArxivEntries()
  const cards = parseArxivXml(xml)
  console.log(`Parsed ${cards.length} papers. Checking iframe headers...`)
  const sampleUrl = cards[0]?.url
  const canIframe = sampleUrl ? await checkCanIframe(sampleUrl) : true
  console.log(`arxiv.org iframe-able: ${canIframe}`)
  const finalCards = canIframe ? cards : cards.map(card => ({ ...card, iframe: false as const }))
  console.log(`Upserting ${finalCards.length} stories into database...`)
  const fetchedAt = new Date()
  const DB_BATCH = 10
  for (let i = 0; i < finalCards.length; i += DB_BATCH) {
    const batch = finalCards.slice(i, i + DB_BATCH)
    await Promise.all(batch.map((card, j) => {
      const rank = i + j
      return prisma.story.upsert({
        where: { source_url: { source: SOURCE, url: card.url } },
        update: { externalId: card.id, title: card.title, domain: card.domain, byline: card.byline, snippet: card.snippet, snippetHtml: card.snippetHtml ?? null, iframe: card.iframe ?? null, rank, postedAt: card.postedAt ?? null, fetchedAt },
        create: { source: SOURCE, externalId: card.id, title: card.title, url: card.url, domain: card.domain, byline: card.byline, snippet: card.snippet, snippetHtml: card.snippetHtml ?? null, iframe: card.iframe ?? null, rank, postedAt: card.postedAt ?? null, fetchedAt },
      })
    }))
    console.log(`  DB: ${Math.min(i + DB_BATCH, finalCards.length)}/${finalCards.length}`)
  }
  const currentUrls = finalCards.map(c => c.url)
  await prisma.story.deleteMany({ where: { source: SOURCE, url: { notIn: currentUrls } } })
  console.log('Done!')
}
