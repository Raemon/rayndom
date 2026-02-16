import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { NextRequest, NextResponse } from 'next/server'

const execFileAsync = promisify(execFile)

const stripScripts = (html: string) => {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<script\b[^>]*\/>/gi, '')
}

const extractTagInner = (html: string, tagName: string) => {
  const match = html.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'))
  return match ? match[1] : ''
}

const extractTagOuter = (html: string, tagName: string) => {
  const match = html.match(new RegExp(`(<${tagName}[^>]*>[\\s\\S]*?<\\/${tagName}>)`, 'i'))
  return match ? match[1] : ''
}

const absoluteArxivUrl = (value: string, paperId: string) => {
  if (!value) return value
  if (value.startsWith('#')) return value
  if (value.startsWith('mailto:')) return value
  if (value.startsWith('data:')) return value
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  if (value.startsWith('//')) return `https:${value}`
  if (value.startsWith('/')) return `https://arxiv.org${value}`
  return `https://arxiv.org/html/${paperId}/${value}`
}

const rewriteSrcHrefUrls = (html: string, paperId: string) => {
  return html.replace(/\b(href|src)=(["'])([^"']*)(\2)/gi, (_match, attr, quote, value) => {
    return `${attr}=${quote}${absoluteArxivUrl(value, paperId)}${quote}`
  })
}

const stripSidebarNavbar = (html: string) => {
  return html.replace(/<(nav|div|aside)\b[^>]*class=(["'])[^"']*\bltx_page_navbar\b[^"']*\2[^>]*>[\s\S]*?<\/\1>/gi, '')
}

const extractPaperId = (url: string): string | null => {
  const match = url.match(/arxiv\.org\/(?:abs|html|pdf)\/([^\s?#]+?)(?:\.pdf)?$/)
  return match ? match[1] : null
}

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

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  const paperId = extractPaperId(url)
  if (!paperId) return NextResponse.json({ error: 'Invalid arxiv URL' }, { status: 400 })
  const arxivHtmlUrl = `https://arxiv.org/html/${paperId}`
  const rawHtml = await fetchWithCurl(arxivHtmlUrl)
  if (!rawHtml.trim()) return NextResponse.json({ error: 'Failed to fetch arxiv HTML content' }, { status: 502 })
  const htmlWithoutScripts = rawHtml
  const headOuter = extractTagOuter(htmlWithoutScripts, 'head')
  const body = extractTagInner(htmlWithoutScripts, 'body')
  const headScriptTags = rewriteSrcHrefUrls(headOuter, paperId).match(/<script\b[^>]*>[\s\S]*?<\/script>|<script\b[^>]*\/>/gi)?.join('') ?? ''
  const bodyNoNavbar = stripSidebarNavbar(body)
  const bodyWithFixedUrls = rewriteSrcHrefUrls(bodyNoNavbar, paperId)
  const styleOverrides = `<style>
    .ar5iv-content { background: #fffff8 !important; color: #1f1f1f !important; font-family: Georgia, serif !important; line-height: 1.6 !important; max-width: 780px !important; margin: 0 auto !important; padding: 24px 32px !important; }
    .ar5iv-content .ltx_page_header, .ar5iv-content .ltx_page_footer, .ar5iv-content .ltx_dates, .ar5iv-content #header, .ar5iv-content .ar5iv-footer, .ar5iv-content nav.ltx_page_navbar, .ar5iv-content .ltx_page_navbar { display: none !important; }
    .ar5iv-content h1, .ar5iv-content h2, .ar5iv-content h3, .ar5iv-content h4, .ar5iv-content h5, .ar5iv-content h6, .ar5iv-content .ltx_title { font-family: Georgia, serif !important; color: #111 !important; font-weight: 500 !important; line-height: 1.15 !important; }
    .ar5iv-content .ltx_title { font-size: 28px !important; margin-bottom: 8px !important; }
    .ar5iv-content .ltx_authors, .ar5iv-content .ltx_author { font-size: 14px !important; color: #565656 !important; font-style: italic !important; }
    .ar5iv-content h2, .ar5iv-content .ltx_title_section { font-size: 22px !important; margin-top: 28px !important; margin-bottom: 8px !important; }
    .ar5iv-content h3, .ar5iv-content .ltx_title_subsection { font-size: 18px !important; margin-top: 20px !important; }
    .ar5iv-content h4, .ar5iv-content .ltx_title_subsubsection { font-size: 16px !important; margin-top: 16px !important; }
    .ar5iv-content p, .ar5iv-content .ltx_para, .ar5iv-content .ltx_p { font-size: 16px !important; line-height: 1.7 !important; margin-bottom: 0.8em !important; }
    .ar5iv-content a { color: #444 !important; }
    .ar5iv-content a:hover { color: #111 !important; }
    .ar5iv-content .ltx_TOC, .ar5iv-content .ltx_toc { font-size: 12px !important; line-height: 1.3 !important; margin: 8px 0 12px !important; }
    .ar5iv-content .ltx_TOC ul, .ar5iv-content .ltx_toc ul { margin: 0 !important; padding-left: 16px !important; }
    .ar5iv-content .ltx_TOC li, .ar5iv-content .ltx_toc li { margin: 0 !important; padding: 0 !important; }
    .ar5iv-content .ltx_abstract { margin: 16px 0 24px !important; padding-left: 16px !important; border-left: 3px solid #ccc !important; font-style: italic !important; font-size: 15px !important; color: #333 !important; }
    .ar5iv-content .ltx_abstract .ltx_title_abstract { font-style: normal !important; font-size: 16px !important; font-weight: 600 !important; color: #111 !important; }
    .ar5iv-content figure, .ar5iv-content .ltx_figure { margin: 1.5em auto !important; text-align: center !important; }
    .ar5iv-content figcaption, .ar5iv-content .ltx_caption { font-size: 13px !important; color: #666 !important; font-style: italic !important; text-align: left !important; }
    .ar5iv-content .ltx_theorem, .ar5iv-content .ltx_proof { margin: 16px 0 !important; padding: 12px 16px !important; background: rgba(0,0,0,0.02) !important; }
    .ar5iv-content .ltx_theorem .ltx_title_theorem { font-weight: 600 !important; font-size: 15px !important; }
    .ar5iv-content table, .ar5iv-content .ltx_tabular { font-size: 14px !important; border-collapse: collapse !important; }
    .ar5iv-content td, .ar5iv-content th { padding: 4px 8px !important; }
    .ar5iv-content .ltx_bibliography { font-size: 14px !important; }
    .ar5iv-content .ltx_bibitem { margin-bottom: 6px !important; }
    .ar5iv-content img { max-width: 100% !important; height: auto !important; }
    .ar5iv-content .ltx_equation { overflow-x: auto !important; }
  </style>`
  const fragment = `${headScriptTags}${styleOverrides}<div class="ar5iv-content">${bodyWithFixedUrls}</div>`
  return new NextResponse(fragment, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
