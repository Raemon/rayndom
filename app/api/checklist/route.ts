import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const items = await prisma.checklistItem.findMany({ orderBy: { id: 'asc' } })
  return NextResponse.json(items)
}

export async function POST(request: NextRequest) {
  const { title } = await request.json()
  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }
  const item = await prisma.checklistItem.create({ data: { title: title.trim() } })
  return NextResponse.json(item)
}

export async function PATCH(request: NextRequest) {
  const { id, completed } = await request.json()
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
