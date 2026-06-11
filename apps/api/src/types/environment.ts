import { z } from 'zod'

export const environmentSchema = z
  .object({
    // Full connection URL. Optional override that wins when set — use it for a
    // managed/hosted database. Otherwise the URL is assembled from the
    // POSTGRES_* parts below, which is all local dev and Docker need.
    DATABASE_CONNECTION_STRING: z.url().optional(),
    // The single DB secret. `POSTGRES_HOST` is `localhost` for bare-metal dev
    // and the `postgres` compose service name inside Docker.
    POSTGRES_PASSWORD: z.string().min(1).optional(),
    POSTGRES_HOST: z.string().min(1).default('localhost'),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.url(),
    // Comma-separated list of extra origins allowed to call the auth endpoints
    // (e.g. the Vite dev server). Same-origin requests are always allowed.
    TRUSTED_ORIGINS: z
      .string()
      .optional()
      .transform((value) => (value ? value.split(',').map((origin) => origin.trim()) : []))
  })
  .transform(({ POSTGRES_PASSWORD, POSTGRES_HOST, ...rest }, ctx) => {
    const connectionString =
      rest.DATABASE_CONNECTION_STRING ??
      (POSTGRES_PASSWORD ? `postgres://postgres:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:5432/postgres` : undefined)

    if (!connectionString) {
      ctx.addIssue({
        code: 'custom',
        path: ['DATABASE_CONNECTION_STRING'],
        message: 'Set POSTGRES_PASSWORD (assembled into the connection URL) or DATABASE_CONNECTION_STRING directly'
      })
      return z.NEVER
    }

    return { ...rest, DATABASE_CONNECTION_STRING: connectionString }
  })

export type Environment = z.infer<typeof environmentSchema>

const parsed = environmentSchema.safeParse(process.env)

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`).join('\n')
  throw new Error(`Invalid environment variables:\n${issues}`)
}

/**
 * Validated environment variables.
 *
 * Parsed once, eagerly, when this module is first imported (i.e. at startup).
 * Every consumer must read env through this object rather than `process.env`
 * so the values are guaranteed to be present and correctly typed.
 */
export const environment: Environment = parsed.data
