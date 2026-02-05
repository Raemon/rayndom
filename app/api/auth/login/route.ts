import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()
  if (!email?.trim() || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
  if (!user) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }
  const validPassword = await bcrypt.compare(password, user.passwordHash)
  if (!validPassword) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  const session = await prisma.session.create({ data: { userId: user.id, expiresAt } })
  const response = NextResponse.json({
    user: { id: user.id, email: user.email, createdAt: user.createdAt }
  })
  response.cookies.set('session', session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/'
  })
  return response
}
