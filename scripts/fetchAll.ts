import 'dotenv/config'
import { fetchHackerNews } from '../lib/observatory/fetchers/hackernews'
import { fetchLWNews } from '../lib/observatory/fetchers/lw'
import { fetchArxiv } from '../lib/observatory/fetchers/arxiv'
import { prisma } from '../lib/prisma'

const main = async () => {
  console.log('\n=== Running fetchHackerNews ===\n')
  await fetchHackerNews()
  console.log('\n=== Running fetchLWNews ===\n')
  await fetchLWNews()
  console.log('\n=== Running fetchArxiv ===\n')
  await fetchArxiv()
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
}).finally(() => prisma.$disconnect())
