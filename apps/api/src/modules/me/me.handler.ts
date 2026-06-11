import { ok } from 'neverthrow'

import { factory } from '../../factory'
import { requireAuth } from '../../middleware/require-auth'

/** Example of a session-protected endpoint: returns the authenticated user. */
export const meRoutes = factory.createApp().get('/', requireAuth, (c) => c.var.appResponse(ok({ user: c.var.user })))
