import { z } from 'zod'

export const environmentSchema = z.object({
  DATABASE_CONNECTION_STRING: z.url(),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.url(),
  // Comma-separated list of extra origins allowed to call the auth endpoints
  // (e.g. the Vite dev server). Same-origin requests are always allowed.
  TRUSTED_ORIGINS: z
    .string()
    .optional()
    .transform((value) => (value ? value.split(',').map((origin) => origin.trim()) : []))
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
