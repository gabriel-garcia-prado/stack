import { timestamp } from 'drizzle-orm/pg-core'

// Column names (created_at, updated_at) come from `casing: 'snake_case'`.
export const timestamps = {
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())
}
