import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()
  if (!email?.trim() || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }
  const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
  if (existingUser) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
  }
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { email: email.toLowerCase().trim(), passwordHash },
    select: { id: true, email: true, createdAt: true }
  })
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  const session = await prisma.session.create({ data: { userId: user.id, expiresAt } })
  const response = NextResponse.json({ user })
  response.cookies.set('session', session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/'
  })
  return response
}
