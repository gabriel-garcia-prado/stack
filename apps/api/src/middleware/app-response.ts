import type { Context } from 'hono'
import type { Result } from 'neverthrow'
import type { AppResponse, CustomEnvironment } from '../factory'
import { factory } from '../factory'
import type { AppError } from '../types/errors'

export const appResponse = <T>(c: Context<CustomEnvironment>, input: Result<T, AppError>): AppResponse<T> =>
  input.match(
    (data): AppResponse<T> => {
      c.var.logger('success', 'appResponse')(data)
      return c.json(data, 200)
    },
    (error): AppResponse<T> => {
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

export const appResponseMiddleware = factory.createMiddleware(async (c, next) => {
  c.set('appResponse', <T>(input: Result<T, AppError>) => appResponse(c, input))
  await next()
})
