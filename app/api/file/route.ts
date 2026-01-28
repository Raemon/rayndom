import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const escapeCsvValue = (value: string): string => {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

const rowsToCsv = (columns: string[], rows: Record<string, string>[]): string => {
  const header = columns.map(escapeCsvValue).join(',')
  const dataLines = rows.map(row => columns.map(col => escapeCsvValue(row[col] || '')).join(','))
  return [header, ...dataLines].join('\n')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic, domain, file, source, columns, rows } = body
    if (!topic || !domain || !file || !columns || !rows) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }
    const basePath = source === 'outputs' ? 'outputs' : 'downloads'
    const filePath = domain === '__outputs__'
      ? path.join(process.cwd(), basePath, topic, file)
      : path.join(process.cwd(), basePath, topic, domain, file)
    const ext = path.extname(file).toLowerCase()
    if (ext !== '.csv') {
      return NextResponse.json({ error: 'Only CSV files can be updated' }, { status: 400 })
    }
    const csvContent = rowsToCsv(columns, rows)
    fs.writeFileSync(filePath, csvContent, 'utf-8')
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save file' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const topic = searchParams.get('topic')
  const domain = searchParams.get('domain')
  const file = searchParams.get('file')
  const source = searchParams.get('source') || 'downloads'
  if (!topic || !domain || !file) {
    return NextResponse.json({ error: 'Missing topic, domain or file parameter' }, { status: 400 })
  }
  const basePath = source === 'outputs' ? 'outputs' : 'downloads'
  const filePath = domain === '__outputs__' 
    ? path.join(process.cwd(), basePath, topic, file)
    : path.join(process.cwd(), basePath, topic, domain, file)
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
  } else if (ext === '.csv') {
    const content = fs.readFileSync(filePath, 'utf-8')
    return NextResponse.json({ type: 'csv', content })
  }
  return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
}
