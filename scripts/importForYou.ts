import 'dotenv/config'
import * as fs from 'fs'
import * as path from 'path'
import { prisma } from '../lib/prisma'

const TAB_TO_SOURCE: Record<string, string> = {
  hackernews: 'hackernews',
  lw: 'lw',
  arxiv: 'arxiv',
}

type ForYouItem = { tab: string, url: string, reason: string }

const main = async () => {
  const forYouPath = path.resolve(__dirname, '../app/foryou/forYouData.json')
  const raw = JSON.parse(fs.readFileSync(forYouPath, 'utf-8')) as { items: ForYouItem[] }
  console.log(`Loaded ${raw.items.length} forYou items from JSON`)

  const stories = await prisma.story.findMany({ select: { id: true, source: true, url: true } })
  const storyBySourceUrl = new Map(stories.map(s => [`${s.source}:${s.url}`, s.id]))

  const rows: { storyId: number, reason: string, sortOrder: number }[] = []
  for (let i = 0; i < raw.items.length; i++) {
    const item = raw.items[i]
    const source = TAB_TO_SOURCE[item.tab]
    if (!source) { console.log(`  Skipping unknown tab: ${item.tab}`); continue }
    const storyId = storyBySourceUrl.get(`${source}:${item.url}`)
    if (!storyId) { console.log(`  Story not found in DB: [${source}] ${item.url}`); continue }
    rows.push({ storyId, reason: item.reason, sortOrder: i })
  }

  await prisma.forYouItem.deleteMany()
  await prisma.forYouItem.createMany({ data: rows })
  console.log(`Imported ${rows.length}/${raw.items.length} forYou items`)
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
}).finally(() => prisma.$disconnect())
