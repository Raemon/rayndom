import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get('session')?.value
  if (!sessionId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true }
  })
  if (!session || session.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  const { currentPassword, newPassword } = await request.json()
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Current and new password are required' }, { status: 400 })
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 })
  }
  const validPassword = await bcrypt.compare(currentPassword, session.user.passwordHash)
  if (!validPassword) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
  }
  const passwordHash = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({ where: { id: session.user.id }, data: { passwordHash } })
  return NextResponse.json({ success: true })
}
