import { drizzle } from 'drizzle-orm/bun-sql'

import { getAuth } from '../../auth.config'

/**
 * this function is only meant to be used to generate drizzle schema.
 *
 * @internal
 */
export const auth = getAuth(drizzle.mock())
