import { PrismaClient } from './generated/prisma/client'
import type { PrismaClient as PrismaClientInterface } from './generated/prisma/internal/class'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClientInterface, pool: Pool }

export const pool: Pool = globalForPrisma.pool || new Pool({ connectionString: process.env.DATABASE_URL })
pool.on('error', err => console.error('[pg pool] idle client error:', err))
const adapter = new PrismaPg(pool)

export const prisma: PrismaClientInterface = globalForPrisma.prisma || new PrismaClient({ adapter }) as PrismaClientInterface

if (process.env.NODE_ENV !== 'production') { globalForPrisma.prisma = prisma; globalForPrisma.pool = pool }
