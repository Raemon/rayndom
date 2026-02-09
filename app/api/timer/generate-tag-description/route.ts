import { NextRequest, NextResponse } from 'next/server'
import { requireUserPrisma } from '@/lib/userPrisma'
import { generateAndSaveTagDescription } from '../tags/generateTagDescription'

export async function POST(request: NextRequest) {
  const auth = await requireUserPrisma(request)
  if ('error' in auth) return auth.error
  const { prisma } = auth
  try {
    const body = await request.json()
    const tagId = body?.tagId
    if (!tagId) return NextResponse.json({ error: 'Missing tagId' }, { status: 400 })
    const result = await generateAndSaveTagDescription({ tagId: Number(tagId), prisma })
    return NextResponse.json({ result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[generate-tag-description] Error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
