import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const orientingOnly = request.nextUrl.searchParams.get('orientingOnly') === 'true'
  const section = request.nextUrl.searchParams.get('section')
  const where: { orientingBlock: boolean, OR?: { section: string | null }[] } = { orientingBlock: orientingOnly }
  if (section) where.OR = [{ section }, { section: null }]
  const items = await prisma.checklistItem.findMany({ where, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] })
  return NextResponse.json(items)
}

export async function POST(request: NextRequest) {
  const { title, orientingBlock, section } = await request.json()
  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }
  const where = { orientingBlock: orientingBlock ?? false }
  if (section) (where as { section?: string }).section = section
  const maxOrder = await prisma.checklistItem.aggregate({ _max: { sortOrder: true }, where })
  const nextOrder = (maxOrder._max?.sortOrder ?? -1) + 1
  const data = { title: title.trim(), sortOrder: nextOrder, orientingBlock: orientingBlock ?? false }
  if (section !== undefined) (data as { section?: string | null }).section = section ?? null
  const item = await prisma.checklistItem.create({ data })
  return NextResponse.json(item)
}

export async function PATCH(request: NextRequest) {
  const { id, completed, orderedIds, section } = await request.json()
  if (orderedIds && Array.isArray(orderedIds)) {
    await prisma.$transaction(
      orderedIds.map((itemId: number, index: number) =>
        prisma.checklistItem.update({ where: { id: itemId }, data: { sortOrder: index } })
      )
    )
    return NextResponse.json({ success: true })
  }
  if (typeof id !== 'number') {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }
  if (typeof section === 'string') {
    const existing = await prisma.checklistItem.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    const where = { orientingBlock: existing.orientingBlock }
    if (section) (where as { section?: string }).section = section
    const maxOrder = await prisma.checklistItem.aggregate({ _max: { sortOrder: true }, where })
    const nextOrder = (maxOrder._max?.sortOrder ?? -1) + 1
    const data = { sortOrder: nextOrder }
    ;(data as { section?: string }).section = section
    const item = await prisma.checklistItem.update({ where: { id }, data })
    return NextResponse.json(item)
  }
  const item = await prisma.checklistItem.update({ where: { id }, data: { completed } })
  return NextResponse.json(item)
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  if (typeof id !== 'number') {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }
  await prisma.checklistItem.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
