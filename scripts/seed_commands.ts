import 'dotenv/config'
import { prisma } from '../lib/prisma'

const seedCommands = async () => {
  const thinkItFasterHtml = '<p><strong>What did you do?</strong></p><p></p><p><strong>Magic Short Path?</strong></p><p></p><p><strong>Observations</strong></p><p></p><p><strong>Confusions</strong></p><p></p><p><strong>Triggers and Actions</strong></p><p></p>'
  await prisma.command.upsert({ where: { name: 'Think It Faster' }, update: { html: thinkItFasterHtml }, create: { name: 'Think It Faster', html: thinkItFasterHtml } })
}

async function main() {
  try {
    await seedCommands()
    console.log('✓ Seeded commands')
    process.exit(0)
  } catch (error) {
    console.error('✗ Seeding commands failed:')
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
