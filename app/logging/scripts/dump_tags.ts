import 'dotenv/config'
import { prisma } from '../../../lib/prisma'
import fs from 'fs'

async function main() {
  const tags = await prisma.tag.findMany({ orderBy: [{ type: 'asc' }, { name: 'asc' }] })
  fs.writeFileSync('/tmp/tags_dump.json', JSON.stringify(tags, null, 2))
  console.log('Wrote', tags.length, 'tags')
  process.exit(0)
}
main()
