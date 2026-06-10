import { defineConfig } from 'drizzle-kit'

const url = process.env.DATABASE_CONNECTION_STRING
if (!url) {
  throw new Error('DATABASE_CONNECTION_STRING is required to run drizzle-kit')
}

export default defineConfig({
  schema: './drizzle/schema',
  dialect: 'postgresql',
  out: './drizzle/migrations',
  dbCredentials: {
    url
  }
})
