import 'dotenv/config'
import { fetchArxiv } from '../lib/observatory/fetchers/arxiv'
import { prisma } from '../lib/prisma'

fetchArxiv().catch(err => {
  console.error('Error:', err)
  process.exit(1)
}).finally(() => prisma.$disconnect())
