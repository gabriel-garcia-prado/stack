import { createFactory } from 'hono/factory'

type Logger = (type: 'log' | 'info' | 'success' | 'error', title: string) => (data: unknown) => void

export type CustomEnvironment = {
  Variables: {
    logger: Logger
  }
}

export const factory = createFactory<CustomEnvironment>()
