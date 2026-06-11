// Validate environment variables once, eagerly, before anything else loads.
import '#environment'

import { serveStatic } from 'hono/bun'
import { secureHeaders } from 'hono/secure-headers'

import { factory } from '#factory'
import { appResponseMiddleware } from './middleware/app-response'
import { loggerMiddleware } from './middleware/logger'
import { authRoutes } from './modules/auth/auth.handler'
import { helloWorldRoutes } from './modules/hello-world/hello-world.handler'
import { meRoutes } from './modules/me/me.handler'

const app = factory
  .createApp()
  .use(secureHeaders())
  .use(loggerMiddleware)
  .use(appResponseMiddleware)
  .get('/health', (c) => c.json({ status: 'ok' }, 200))
  .route('/api/auth', authRoutes)
  .route('/api/hello-world', helloWorldRoutes)
  .route('/api/me', meRoutes)

// Capture the RPC type *before* the catch-all static handlers below. A
// `.use('*', ...)` entry collapses Hono's route inference, which would strip
// every API route from the typed client (hc<AppType>).
export type AppType = typeof app

// Serve built web assets; falls through to the next handler if the file isn't found.
app.use('*', serveStatic({ root: './public' }))
// SPA fallback: serve index.html for any unmatched route (client-side routing).
app.use('*', serveStatic({ path: './public/index.html' }))

export default app
