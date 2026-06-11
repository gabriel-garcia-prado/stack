import { factory } from '#factory'
import { auth } from './auth'

/** Better Auth handles everything under /api/auth/* (sign-in, sign-up, session, ...). */
export const authRoutes = factory.createApp().on(['GET', 'POST'], '/*', (c) => auth.handler(c.req.raw))
