import { neon } from '@neondatabase/serverless'

const getRequiredEnv = (key: string) => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing ${key}`)
  }
  return value
}

export const getDb = () => {
  const databaseUrl = getRequiredEnv('DATABASE_URL')
  return neon(databaseUrl)
}
