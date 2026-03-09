import { createHash } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { observatoryPrisma } from '@/lib/observatoryPrisma'

export const OBSERVATORY_SESSION_COOKIE = 'observatory_session'
const OBSERVATORY_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000
const OBSERVATORY_MAX_FAILED_ATTEMPTS = 10
const OBSERVATORY_FAILED_ATTEMPT_WINDOW_MS = 15 * 60 * 1000

export type ObservatorySessionUser = { id: number, email: string, createdAt: Date }

const normalizeEmail = (email: string) => email.trim().toLowerCase()

const getRequestIpHash = (request: NextRequest) => {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const candidateIp = forwardedFor || request.headers.get('x-real-ip') || 'unknown'
  return createHash('sha256').update(candidateIp).digest('hex')
}

const getSessionExpiry = () => new Date(Date.now() + OBSERVATORY_SESSION_TTL_MS)

export const hashObservatoryPassword = async (password: string) => bcrypt.hash(password, 12)
export const compareObservatoryPassword = async (password: string, passwordHash: string) => bcrypt.compare(password, passwordHash)

export const validateObservatoryPassword = (password: string) => {
  if (password.length < 10) return 'Password must be at least 10 characters'
  if (!/[a-z]/i.test(password) || !/[0-9]/.test(password)) return 'Password must contain letters and numbers'
  return null
}

export const createObservatoryDefaultPrompt = (email: string) => `You are tuning a recommendations feed for ${email}.

Prefer content that feels:
- intellectually serious
- likely to teach something new
- concrete enough to act on

Avoid content that feels:
- shallowly viral
- low-information outrage bait
- repetitive summaries of things already obvious

When in doubt, favor depth, novelty, and clear reasoning over hype.`

export const getObservatorySessionUser = async (request: NextRequest): Promise<ObservatorySessionUser | null> => {
  const sessionId = request.cookies.get(OBSERVATORY_SESSION_COOKIE)?.value
  if (!sessionId) return null
  const session = await observatoryPrisma.observatorySession.findUnique({
    where: { id: sessionId },
    include: { user: { select: { id: true, email: true, createdAt: true } } },
  })
  if (!session || session.expiresAt < new Date()) {
    if (session) await observatoryPrisma.observatorySession.delete({ where: { id: sessionId } }).catch(() => {})
    return null
  }
  await observatoryPrisma.observatorySession.update({ where: { id: session.id }, data: { lastSeenAt: new Date(), expiresAt: getSessionExpiry() } }).catch(() => {})
  return session.user
}

export const getObservatorySessionUserFromCookies = async (): Promise<ObservatorySessionUser | null> => {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(OBSERVATORY_SESSION_COOKIE)?.value
  if (!sessionId) return null
  const session = await observatoryPrisma.observatorySession.findUnique({
    where: { id: sessionId },
    include: { user: { select: { id: true, email: true, createdAt: true } } },
  })
  if (!session || session.expiresAt < new Date()) return null
  return session.user
}

export const clearObservatorySessionCookie = (response: NextResponse) => {
  response.cookies.set(OBSERVATORY_SESSION_COOKIE, '', { httpOnly: true, expires: new Date(0), path: '/', sameSite: 'lax', secure: process.env.NODE_ENV === 'production' })
}

export const setObservatorySessionCookie = (response: NextResponse, sessionId: string, expiresAt: Date) => {
  response.cookies.set(OBSERVATORY_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })
}

export const createObservatorySession = async (userId: number) => {
  const expiresAt = getSessionExpiry()
  const session = await observatoryPrisma.observatorySession.create({ data: { userId, expiresAt } })
  return { session, expiresAt }
}

export const recordObservatoryLoginAttempt = async (request: NextRequest, email: string, successful: boolean, userId?: number) => {
  await observatoryPrisma.observatoryLoginAttempt.create({
    data: {
      email: normalizeEmail(email),
      successful,
      userId,
      ipHash: getRequestIpHash(request),
    },
  }).catch(() => {})
}

export const getObservatoryLoginThrottleError = async (request: NextRequest, email: string) => {
  const createdAfter = new Date(Date.now() - OBSERVATORY_FAILED_ATTEMPT_WINDOW_MS)
  const recentFailedAttemptCount = await observatoryPrisma.observatoryLoginAttempt.count({
    where: {
      email: normalizeEmail(email),
      successful: false,
      createdAt: { gte: createdAfter },
      ipHash: getRequestIpHash(request),
    },
  })
  if (recentFailedAttemptCount >= OBSERVATORY_MAX_FAILED_ATTEMPTS) return 'Too many failed attempts. Try again in 15 minutes.'
  return null
}

export const requireObservatoryUser = async (request: NextRequest) => {
  const user = await getObservatorySessionUser(request)
  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) as Response }
  }
  return { user }
}

export const normalizeObservatoryEmail = normalizeEmail
