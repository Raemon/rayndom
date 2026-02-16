import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { NextRequest, NextResponse } from 'next/server'
import { extractStoryContentHtml } from '@/app/hackernews/extractStoryContent'

const execFileAsync = promisify(execFile)

const fetchWithCurl = async (url: string) => {
  try {
    const { stdout } = await execFileAsync('curl', [
      '-L', '--compressed', '--silent', '--show-error',
      '--max-time', '20', '--connect-timeout', '8',
      '-A', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
      url,
    ], { maxBuffer: 1024 * 1024 * 10 })
    return stdout
  } catch {
    return ''
  }
}

const OBSERVATORY_STYLES = `<style>
  .proxy-content { background: #fffff8 !important; color: #1f1f1f !important; font-family: Georgia, serif !important; line-height: 1.6 !important; max-width: 780px !important; margin: 0 auto !important; padding: 24px 32px !important; }
  .proxy-content h1, .proxy-content h2, .proxy-content h3, .proxy-content h4, .proxy-content h5, .proxy-content h6 { font-family: Georgia, serif !important; color: #111 !important; font-weight: 500 !important; line-height: 1.15 !important; }
  .proxy-content h1 { font-size: 28px !important; margin-bottom: 8px !important; }
  .proxy-content h2 { font-size: 22px !important; margin-top: 28px !important; margin-bottom: 8px !important; }
  .proxy-content h3 { font-size: 18px !important; margin-top: 20px !important; }
  .proxy-content h4 { font-size: 16px !important; margin-top: 16px !important; }
  .proxy-content p { font-size: 16px !important; line-height: 1.7 !important; margin-bottom: 0.8em !important; }
  .proxy-content a { color: #444 !important; }
  .proxy-content a:hover { color: #111 !important; }
  .proxy-content blockquote { margin: 16px 0 24px !important; padding-left: 16px !important; border-left: 3px solid #ccc !important; font-style: italic !important; font-size: 15px !important; color: #333 !important; }
  .proxy-content figure { margin: 1.5em auto !important; text-align: center !important; }
  .proxy-content figcaption { font-size: 13px !important; color: #666 !important; font-style: italic !important; text-align: left !important; }
  .proxy-content pre, .proxy-content code { font-size: 14px !important; background: rgba(0,0,0,0.03) !important; }
  .proxy-content pre { padding: 12px 16px !important; overflow-x: auto !important; }
  .proxy-content code { padding: 2px 4px !important; }
  .proxy-content pre code { padding: 0 !important; background: none !important; }
  .proxy-content ul, .proxy-content ol { margin-bottom: 1em !important; padding-left: 24px !important; }
  .proxy-content li { font-size: 16px !important; line-height: 1.7 !important; margin-bottom: 0.3em !important; }
  .proxy-content img { max-width: 100% !important; height: auto !important; }
  .proxy-content table { font-size: 14px !important; border-collapse: collapse !important; }
  .proxy-content td, .proxy-content th { padding: 4px 8px !important; }
</style>`

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }
  const rawHtml = await fetchWithCurl(url)
  if (!rawHtml.trim()) return NextResponse.json({ error: 'Failed to fetch content' }, { status: 502 })
  const contentHtml = extractStoryContentHtml(rawHtml, url)
  if (!contentHtml) return NextResponse.json({ error: 'Could not extract readable content' }, { status: 502 })
  const fragment = `${OBSERVATORY_STYLES}<div class="proxy-content">${contentHtml}</div>`
  return new NextResponse(fragment, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
