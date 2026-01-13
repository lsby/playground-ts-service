import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: {
    // sqlite
    url: env('DB_PATH_PRISMA'),
    // pg/mysql
    // url: env('DB_URL'),
    // shadowDatabaseUrl: process.env.SHADOW_DB_URL,
  },
})
