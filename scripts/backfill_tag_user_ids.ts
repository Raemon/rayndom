import 'dotenv/config'
import { prisma } from '../lib/prisma'

const backfillTagUserIds = async () => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'raemon777+logging@gmail.com' }
    })
    if (!user) {
      console.error('User with email raemon777+logging@gmail.com not found')
      process.exit(1)
    }
    console.log(`Found user id=${user.id} for raemon777+logging@gmail.com`)

    const tagResult = await prisma.tag.updateMany({
      where: { userId: null },
      data: { userId: user.id }
    })
    console.log(`Updated ${tagResult.count} tags to userId=${user.id}`)

    const tagInstanceResult = await prisma.tagInstance.updateMany({
      where: { userId: null },
      data: { userId: user.id }
    })
    console.log(`Updated ${tagInstanceResult.count} tag instances to userId=${user.id}`)

    console.log('Backfill completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('Backfill failed:', error)
    process.exit(1)
  }
}

backfillTagUserIds()
