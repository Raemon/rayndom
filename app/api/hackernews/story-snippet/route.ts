import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { NextRequest, NextResponse } from 'next/server'
import { extractStoryContent, extractStoryContentHtml, truncateForPreview } from '@/app/hackernews/extractStoryContent'

const execFileAsync = promisify(execFile)
const HN_BASE_URL = 'https://hacker-news.firebaseio.com/v0'
const REVALIDATE_SECONDS = 900
const FALLBACK_SNIPPET = 'No readable body text found for this URL.'

type HackerNewsItem = {
  id: number
  title?: string
  url?: string
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

const fetchStory = async (id: number) => {
  const response = await fetch(`${HN_BASE_URL}/item/${id}.json`, { next: { revalidate: REVALIDATE_SECONDS } })
  if (!response.ok) return null
  const item = await response.json() as HackerNewsItem | null
  if (!item?.url || !item.title) return null
  if (!item.url.startsWith('http://') && !item.url.startsWith('https://')) return null
  return item
}

export async function GET(request: NextRequest) {
  const idParam = request.nextUrl.searchParams.get('id')
  const storyId = Number.parseInt(idParam ?? '', 10)
  if (!Number.isFinite(storyId)) {
    return NextResponse.json({ error: 'Missing or invalid id parameter.' }, { status: 400 })
  }
  try {
    const story = await fetchStory(storyId)
    if (!story?.url) return NextResponse.json({ snippet: FALLBACK_SNIPPET, snippetHtml: '' }, { status: 200 })
    const html = await fetchWithCurl(story.url)
    const extractedText = html ? extractStoryContent(html, story.url) : ''
    const extractedHtml = html ? extractStoryContentHtml(html, story.url) : ''
    const snippet = extractedText ? truncateForPreview(extractedText) : FALLBACK_SNIPPET
    return NextResponse.json({ snippet, snippetHtml: extractedHtml }, { status: 200 })
  } catch {
    return NextResponse.json({ snippet: FALLBACK_SNIPPET, snippetHtml: '' }, { status: 200 })
  }
}
