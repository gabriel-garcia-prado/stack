import type { AppError } from '@errors'
import type { CustomEnvironment } from '@factory'
import type { Context } from 'hono'
import type { Result } from 'neverthrow'

/**
 * Maps a `Result` to a typed JSON response, logging along the way.
 *
 * Called directly from handlers (rather than via a context variable) so that
 * hono's RPC client can infer the concrete success type per route.
 */
export const appResponse = <T>(c: Context<CustomEnvironment>, input: Result<T, AppError>) =>
  input.match(
    (data) => {
      c.var.logger('success', 'appResponse')(data)
      return c.json(data, 200)
    },
    (error) => {
      c.var.logger('error', 'appError')(error)
      switch (error.type) {
        case 'DependencyError': {
          return c.json({ message: error.message }, 500)
        }
        case 'ValidationError': {
          return c.json({ message: error.message }, 400)
        }
        case 'InternalError': {
          return c.json({ message: error.message }, 500)
        }
        default: {
          const _exhaustive: never = error
          return c.json({ message: 'Unknown error' }, 500)
        }
      }
    }
  )
