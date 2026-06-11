import type { Hook } from '@hono/zod-validator'
import { zValidator } from '@hono/zod-validator'
import type { Context } from 'hono'
import { err } from 'neverthrow'
import type { ZodType, z } from 'zod'

import type { CustomEnvironment } from '../factory'

/**
 * Thin wrapper around zValidator that shapes validation failures as an
 * AppResponse. It returns zValidator's middleware directly — never wrap it in
 * createMiddleware, which erases the validated input types from the route and
 * breaks both `c.req.valid()` and the RPC client's inference.
 */
export const validator = <Target extends 'json' | 'query' | 'param', Schema extends ZodType>(
  target: Target,
  schema: Schema
) => {
  const hook = (
    result: Parameters<Hook<z.output<Schema>, CustomEnvironment, string, Target, Record<string, never>, Schema>>[0],
    c: Context<CustomEnvironment>
  ) => {
    if (!result.success) {
      c.var.logger('error', `invalid ${target}`)(result.error)
      return c.var.appResponse(
        err({ type: 'ValidationError' as const, message: 'Failed to validate', input: result.error })
      )
    }
    c.var.logger('info', `valid ${target}`)(result.data)
  }
  return zValidator<Schema, Target, CustomEnvironment, string, typeof hook>(target, schema, hook)
}
