import { environment } from '@environment'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'

export const getAuth = (database: Parameters<typeof drizzleAdapter>['0']) =>
  betterAuth({
    database: drizzleAdapter(database, {
      provider: 'pg'
    }),
    emailAndPassword: {
      enabled: true
    },
    trustedOrigins: environment.TRUSTED_ORIGINS
  })
