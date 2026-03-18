import { NextRequest, NextResponse } from 'next/server'
import { requireUserPrisma } from '@/lib/userPrisma'

export async function GET(request: NextRequest) {
  const auth = await requireUserPrisma(request)
  if ('error' in auth) return auth.error
  const { prisma } = auth
  try {
    const commands = await prisma.command.findMany({ orderBy: [{ order: 'asc' }, { name: 'asc' }] })
    return NextResponse.json({ commands })
  } catch (error) {
    console.error('Error fetching commands:', error)
    return NextResponse.json({ error: 'Failed to fetch commands', commands: [] }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireUserPrisma(request)
  if ('error' in auth) return auth.error
  const { prisma } = auth
  const body = await request.json()
  const name = body?.name
  const html = body?.html
  if (!name || !html) return NextResponse.json({ error: 'Missing name or html' }, { status: 400 })
  try {
    const maxOrder = await prisma.command.aggregate({ _max: { order: true } })
    const nextOrder = (maxOrder._max.order ?? -1) + 1
    const command = await prisma.command.create({ data: { name, html, order: nextOrder } })
    return NextResponse.json({ command })
  } catch (error) {
    const code = (error as { code?: string })?.code
    if (code === 'P2002') return NextResponse.json({ error: 'Command name already exists' }, { status: 409 })
    console.error('Error creating command:', error)
    return NextResponse.json({ error: 'Failed to create command' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireUserPrisma(request)
  if ('error' in auth) return auth.error
  const { prisma } = auth
  const body = await request.json()
  const id = body?.id
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const updateData: { name?: string, html?: string, order?: number } = { name: body?.name ?? undefined, html: body?.html ?? undefined, order: body?.order ?? undefined }
  try {
    const command = await prisma.command.update({ where: { id: Number(id) }, data: updateData })
    return NextResponse.json({ command })
  } catch (error) {
    const code = (error as { code?: string })?.code
    if (code === 'P2002') return NextResponse.json({ error: 'Command name already exists' }, { status: 409 })
    console.error('Error updating command:', error)
    return NextResponse.json({ error: 'Failed to update command' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireUserPrisma(request)
  if ('error' in auth) return auth.error
  const { prisma } = auth
  const body = await request.json()
  const orderedIds: number[] = body?.orderedIds
  if (!Array.isArray(orderedIds)) return NextResponse.json({ error: 'Missing orderedIds array' }, { status: 400 })
  try {
    for (let i = 0; i < orderedIds.length; i++) {
      await prisma.command.update({ where: { id: orderedIds[i] }, data: { order: i } })
    }
    const commands = await prisma.command.findMany({ orderBy: [{ order: 'asc' }, { name: 'asc' }] })
    return NextResponse.json({ commands })
  } catch (error) {
    console.error('Error reordering commands:', error)
    return NextResponse.json({ error: 'Failed to reorder commands' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireUserPrisma(request)
  if ('error' in auth) return auth.error
  const { prisma } = auth
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  await prisma.command.delete({ where: { id: Number(id) } })
  return NextResponse.json({ ok: true })
}
