import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const domain = searchParams.get('domain')
  const file = searchParams.get('file')
  if (!domain || !file) {
    return NextResponse.json({ error: 'Missing domain or file parameter' }, { status: 400 })
  }
  const filePath = path.join(process.cwd(), 'app', 'cat-euthanasia-berkeley', 'downloads', domain, file)
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
  const ext = path.extname(file).toLowerCase()
  if (ext === '.md') {
    const content = fs.readFileSync(filePath, 'utf-8')
    return NextResponse.json({ type: 'markdown', content })
  } else if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext)) {
    const buffer = fs.readFileSync(filePath)
    const mimeTypes: Record<string, string> = {
      '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
      '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml'
    }
    return new NextResponse(buffer, {
      headers: { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' }
    })
  } else if (ext === '.pdf') {
    const buffer = fs.readFileSync(filePath)
    return new NextResponse(buffer, {
      headers: { 'Content-Type': 'application/pdf' }
    })
  }
  return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
}
