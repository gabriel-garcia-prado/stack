import { factory } from '@factory'
import { zValidator } from '@hono/zod-validator'
import type { ZodType } from 'zod'

export const queryValidator = <T>(schema: ZodType<T>) =>
  factory.createMiddleware(
    zValidator('query', schema, (result, c) => {
      if (!result.success) {
        c.var.logger('error', 'invalid query')(result.error)
        return c.json({ message: 'Failed to validate' }, 400)
      }
      c.var.logger('info', 'valid query')(result.data)
    })
  )
