import { createMiddleware } from 'hono/factory'
import type { CustomEnvironment } from '#factory'
import type { Session } from '../modules/auth/auth'
import { auth } from '../modules/auth/auth'

type AuthEnvironment = {
  Variables: CustomEnvironment['Variables'] & {
    user: Session['user']
    session: Session['session']
  }
}

/**
 * Rejects the request with a 401 unless it carries a valid session cookie.
 * Downstream handlers can read the authenticated user via `c.var.user`.
 */
export const requireAuth = createMiddleware<AuthEnvironment>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) {
    return c.json({ message: 'Unauthorized' }, 401)
  }
  c.set('user', session.user)
  c.set('session', session.session)
  await next()
})
