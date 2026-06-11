import { drizzle } from 'drizzle-orm/bun-sql'

import { environment } from '#environment'

import * as schema from '../drizzle/schema'

export const database = drizzle({
  connection: environment.DATABASE_CONNECTION_STRING,
  schema,
  casing: 'snake_case'
})

// Re-export the tables so consumers get the client and the schema from one
// import: `import { database, helloWorld } from '#database'`.
export * from '../drizzle/schema'
