import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { NextRequest, NextResponse } from 'next/server'

const execFileAsync = promisify(execFile)

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
  const html = await fetchWithCurl(arxivHtmlUrl)
  if (!html.trim()) return NextResponse.json({ error: 'Failed to fetch arxiv HTML content' }, { status: 502 })
  const strippedHtml = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  const baseTag = `<base href="https://arxiv.org/" />`
  const styleOverrides = `<style>
    body { background: #fffff8 !important; color: #1f1f1f !important; font-family: Georgia, serif !important; line-height: 1.6 !important; max-width: 780px !important; margin: 0 auto !important; padding: 24px 32px !important; }
    .ltx_page_header, .ltx_page_footer, .ltx_dates, #header, .ar5iv-footer { display: none !important; }
    nav.ltx_page_navbar { all: unset !important; display: block !important; max-width: 780px !important; margin: 0 auto 12px !important; padding: 0 32px !important; }
    nav.ltx_page_navbar > *:not(.ltx_TOC) { display: none !important; }
    .ltx_page_main { margin-left: 0 !important; padding-left: 0 !important; width: 100% !important; }
    .ltx_TOC { font-size: 11px !important; line-height: 1.3 !important; margin: 0 !important; padding: 4px 0 !important; color: #888 !important; }
    .ltx_toclist { margin: 0 !important; padding-left: 12px !important; list-style: none !important; }
    .ltx_tocentry { margin: 0 !important; padding: 0 !important; }
    .ltx_TOC a { color: #888 !important; text-decoration: none !important; }
    .ltx_TOC a:hover { color: #444 !important; }
    .ltx_TOC .ltx_ref_title { font-size: 11px !important; }
    .ltx_TOC .ltx_tag_ref { font-size: 11px !important; }
    h1, h2, h3, h4, h5, h6, .ltx_title { font-family: Georgia, serif !important; color: #111 !important; font-weight: 500 !important; line-height: 1.15 !important; }
    .ltx_title { font-size: 28px !important; margin-bottom: 8px !important; }
    .ltx_authors, .ltx_author { font-size: 14px !important; color: #565656 !important; font-style: italic !important; }
    h2, .ltx_title_section { font-size: 22px !important; margin-top: 28px !important; margin-bottom: 8px !important; }
    h3, .ltx_title_subsection { font-size: 18px !important; margin-top: 20px !important; }
    h4, .ltx_title_subsubsection { font-size: 16px !important; margin-top: 16px !important; }
    p, .ltx_para, .ltx_p { font-size: 16px !important; line-height: 1.7 !important; margin-bottom: 0.8em !important; }
    a { color: #444 !important; }
    a:hover { color: #111 !important; }
    .ltx_abstract { margin: 16px 0 24px !important; padding-left: 16px !important; border-left: 3px solid #ccc !important; font-style: italic !important; font-size: 15px !important; color: #333 !important; }
    .ltx_abstract .ltx_title_abstract { font-style: normal !important; font-size: 16px !important; font-weight: 600 !important; color: #111 !important; }
    figure, .ltx_figure { margin: 1.5em auto !important; text-align: center !important; }
    figcaption, .ltx_caption { font-size: 13px !important; color: #666 !important; font-style: italic !important; text-align: left !important; }
    .ltx_theorem, .ltx_proof { margin: 16px 0 !important; padding: 12px 16px !important; background: rgba(0,0,0,0.02) !important; }
    .ltx_theorem .ltx_title_theorem { font-weight: 600 !important; font-size: 15px !important; }
    table, .ltx_tabular { font-size: 14px !important; border-collapse: collapse !important; }
    td, th { padding: 4px 8px !important; }
    .ltx_bibliography { font-size: 14px !important; }
    .ltx_bibitem { margin-bottom: 6px !important; }
    img { max-width: 100% !important; height: auto !important; }
    .ltx_equation { overflow-x: auto !important; }
  </style>`
  const injectedHtml = strippedHtml.replace(/<head([^>]*)>/i, `<head$1>${baseTag}${styleOverrides}`)
  return new NextResponse(injectedHtml, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
