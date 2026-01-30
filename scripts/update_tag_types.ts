import 'dotenv/config'
import { prisma } from '../lib/prisma'

const updateTagTypes = async () => {
  try {
    // Update all tags with type "???" to "Triggers"
    const updateResult = await prisma.tag.updateMany({
      where: { type: '???' },
      data: { type: 'Triggers' }
    })
    console.log(`Updated ${updateResult.count} tags from "???" to "Triggers"`)

    // Delete all tags with type "Activity" (this will cascade delete tag instances)
    const deleteResult = await prisma.tag.deleteMany({
      where: { type: 'Activity' }
    })
    console.log(`Deleted ${deleteResult.count} tags with type "Activity"`)

    console.log('Tag type update completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('Tag type update failed:', error)
    process.exit(1)
  }
}

updateTagTypes()
