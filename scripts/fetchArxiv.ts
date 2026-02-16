import * as fs from 'fs'
import * as path from 'path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { JSDOM } from 'jsdom'
import { truncateForPreview } from '../app/observatory/extractStoryContent'

const execFileAsync = promisify(execFile)

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

const ARXIV_API_URL = 'http://export.arxiv.org/api/query'
const CATEGORIES = ['cs.AI', 'cs.LG', 'cs.CL']
const STORIES_TO_FETCH = 100
const OUTPUT_PATH = path.resolve(__dirname, '../app/observatory/arxivData.json')

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

const checkCanIframe = async (url: string): Promise<boolean> => {
  try {
    const { stdout } = await execFileAsync('curl', [
      '-I', '-L', '--silent', '--show-error', '--max-time', '10', '--connect-timeout', '5',
      '-A', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
      url,
    ], { maxBuffer: 1024 * 1024 })
    if (/x-frame-options:\s*(deny|sameorigin)/i.test(stdout)) return false
    const cspMatch = stdout.match(/content-security-policy:.*?frame-ancestors\s+([^;\r\n]+)/i)
    if (cspMatch) {
      const ancestors = cspMatch[1].trim()
      if (!ancestors.includes('*') && !ancestors.includes('https:')) return false
    }
    return true
  } catch {
    return true
  }
}
const main = async () => {
  console.log(`Fetching top ${STORIES_TO_FETCH} arxiv papers from [${CATEGORIES.join(', ')}]...`)
  const xml = await fetchArxivEntries()
  const cards = parseArxivXml(xml)
  console.log(`Parsed ${cards.length} papers. Checking iframe headers...`)
  const sampleUrl = cards[0]?.url
  const canIframe = sampleUrl ? await checkCanIframe(sampleUrl) : true
  console.log(`arxiv.org iframe-able: ${canIframe}`)
  const finalCards = canIframe ? cards : cards.map(card => ({ ...card, iframe: false as const }))
  const outputDir = path.dirname(OUTPUT_PATH)
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ fetchedAt: new Date().toISOString(), stories: finalCards }, null, 2))
  console.log(`Wrote ${finalCards.length} cards to ${OUTPUT_PATH}`)
  console.log('Done!')
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
