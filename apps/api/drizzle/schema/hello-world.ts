import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core'

import { timestamps } from '../utils/columns'

// Column names are derived from the property names via `casing: 'snake_case'`.
export const helloWorld = pgTable('hello_world', {
  id: uuid().primaryKey(),
  name: varchar().notNull(),
  ...timestamps
})
