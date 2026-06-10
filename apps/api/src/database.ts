import * as schema from '@dbSchema'
import { environment } from '@environment'
import { drizzle } from 'drizzle-orm/bun-sql'

export const database = drizzle({ connection: environment.DATABASE_CONNECTION_STRING, schema })
