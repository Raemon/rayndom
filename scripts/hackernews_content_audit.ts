import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { extractStoryContent, truncateForPreview } from '../app/hackernews/extractStoryContent'

const execFileAsync = promisify(execFile)
const HN_BASE_URL = 'https://hacker-news.firebaseio.com/v0'
const STORIES_TO_SAMPLE = 24

type HackerNewsStory = {
  id: number
  title?: string
  url?: string
  score?: number
  descendants?: number
}

type AuditRow = {
  id: number
  title: string
  url: string
  wordCount: number
  category: 'good' | 'short' | 'blocked-or-empty'
  snippet: string
}

const fetchWithCurl = async (url: string) => {
  const runCurl = async (args: string[]) => {
    try {
      const { stdout } = await execFileAsync('curl', args, { maxBuffer: 1024 * 1024 * 4 })
      return stdout
    } catch {
      return ''
    }
  }
  const commonArgs = [
    '--compressed',
    '--silent',
    '--show-error',
    '--max-time',
    '14',
    '--connect-timeout',
    '6',
    '-A',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
    url,
  ]
  const primaryHtml = await runCurl(['-L', ...commonArgs])
  if (primaryHtml.trim()) return primaryHtml
  const http1Html = await runCurl(['--http1.1', '-L', ...commonArgs])
  if (http1Html.trim()) return http1Html
  try {
    const { stdout } = await execFileAsync('curl', [
      '--http1.1',
      '-L',
      '--compressed',
      '--silent',
      '--show-error',
      '--max-time',
      '22',
      '--connect-timeout',
      '8',
      '--retry',
      '1',
      '--retry-delay',
      '1',
      '-A',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
      url,
    ], { maxBuffer: 1024 * 1024 * 4 })
    return stdout
  } catch {
    return ''
  }
}

const fetchTopStoryIds = async () => {
  const response = await fetch(`${HN_BASE_URL}/topstories.json`)
  if (!response.ok) return []
  const ids = (await response.json()) as number[]
  return ids.slice(0, STORIES_TO_SAMPLE)
}

const fetchStory = async (id: number) => {
  const response = await fetch(`${HN_BASE_URL}/item/${id}.json`)
  if (!response.ok) return null
  const item = (await response.json()) as HackerNewsStory | null
  if (!item?.url || !item.title) return null
  if (!item.url.startsWith('http://') && !item.url.startsWith('https://')) return null
  return item
}

const getDomain = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return 'unknown'
  }
}

const buildAuditRow = async (story: HackerNewsStory): Promise<AuditRow | null> => {
  if (!story.url || !story.title) return null
  const html = await fetchWithCurl(story.url)
  const extractedText = html ? extractStoryContent(html, story.url) : ''
  const wordCount = extractedText.split(/\s+/).filter(Boolean).length
  const category = !extractedText ? 'blocked-or-empty' : wordCount < 80 ? 'short' : 'good'
  return {
    id: story.id,
    title: story.title,
    url: story.url,
    wordCount,
    category,
    snippet: extractedText ? truncateForPreview(extractedText, 240) : 'No readable body text found.',
  }
}

const run = async () => {
  const topStoryIds = await fetchTopStoryIds()
  const storyIdQueue = topStoryIds
  const storyPromises = storyIdQueue.map(storyId => fetchStory(storyId))
  const storyResults = await Promise.all(storyPromises)
  const candidateStories = storyResults.filter((story): story is HackerNewsStory => Boolean(story))
  const auditPromises = candidateStories.map(story => buildAuditRow(story))
  const auditResults = await Promise.all(auditPromises)
  const auditRows = auditResults.filter((row): row is AuditRow => Boolean(row))
  const categoryCounts = {
    good: auditRows.filter(row => row.category === 'good').length,
    short: auditRows.filter(row => row.category === 'short').length,
    blockedOrEmpty: auditRows.filter(row => row.category === 'blocked-or-empty').length,
  }
  console.log(`Sampled ${auditRows.length} stories`)
  console.log(`Distribution: good=${categoryCounts.good} short=${categoryCounts.short} blocked-or-empty=${categoryCounts.blockedOrEmpty}`)
  console.log('')
  const sortedAuditRows = [...auditRows].sort((a, b) => {
    if (a.category === b.category) return b.wordCount - a.wordCount
    if (a.category === 'blocked-or-empty') return -1
    if (b.category === 'blocked-or-empty') return 1
    if (a.category === 'short') return -1
    if (b.category === 'short') return 1
    return 0
  })
  const rowsToPrint = sortedAuditRows.slice(0, 18)
  for (const row of rowsToPrint) {
    console.log(`[${row.category}] words=${row.wordCount} domain=${getDomain(row.url)} title=${row.title}`)
    console.log(`url=${row.url}`)
    console.log(`snippet=${row.snippet}`)
    console.log('')
  }
}

run().catch(error => {
  console.error(error)
  process.exit(1)
})
