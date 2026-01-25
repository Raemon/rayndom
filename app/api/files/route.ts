import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const topic = searchParams.get('topic')
  const domain = searchParams.get('domain')
  if (!topic || !domain) {
    return NextResponse.json({ error: 'Missing topic or domain parameter' }, { status: 400 })
  }
  const domainPath = path.join(process.cwd(), 'downloads', topic, domain)
  if (!fs.existsSync(domainPath)) {
    return NextResponse.json({ error: 'Domain not found' }, { status: 404 })
  }
  const files = fs.readdirSync(domainPath, { recursive: true })
    .filter((f): f is string => typeof f === 'string' && !f.startsWith('.'))
  return NextResponse.json({ files })
}
