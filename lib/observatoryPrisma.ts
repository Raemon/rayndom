import { PrismaClient } from '@/lib/generated/observatoryPrisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForObservatoryPrisma = globalThis as unknown as {
  observatoryPrisma: PrismaClient
  observatoryPool: Pool
}

const getRequiredObservatoryDatabaseUrl = () => {
  const value = process.env.OBSERVATORY_DATABASE_URL
  if (!value) throw new Error('Missing OBSERVATORY_DATABASE_URL')
  return value
}

const observatoryPool = globalForObservatoryPrisma.observatoryPool || new Pool({ connectionString: getRequiredObservatoryDatabaseUrl() })
const observatoryAdapter = new PrismaPg(observatoryPool)

export const observatoryPrisma: PrismaClient = globalForObservatoryPrisma.observatoryPrisma || new PrismaClient({ adapter: observatoryAdapter })

if (process.env.NODE_ENV !== 'production') {
  globalForObservatoryPrisma.observatoryPrisma = observatoryPrisma
  globalForObservatoryPrisma.observatoryPool = observatoryPool
}
