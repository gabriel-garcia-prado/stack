import { drizzle } from 'drizzle-orm/bun-sql'

import * as schema from '../drizzle/schema'
import { environment } from './types/environment'

export const database = drizzle({
  connection: environment.DATABASE_CONNECTION_STRING,
  schema,
  casing: 'snake_case'
})
