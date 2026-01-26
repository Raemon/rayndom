import 'dotenv/config'
import { prisma } from '../lib/prisma'

async function main() {
  try {
    console.log('Testing database connection...')
    await prisma.$connect()
    console.log('✓ Database connection successful!')
    const tagCount = await prisma.tag.count()
    console.log(`✓ Database query successful! Found ${tagCount} tags in database`)
  } catch (error) {
    console.error('✗ Database connection failed:')
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
