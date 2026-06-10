import { environment } from '@environment'
import { factory } from '@factory'
import { cors } from 'hono/cors'

const corsMiddlewareHandler = cors({
  origin: environment.TRUSTED_ORIGINS,
  credentials: true
})

export const corsMiddleware = factory.createMiddleware(corsMiddlewareHandler)
