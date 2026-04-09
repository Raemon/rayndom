import { NextRequest, NextResponse } from 'next/server'
import { requireUserPrisma } from '@/lib/userPrisma'
import { glossary } from '@/app/transformers-evolution/glossary'

const sortedTerms = Object.keys(glossary).sort((a, b) => b.length - a.length)
const escaped = sortedTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
const jargonRegex = escaped.length > 0
  ? new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi')
  : null

function glossarifyText(text: string): string {
  if (!jargonRegex) return text
  return text.replace(jargonRegex, (match) => {
    const lower = match.toLowerCase()
    const term = sortedTerms.find(t => t.toLowerCase() === lower)
    if (!term) return match
    const def = glossary[term as keyof typeof glossary]
    return `**${match}** (*${def}*)`
  })
}

export async function POST(request: NextRequest) {
  const auth = await requireUserPrisma(request)
  if ('error' in auth) return auth.error
  const { prisma } = auth

  const { title, content } = await request.json()
  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
  }

  const glossarified = glossarifyText(content.trim())

  const post = await prisma.post.create({
    data: {
      title: title.trim(),
      content: glossarified,
    },
  })

  return NextResponse.json(post)
}

export async function GET(request: NextRequest) {
  const auth = await requireUserPrisma(request)
  if ('error' in auth) return auth.error
  const { prisma } = auth

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, createdAt: true },
  })

  return NextResponse.json(posts)
}
