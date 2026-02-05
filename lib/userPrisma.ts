import { NextRequest } from 'next/server'
import { prisma } from './prisma'

export type UserContext = { userId: number; email: string }

export async function getSessionUser(request: NextRequest): Promise<UserContext | null> {
  const sessionId = request.cookies.get('session')?.value
  if (!sessionId) return null
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: { select: { id: true, email: true } } }
  })
  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.session.delete({ where: { id: sessionId } }).catch(() => {})
    return null
  }
  return { userId: session.user.id, email: session.user.email }
}

// Models that have user_id field and should be filtered
const USER_SCOPED_MODELS = ['checklistItem', 'timeblock', 'tag', 'tagInstance', 'command'] as const
type UserScopedModel = typeof USER_SCOPED_MODELS[number]

function isUserScopedModel(model: string): model is UserScopedModel {
  return USER_SCOPED_MODELS.includes(model as UserScopedModel)
}

export function createUserScopedPrisma(userId: number) {
  // Use Prisma's $extends to create a client that auto-filters by userId
  return prisma.$extends({
    query: {
      $allModels: {
        async findMany({ model, args, query }) {
          if (isUserScopedModel(model)) {
            args.where = { ...args.where, userId }
          }
          return query(args)
        },
        async findFirst({ model, args, query }) {
          if (isUserScopedModel(model)) {
            args.where = { ...args.where, userId }
          }
          return query(args)
        },
        async findUnique({ model, args, query }) {
          // findUnique can't add extra where clauses, so we verify after fetch
          const result = await query(args)
          if (isUserScopedModel(model) && result && 'userId' in result && result.userId !== userId) {
            return null
          }
          return result
        },
        async create({ model, args, query }) {
          if (isUserScopedModel(model)) {
            (args.data as Record<string, unknown>).userId = userId
          }
          return query(args)
        },
        async createMany({ model, args, query }) {
          if (isUserScopedModel(model)) {
            if (Array.isArray(args.data)) {
              (args as { data: Record<string, unknown>[] }).data = args.data.map(d => ({ ...d, userId }))
            } else {
              (args.data as Record<string, unknown>).userId = userId
            }
          }
          return query(args)
        },
        async update({ model, args, query }) {
          if (isUserScopedModel(model)) {
            // First verify ownership
            const prismaAny = prisma as unknown as Record<string, { findFirst: (args: { where: unknown }) => Promise<{ userId?: number | null } | null> }>
            const existing = await prismaAny[model].findFirst({ where: { ...args.where, userId } })
            if (!existing) throw new Error('Not found or access denied')
          }
          return query(args)
        },
        async updateMany({ model, args, query }) {
          if (isUserScopedModel(model)) {
            args.where = { ...args.where, userId }
          }
          return query(args)
        },
        async delete({ model, args, query }) {
          if (isUserScopedModel(model)) {
            // First verify ownership
            const prismaAny = prisma as unknown as Record<string, { findFirst: (args: { where: unknown }) => Promise<{ userId?: number | null } | null> }>
            const existing = await prismaAny[model].findFirst({ where: { ...args.where, userId } })
            if (!existing) throw new Error('Not found or access denied')
          }
          return query(args)
        },
        async deleteMany({ model, args, query }) {
          if (isUserScopedModel(model)) {
            args.where = { ...args.where, userId }
          }
          return query(args)
        },
        async upsert({ model, args, query }) {
          if (isUserScopedModel(model)) {
            args.where = { ...args.where, userId } as typeof args.where
            ;(args.create as Record<string, unknown>).userId = userId
          }
          return query(args)
        },
        async aggregate({ model, args, query }) {
          if (isUserScopedModel(model)) {
            args.where = { ...args.where, userId }
          }
          return query(args)
        },
        async count({ model, args, query }) {
          if (isUserScopedModel(model)) {
            args.where = { ...args.where, userId }
          }
          return query(args)
        },
        async groupBy({ model, args, query }) {
          if (isUserScopedModel(model)) {
            args.where = { ...args.where, userId }
          }
          return query(args)
        }
      }
    }
  })
}

export type UserScopedPrisma = ReturnType<typeof createUserScopedPrisma>

// Convenience function to get a user-scoped prisma client from a request
export async function getUserPrisma(request: NextRequest): Promise<{ prisma: UserScopedPrisma; user: UserContext } | null> {
  const user = await getSessionUser(request)
  if (!user) return null
  return { prisma: createUserScopedPrisma(user.userId), user }
}

// For routes that require auth - returns 401 response if not authenticated
export async function requireUserPrisma(request: NextRequest): Promise<{ prisma: UserScopedPrisma; user: UserContext } | { error: Response }> {
  const result = await getUserPrisma(request)
  if (!result) {
    const { NextResponse } = await import('next/server')
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return result
}
