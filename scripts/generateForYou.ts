import 'dotenv/config'
import { generateForYou } from '../lib/observatory/generate-foryou'
import { prisma } from '../lib/prisma'

generateForYou().catch(err => {
  console.error('Error:', err)
  process.exit(1)
}).finally(() => prisma.$disconnect())
