import { getDb } from '../db'

export const createTimerTables = async () => {
  const sql = getDb()
  await sql`
    CREATE TABLE IF NOT EXISTS timeblocks (
      id SERIAL PRIMARY KEY,
      ray_notes TEXT,
      assistant_notes TEXT,
      datetime TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS tags (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      UNIQUE(name, type)
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS tag_instances (
      id SERIAL PRIMARY KEY,
      tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      datetime TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `
  console.log('timer tables created successfully')
}
