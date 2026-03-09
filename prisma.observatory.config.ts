import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/observatory.schema.prisma',
  migrations: {
    path: 'prisma/observatory-migrations',
  },
  datasource: {
    url: process.env['OBSERVATORY_DATABASE_URL'],
  },
})
