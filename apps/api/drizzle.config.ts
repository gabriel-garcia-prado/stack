import { defineConfig } from 'drizzle-kit'
import { environment } from '#environment'

export default defineConfig({
  schema: './drizzle/schema',
  dialect: 'postgresql',
  out: './drizzle/migrations',
  casing: 'snake_case',
  dbCredentials: {
    url: environment.DATABASE_CONNECTION_STRING
  }
})
