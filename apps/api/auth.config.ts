import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'

import { environment } from './src/types/environment'

export const getAuth = (database: Parameters<typeof drizzleAdapter>['0']) =>
  betterAuth({
    database: drizzleAdapter(database, {
      provider: 'pg'
    }),
    secret: environment.BETTER_AUTH_SECRET,
    baseURL: environment.BETTER_AUTH_URL,
    trustedOrigins: environment.TRUSTED_ORIGINS,
    emailAndPassword: {
      enabled: true
    }
  })
