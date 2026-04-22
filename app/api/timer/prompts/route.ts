import { NextRequest, NextResponse } from 'next/server'
import { requireUserPrisma } from '@/lib/userPrisma'
import { DEFAULT_AI_NOTES_PROMPT_TITLE, DEFAULT_AI_NOTES_PROMPT_TEXT } from '../predict-tags/defaultAiNotesPromptText'

export async function GET(request: NextRequest) {
  const auth = await requireUserPrisma(request)
  if ('error' in auth) return auth.error
  const { prisma } = auth
  try {
    let prompts = await prisma.prompt.findMany({ orderBy: [{ createdAt: 'asc' }] })
    if (prompts.length === 0) {
      // Seed the legacy hardcoded 15-minute aiNotes prompt as a default entry so the
      // "Run AI" dropdown has something to pick from on first load.
      await prisma.prompt.create({ data: { title: DEFAULT_AI_NOTES_PROMPT_TITLE, text: DEFAULT_AI_NOTES_PROMPT_TEXT } })
      prompts = await prisma.prompt.findMany({ orderBy: [{ createdAt: 'asc' }] })
    }
    return NextResponse.json({ prompts })
  } catch (error) {
    console.error('Error fetching prompts:', error)
    return NextResponse.json({ error: 'Failed to fetch prompts', prompts: [] }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireUserPrisma(request)
  if ('error' in auth) return auth.error
  const { prisma } = auth
  const body = await request.json()
  const title = body?.title
  const text = body?.text
  if (!title || typeof text !== 'string') return NextResponse.json({ error: 'Missing title or text' }, { status: 400 })
  try {
    const prompt = await prisma.prompt.create({ data: { title, text } })
    return NextResponse.json({ prompt })
  } catch (error) {
    console.error('Error creating prompt:', error)
    return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireUserPrisma(request)
  if ('error' in auth) return auth.error
  const { prisma } = auth
  const body = await request.json()
  const id = body?.id
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const updateData: { title?: string, text?: string } = {
    title: body?.title ?? undefined,
    text: body?.text ?? undefined,
  }
  try {
    const prompt = await prisma.prompt.update({ where: { id: Number(id) }, data: updateData })
    return NextResponse.json({ prompt })
  } catch (error) {
    console.error('Error updating prompt:', error)
    return NextResponse.json({ error: 'Failed to update prompt' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireUserPrisma(request)
  if ('error' in auth) return auth.error
  const { prisma } = auth
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  try {
    await prisma.prompt.delete({ where: { id: Number(id) } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting prompt:', error)
    return NextResponse.json({ error: 'Failed to delete prompt' }, { status: 500 })
  }
}
