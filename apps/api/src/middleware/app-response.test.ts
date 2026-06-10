import { describe, expect, mock, test } from 'bun:test'
import type { AppError } from '@errors'
import { err, ok } from 'neverthrow'

import { appResponse } from './app-response'

/**
 * Builds a minimal fake hono Context exposing only what `appResponse` touches:
 * `c.var.logger(type, title)(data)` and `c.json(body, status)`. `c.json` echoes
 * its arguments back so we can assert on the status code and body shape.
 */
const makeContext = () => {
  const json = mock((body: unknown, status: number) => ({ body, status }))
  const logger = mock((_type: string, _title: string) => mock((_data: unknown) => undefined))
  const context = { var: { logger }, json } as unknown as Parameters<typeof appResponse>[0]
  return { context, json, logger }
}

describe('appResponse', () => {
  test('maps Ok to a 200 with the raw data', () => {
    const { context, json } = makeContext()
    const data = { message: 'hi' }

    const result = appResponse(context, ok(data)) as { body: unknown; status: number }

    expect(result.status).toBe(200)
    expect(result.body).toEqual(data)
    expect(json).toHaveBeenCalledWith(data, 200)
  })

  test('maps DependencyError to 500 with only the message', () => {
    const { context } = makeContext()
    const error: AppError = {
      type: 'DependencyError',
      message: 'db down',
      dependency: 'db',
      input: { id: '1' }
    }

    const result = appResponse(context, err(error)) as { body: unknown; status: number }

    expect(result.status).toBe(500)
    expect(result.body).toEqual({ message: 'db down' })
  })

  test('maps ValidationError to 400 with only the message', () => {
    const { context } = makeContext()
    const error: AppError = { type: 'ValidationError', message: 'bad input', input: {} }

    const result = appResponse(context, err(error)) as { body: unknown; status: number }

    expect(result.status).toBe(400)
    expect(result.body).toEqual({ message: 'bad input' })
  })

  test('maps InternalError to 500 with only the message', () => {
    const { context } = makeContext()
    const error: AppError = { type: 'InternalError', message: 'boom', error: new Error('boom') }

    const result = appResponse(context, err(error)) as { body: unknown; status: number }

    expect(result.status).toBe(500)
    expect(result.body).toEqual({ message: 'boom' })
  })

  test('logs the error branch through the context logger', () => {
    const { context, logger } = makeContext()
    const error: AppError = { type: 'InternalError', message: 'boom', error: undefined }

    appResponse(context, err(error))

    expect(logger).toHaveBeenCalledWith('error', 'appError')
  })
})
