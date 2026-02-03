import { PrismaClient } from './generated/prisma/client'
import type { PrismaClient as PrismaClientInterface } from './generated/prisma/internal/class'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClientInterface, pool: Pool }

const pool = globalForPrisma.pool || new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)

export const prisma: PrismaClientInterface = globalForPrisma.prisma || new PrismaClient({ adapter }) as PrismaClientInterface

if (process.env.NODE_ENV !== 'production') { globalForPrisma.prisma = prisma; globalForPrisma.pool = pool }
