import type { AppError } from '@errors'
import type { Context, MiddlewareHandler, TypedResponse } from 'hono'
import { createFactory } from 'hono/factory'
import type { Result } from 'neverthrow'

type Logger = (type: 'log' | 'info' | 'success' | 'error', title: string) => (data: unknown) => void

declare const AppResponseBrand: unique symbol
// T is carried via TypedResponse so the RPC client (hc<AppType>) can infer the success body type.
// The brand ensures only appResponseMiddleware can produce this value.
export type AppResponse<T = unknown> = (
  | (Response & TypedResponse<T, 200, 'json'>)
  | (Response & TypedResponse<{ message: string }, 400 | 500, 'json'>)
) & { readonly [AppResponseBrand]: true }

export type AppResponseFn = <T>(input: Result<T, AppError>) => AppResponse<T>

export type CustomEnvironment = {
  Variables: {
    logger: Logger
    appResponse: AppResponseFn
  }
}

const honoFactory = createFactory<CustomEnvironment>()

// AppHandler uses a wide Input so `c.req.valid()` stays callable and returns
// `any`. The only thing we're enforcing here is the return type.
type WideInput = { in: Record<string, any>; out: Record<string, any> }
type AppHandler = (c: Context<CustomEnvironment, string, WideInput>) => Promise<AppResponse>

export const factory = {
  createApp: () => honoFactory.createApp(),
  createMiddleware: honoFactory.createMiddleware.bind(honoFactory),
  // H is inferred as the concrete handler type so the route preserves T for RPC inference,
  // while the H extends AppHandler constraint still enforces the branded return type.
  createHandlers: <M extends MiddlewareHandler<CustomEnvironment, string, any>[], H extends AppHandler>(
    ...handlers: [...M, H]
  ) => (honoFactory.createHandlers as (...args: any[]) => any)(...handlers) as [...M, H]
}
