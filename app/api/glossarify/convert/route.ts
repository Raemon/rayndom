import { NextRequest, NextResponse } from 'next/server'
import pdf2md from '@opendocsg/pdf2md'

async function bufferFromUrl(url: string): Promise<Buffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch PDF: ${res.status} ${res.statusText}`)
  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('pdf')) throw new Error(`URL did not return a PDF (got ${contentType})`)
  return Buffer.from(await res.arrayBuffer())
}

function postProcessMarkdown(md: string): string {
  // Remove arXiv metadata lines (as headings or standalone)
  md = md.replace(/#{0,3}\s*arXiv:\d+\.\d+v\d+\s*\[.*?\]\s*\d+\s+\w+\s+\d{4}\s*/g, '')
  // Remove page break comments
  md = md.replace(/<!--\s*PAGE_BREAK\s*-->/g, '---')
  // Extract footnotes inlined into body text (∗ or † followed by a sentence)
  const collectedFootnotes: string[] = []
  md = md.replace(/[∗†][A-Z][^.]*\./g, (match) => {
    const trimmed = match.trim()
    if (trimmed.length > 10 && trimmed.length < 300) {
      collectedFootnotes.push(trimmed)
      return ''
    }
    return match
  })
  // Convert superscript footnote refs like ^1 to <sup>
  md = md.replace(/\^(\d+)/g, '<sup>$1</sup>')
  // Clean up excessive blank lines
  md = md.replace(/\n{4,}/g, '\n\n\n')
  // Append collected footnotes at the end
  if (collectedFootnotes.length > 0) {
    md = md.trimEnd() + '\n\n---\n\n'
    const footnoteLines = collectedFootnotes.map(f => `*${f}*`)
    md += footnoteLines.join('\n\n')
    md += '\n'
  }
  return md
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let buffer: Buffer
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('pdf') as File | null
      if (!file) return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 })
      buffer = Buffer.from(await file.arrayBuffer())
    } else {
      const { url } = await request.json()
      if (!url) return NextResponse.json({ error: 'No url provided' }, { status: 400 })
      buffer = await bufferFromUrl(url)
    }
    const raw = await pdf2md(buffer)
    const markdown = postProcessMarkdown(raw)
    return NextResponse.json({ markdown })
  } catch (error: any) {
    console.error('PDF conversion error:', error)
    return NextResponse.json({ error: error.message || 'Failed to convert PDF' }, { status: 500 })
  }
}
