import { NextRequest, NextResponse } from 'next/server'
import { requireUserPrisma } from '@/lib/userPrisma'

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
  if (!name || !type) return NextResponse.json({ error: 'Missing name or type' }, { status: 400 })
  const tag = await prisma.tag.upsert({ where: { name_type: { name, type } }, create: { name, type }, update: {}, include: { parentTag: true } })
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
  const updateData: Record<string, unknown> = { name: body?.name ?? undefined, type: body?.type ?? undefined, description: body?.description !== undefined ? body?.description : undefined, parentTagId: body?.parentTagId !== undefined ? (body?.parentTagId === null ? null : Number(body?.parentTagId)) : undefined }
  if (suggestedTagIds !== undefined) updateData.suggestedTagIds = suggestedTagIds === null ? null : suggestedTagIds
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
