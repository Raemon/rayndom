import 'dotenv/config'
import { fetchHackerNews } from '../lib/observatory/fetchers/hackernews'
import { prisma } from '../lib/prisma'

fetchHackerNews().catch(err => {
  console.error('Error:', err)
  process.exit(1)
}).finally(() => prisma.$disconnect())
