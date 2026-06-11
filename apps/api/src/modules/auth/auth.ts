import { database } from '#database'
import { getAuth } from '../../../auth.config'

/** The single Better Auth instance, created once at startup. */
export const auth = getAuth(database)

export type Session = typeof auth.$Infer.Session
