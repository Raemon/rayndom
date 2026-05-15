import 'dotenv/config'
import { fetchLWNews } from '../lib/observatory/fetchers/lw'
import { prisma } from '../lib/prisma'

fetchLWNews().catch(err => {
  console.error('Error:', err)
  process.exit(1)
}).finally(() => prisma.$disconnect())
