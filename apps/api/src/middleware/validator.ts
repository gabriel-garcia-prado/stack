import { factory } from '@factory'
import { zValidator } from '@hono/zod-validator'
import { err } from 'neverthrow'
import type { ZodType } from 'zod'

export const queryValidator = <T>(schema: ZodType<T>) =>
  factory.createMiddleware(
    zValidator('query', schema, (result, c) => {
      if (!result.success) {
        c.var.logger('error', 'invalid query')(result.error)
        return c.var.appResponse(err({ type: 'ValidationError' as const, message: 'Failed to validate', input: result.error }))
      }
      c.var.logger('info', 'valid query')(result.data)
    })
  )
