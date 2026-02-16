import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const PROMPT_PATH = path.join(process.cwd(), 'scripts', 'interestFilterPrompt.md')

export async function GET() {
  try {
    if (!fs.existsSync(PROMPT_PATH)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
    const content = fs.readFileSync(PROMPT_PATH, 'utf-8')
    return NextResponse.json({ content })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read file' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json()
    if (typeof content !== 'string') {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 })
    }
    fs.writeFileSync(PROMPT_PATH, content, 'utf-8')
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save file' }, { status: 500 })
  }
}
