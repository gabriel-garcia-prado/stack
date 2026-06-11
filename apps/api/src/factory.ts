import type { TypedResponse } from 'hono'
import { createFactory } from 'hono/factory'
import type { JSONParsed } from 'hono/utils/types'
import type { Result } from 'neverthrow'

import type { AppError } from './types/errors'

type Logger = (type: 'log' | 'info' | 'success' | 'error', title: string) => (data: unknown) => void

// The success body type T flows through TypedResponse so the RPC client
// (hc<AppType>) can infer it; errors are always `{ message }` with 400/500.
// JSONParsed mirrors what c.json() actually serializes (e.g. Date -> string).
export type AppResponse<T = unknown> =
  | (Response & TypedResponse<JSONParsed<T>, 200, 'json'>)
  | (Response & TypedResponse<{ message: string }, 400 | 500, 'json'>)

export type AppResponseFn = <T>(input: Result<T, AppError>) => AppResponse<T>

export type CustomEnvironment = {
  Variables: {
    logger: Logger
    appResponse: AppResponseFn
  }
}

export const factory = createFactory<CustomEnvironment>()
