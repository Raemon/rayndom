import { NextRequest, NextResponse } from 'next/server'
import { requireUserPrisma } from '@/lib/userPrisma'

export async function GET(request: NextRequest) {
  const auth = await requireUserPrisma(request)
  if ('error' in auth) return auth.error
  const { prisma } = auth
  const orientingOnly = request.nextUrl.searchParams.get('orientingOnly') === 'true'
  const section = request.nextUrl.searchParams.get('section')
  const where: { orientingBlock: boolean; OR?: Array<{ section: string | null }> } = { orientingBlock: orientingOnly }
  if (section) {
    where.OR = [{ section }, { section: null }]
  }
  const items = await prisma.checklistItem.findMany({ where, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] })
  return NextResponse.json(items)
}

export async function POST(request: NextRequest) {
  const auth = await requireUserPrisma(request)
  if ('error' in auth) return auth.error
  const { prisma } = auth
  const { title, orientingBlock, section } = await request.json()
  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }
  const orientingBlockValue = orientingBlock ?? false
  const where: { orientingBlock: boolean; section?: string } = { orientingBlock: orientingBlockValue }
  if (section) {
    where.section = section
  }
  const maxOrder = await prisma.checklistItem.aggregate({ _max: { sortOrder: true }, where })
  const nextOrder = (maxOrder._max?.sortOrder ?? -1) + 1
  const data: { title: string; sortOrder: number; orientingBlock: boolean; section?: string | null } = {
    title: title.trim(),
    sortOrder: nextOrder,
    orientingBlock: orientingBlockValue,
  }
  if (section !== undefined) {
    data.section = section ?? null
  }
  const item = await prisma.checklistItem.create({ data })
  return NextResponse.json(item)
}

export async function PATCH(request: NextRequest) {
  const auth = await requireUserPrisma(request)
  if ('error' in auth) return auth.error
  const { prisma } = auth
  const { id, completed, orderedIds, section } = await request.json()
  if (orderedIds && Array.isArray(orderedIds)) {
    for (const [index, itemId] of orderedIds.entries()) {
      await prisma.checklistItem.update({ where: { id: itemId }, data: { sortOrder: index } })
    }
    return NextResponse.json({ success: true })
  }
  if (typeof id !== 'number') {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }
  if (typeof section === 'string') {
    const existing = await prisma.checklistItem.findFirst({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    const where: { orientingBlock: boolean; section?: string } = { orientingBlock: existing.orientingBlock }
    if (section) {
      where.section = section
    }
    const maxOrder = await prisma.checklistItem.aggregate({ _max: { sortOrder: true }, where })
    const nextOrder = (maxOrder._max?.sortOrder ?? -1) + 1
    const data: { sortOrder: number; section: string } = { sortOrder: nextOrder, section }
    const item = await prisma.checklistItem.update({ where: { id }, data })
    return NextResponse.json(item)
  }
  const item = await prisma.checklistItem.update({ where: { id }, data: { completed } })
  return NextResponse.json(item)
}

export async function DELETE(request: NextRequest) {
  const auth = await requireUserPrisma(request)
  if ('error' in auth) return auth.error
  const { prisma } = auth
  const { id } = await request.json()
  if (typeof id !== 'number') {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }
  await prisma.checklistItem.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
