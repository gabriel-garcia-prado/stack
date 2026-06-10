import { z } from 'zod'

export const environmentSchema = z.object({
  DATABASE_CONNECTION_STRING: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string(),
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
