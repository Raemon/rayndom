import { NextRequest, NextResponse } from 'next/server'
import { requireUserPrisma } from '@/lib/userPrisma'

export async function GET(request: NextRequest) {
  const auth = await requireUserPrisma(request)
  if ('error' in auth) return auth.error
  const { prisma } = auth
  try {
    const commands = await prisma.command.findMany({ orderBy: [{ name: 'asc' }] })
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
    const command = await prisma.command.create({ data: { name, html } })
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
  const updateData: { name?: string, html?: string } = { name: body?.name ?? undefined, html: body?.html ?? undefined }
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
