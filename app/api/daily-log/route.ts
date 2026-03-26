import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DAILY_LOG_DIR = path.join(process.cwd(), 'outputs', 'daily-log')

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get('date')
  if (!fs.existsSync(DAILY_LOG_DIR)) {
    return NextResponse.json({ error: 'No daily logs found' }, { status: 404 })
  }
  if (date) {
    const filePath = path.join(DAILY_LOG_DIR, `${date}.json`)
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: `No log for ${date}` }, { status: 404 })
    }
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    return NextResponse.json(content)
  }
  const files = fs.readdirSync(DAILY_LOG_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''))
    .sort()
    .reverse()
  return NextResponse.json({ dates: files })
}
