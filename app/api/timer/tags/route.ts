import { NextRequest, NextResponse } from 'next/server'
import { requireUserPrisma } from '@/lib/userPrisma'
import { generateAndSaveTagDescription } from './generateTagDescription'

export async function GET(request: NextRequest) {
  const auth = await requireUserPrisma(request)
  if ('error' in auth) return auth.error
  const { prisma } = auth
  try {
    const tags = await prisma.tag.findMany({ include: { parentTag: true }, orderBy: [{ type: 'asc' }, { name: 'asc' }] })
    return NextResponse.json({ tags })
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json({ error: 'Failed to fetch tags', tags: [] }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireUserPrisma(request)
  if ('error' in auth) return auth.error
  const { prisma } = auth
  const body = await request.json()
  const name = body?.name
  const type = body?.type
  const subtype = body?.subtype ?? null
  if (!name || !type) return NextResponse.json({ error: 'Missing name or type' }, { status: 400 })
  const existing = await prisma.tag.findFirst({ where: { name, type } })
  if (existing) return NextResponse.json({ error: 'Tag already exists' }, { status: 409 })
  const tag = await prisma.tag.create({ data: { name, type, subtype }, include: { parentTag: true } })
  // Fire-and-forget: generate description for newly created tag
  generateAndSaveTagDescription({ tagId: tag.id, prisma, doNotRunAgain: true }).catch(e => console.error('[tags] Failed to generate description for new tag:', e))
  return NextResponse.json({ tag })
}

export async function PATCH(request: NextRequest) {
  const auth = await requireUserPrisma(request)
  if ('error' in auth) return auth.error
  const { prisma } = auth
  const body = await request.json()
  const id = body?.id
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const suggestedTagIds = body?.suggestedTagIds
  const updateData: Record<string, unknown> = { name: body?.name ?? undefined, type: body?.type ?? undefined, subtype: body?.subtype !== undefined ? body?.subtype : undefined, description: body?.description !== undefined ? body?.description : undefined, parentTagId: body?.parentTagId !== undefined ? (body?.parentTagId === null ? null : Number(body?.parentTagId)) : undefined }
  if (suggestedTagIds !== undefined) updateData.suggestedTagIds = suggestedTagIds === null ? null : suggestedTagIds
  if (body?.noAiSuggest !== undefined) updateData.noAiSuggest = body.noAiSuggest
  const tag = await prisma.tag.update({ where: { id: Number(id) }, data: updateData, include: { parentTag: true } })
  return NextResponse.json({ tag })
}

export async function DELETE(request: NextRequest) {
  const auth = await requireUserPrisma(request)
  if ('error' in auth) return auth.error
  const { prisma } = auth
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  await prisma.tag.delete({ where: { id: Number(id) } })
  return NextResponse.json({ ok: true })
}
