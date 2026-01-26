import 'dotenv/config'
import { createChecklistItemsTable } from '../lib/migrations/create_checklist_items'
import { createTimerTables } from '../lib/migrations/create_timer_tables'

const runMigration = async () => {
  try {
    await createChecklistItemsTable()
    await createTimerTables()
    console.log('Migration completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
