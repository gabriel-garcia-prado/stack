import { describe, expect, test } from 'bun:test'
import type { InferRequestType, InferResponseType } from 'hono/client'
import { hc } from 'hono/client'

// Type-only import: erased at runtime, so it can't trigger the eager env
// validation before the defaults below are set.
import type { AppType } from './index'

// Provide defaults so the app module (which validates env eagerly) can load
// without a .env file (e.g. in CI). No test below talks to a real database.
process.env.DATABASE_CONNECTION_STRING ??= 'postgres://postgres:postgres@localhost:5432/postgres'
process.env.BETTER_AUTH_SECRET ??= 'integration-test-secret'
process.env.BETTER_AUTH_URL ??= 'http://localhost:3000'

const { default: app } = await import('./index')

describe('app (integration)', () => {
  test('GET /health returns 200', async () => {
    const response = await app.request('/health')

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ status: 'ok' })
  })

  test('POST /api/hello-world with an invalid body returns 400 before touching the database', async () => {
    const response = await app.request('/api/hello-world', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', age: 'not-a-number' })
    })

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ message: 'Failed to validate' })
  })

  test('GET /api/me without a session returns 401', async () => {
    const response = await app.request('/api/me')

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ message: 'Unauthorized' })
  })
})

// --- compile-time guardrails for the typed RPC client ---------------------
// These lines fail `bun typecheck` if Hono's schema inference ever collapses
// again (e.g. a validator wrapped in createMiddleware, or a dependency bump
// changing inference), which the runtime tests above cannot catch.
const client = hc<AppType>('http://localhost')

type Assert<T extends true> = T
// `any extends X` is always true, so guard against inference degrading to any.
type IsNotAny<T> = 0 extends 1 & T ? false : true
type HelloWorldOutput = InferResponseType<(typeof client.api)['hello-world']['$post'], 200>
type HelloWorldInput = InferRequestType<(typeof client.api)['hello-world']['$post']>['json']
type MeOutput = InferResponseType<typeof client.api.me.$get, 200>

type _HelloWorldOutputIsTyped = Assert<
  HelloWorldOutput extends { message: string } ? IsNotAny<HelloWorldOutput> : false
>
type _HelloWorldInputIsTyped = Assert<
  HelloWorldInput extends { name: string; age: number } ? IsNotAny<HelloWorldInput> : false
>
type _MeOutputIsTyped = Assert<MeOutput extends { user: { email: string } } ? IsNotAny<MeOutput> : false>
