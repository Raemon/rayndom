import { createChecklistItemsTable } from '../lib/migrations/create_checklist_items'

const runMigration = async () => {
  try {
    await createChecklistItemsTable()
    console.log('Migration completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
