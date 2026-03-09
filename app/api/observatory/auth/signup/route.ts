import { NextRequest, NextResponse } from 'next/server'
import { observatoryPrisma } from '@/lib/observatoryPrisma'
import { createObservatorySession, hashObservatoryPassword, normalizeObservatoryEmail, recordObservatoryLoginAttempt, setObservatorySessionCookie, validateObservatoryPassword } from '@/lib/observatory/auth'
import { ensureObservatoryDefaultsForUser } from '@/lib/observatory/feed'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()
  if (!email?.trim() || !password) return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  const normalizedEmail = normalizeObservatoryEmail(email)
  const passwordError = validateObservatoryPassword(password)
  if (passwordError) return NextResponse.json({ error: passwordError }, { status: 400 })
  const existingUser = await observatoryPrisma.observatoryUser.findUnique({ where: { email: normalizedEmail } })
  if (existingUser) return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
  const passwordHash = await hashObservatoryPassword(password)
  const user = await observatoryPrisma.observatoryUser.create({
    data: { email: normalizedEmail, passwordHash },
    select: { id: true, email: true, createdAt: true },
  })
  const [, { session, expiresAt }] = await Promise.all([
    ensureObservatoryDefaultsForUser(user.id, user.email),
    createObservatorySession(user.id),
    recordObservatoryLoginAttempt(request, normalizedEmail, true, user.id),
  ])
  const response = NextResponse.json({ user })
  setObservatorySessionCookie(response, session.id, expiresAt)
  return response
}
