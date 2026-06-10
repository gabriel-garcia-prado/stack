import { database } from '@database'
import type { AppResponse } from '@factory'
import { factory } from '@factory'

import { auth } from './auth'

// Instantiate the better-auth handler once at startup rather than per request.
const handleAuthRequest = auth(database)

export const authHandler = factory.createHandlers(
  (c) => handleAuthRequest(c.req.raw) as unknown as Promise<AppResponse>
)
