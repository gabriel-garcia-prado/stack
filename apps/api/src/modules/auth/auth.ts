import type { drizzleAdapter } from 'better-auth/adapters/drizzle'

import { getAuth } from '../../../auth.config'

export const auth = (database: Parameters<typeof drizzleAdapter>['0']) => getAuth(database).handler
