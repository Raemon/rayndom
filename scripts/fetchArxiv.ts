import * as fs from 'fs'
import * as path from 'path'
import { JSDOM } from 'jsdom'
import { truncateForPreview } from '../app/hackernews/extractStoryContent'

type StoryCard = {
  id: number
  title: string
  url: string
  domain: string
  byline: string
  snippet: string
  snippetHtml?: string
}

const ARXIV_API_URL = 'http://export.arxiv.org/api/query'
const CATEGORIES = ['cs.AI', 'cs.LG', 'cs.CL']
const STORIES_TO_FETCH = 100
const OUTPUT_PATH = path.resolve(__dirname, '../app/arxiv/arxivData.json')

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
    })
  }
  return cards
}

const main = async () => {
  console.log(`Fetching top ${STORIES_TO_FETCH} arxiv papers from [${CATEGORIES.join(', ')}]...`)
  const xml = await fetchArxivEntries()
  const cards = parseArxivXml(xml)
  console.log(`Parsed ${cards.length} papers.`)
  const outputDir = path.dirname(OUTPUT_PATH)
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ fetchedAt: new Date().toISOString(), stories: cards }, null, 2))
  console.log(`Wrote ${cards.length} cards to ${OUTPUT_PATH}`)
  console.log('Done!')
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
