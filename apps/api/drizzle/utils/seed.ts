/**
 * Seeds development data: a known dev user so you can sign in immediately.
 *
 * Runs as a one-shot step after migrations in `bun dev` (it is not part of the
 * production container CMD). Idempotent — safe to run repeatedly. The user is
 * created through Better Auth's own API so the password hash matches exactly
 * what sign-in expects.
 */
import { eq } from 'drizzle-orm'
import { database, user } from '#database'
import { auth } from '../../src/modules/auth/auth'

export const DEV_USER = {
  name: 'Dev User',
  email: 'dev@example.com',
  password: 'password1234'
}

if (process.env.NODE_ENV === 'production') {
  console.error('[SEED] refusing to seed in production')
  process.exit(1)
}

const existing = await database.select().from(user).where(eq(user.email, DEV_USER.email))

if (existing.length > 0) {
  console.log(`[SEED] dev user already exists — email: ${DEV_USER.email}, password: ${DEV_USER.password}`)
} else {
  await auth.api.signUpEmail({ body: DEV_USER })
  console.log(`[SEED] created dev user — email: ${DEV_USER.email}, password: ${DEV_USER.password}`)
}

await database.$client.end()
process.exit(0)
