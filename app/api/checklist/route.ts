import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const orientingOnly = request.nextUrl.searchParams.get('orientingOnly') === 'true'
  const where = orientingOnly ? { orientingBlock: true } : { orientingBlock: false }
  const items = await prisma.checklistItem.findMany({ where, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] })
  return NextResponse.json(items)
}

export async function POST(request: NextRequest) {
  const { title, orientingBlock } = await request.json()
  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }
  const maxOrder = await prisma.checklistItem.aggregate({ _max: { sortOrder: true } })
  const nextOrder = (maxOrder._max?.sortOrder ?? -1) + 1
  const item = await prisma.checklistItem.create({ data: { title: title.trim(), sortOrder: nextOrder, orientingBlock: orientingBlock ?? false } })
  return NextResponse.json(item)
}

export async function PATCH(request: NextRequest) {
  const { id, completed, orderedIds } = await request.json()
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
