/**
 * Applies pending Drizzle migrations, then exits.
 *
 * Runs as a one-shot step before the server starts (see the container CMD).
 * Retries the initial connection because Postgres may still be starting up
 * when this process launches.
 */
import { environment } from '@environment'
import { drizzle } from 'drizzle-orm/bun-sql'
import { migrate } from 'drizzle-orm/bun-sql/migrator'

const MAX_ATTEMPTS = 10
const RETRY_DELAY_MS = 2000

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const database = drizzle({ connection: environment.DATABASE_CONNECTION_STRING })

for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  try {
    await migrate(database, { migrationsFolder: './drizzle/migrations' })
    console.log('[MIGRATE] migrations applied')
    break
  } catch (error) {
    if (attempt === MAX_ATTEMPTS) {
      console.error(`[MIGRATE] failed after ${MAX_ATTEMPTS} attempts`)
      await database.$client.end()
      throw error
    }
    console.log(`[MIGRATE] database not ready (attempt ${attempt}/${MAX_ATTEMPTS}), retrying in ${RETRY_DELAY_MS}ms`)
    await sleep(RETRY_DELAY_MS)
  }
}

await database.$client.end()
