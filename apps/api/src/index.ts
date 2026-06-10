// Validate environment variables once, eagerly, before anything else loads.
import '@environment'

import { factory } from '@factory'
import { serveStatic } from 'hono/bun'

import { corsMiddleware } from './middleware/cors'
import { loggerMiddleware } from './middleware/logger'
import { authHandler } from './modules/auth/auth.handler'
import { helloWorldHandler } from './modules/hello-world/hello-world.handler'

const app = factory
  .createApp()
  .use(corsMiddleware)
  .use(loggerMiddleware)
  .get('/api/auth/*', ...authHandler)
  .post('/api/auth/*', ...authHandler)
  .get('/hello-world', ...helloWorldHandler)

// Capture the RPC type *before* the catch-all static handlers below. A
// `.use('*', ...)` entry collapses Hono's route inference, which would strip
// every API route from the typed client (hc<AppType>).
export type AppType = typeof app

// Serve built web assets; falls through to the next handler if the file isn't found.
app.use('*', serveStatic({ root: './public' }))
// SPA fallback: serve index.html for any unmatched route (client-side routing).
app.use('*', serveStatic({ path: './public/index.html' }))

export default app
