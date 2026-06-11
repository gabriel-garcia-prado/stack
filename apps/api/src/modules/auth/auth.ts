import { getAuth } from '../../../auth.config'
import { database } from '../../database'

/** The single Better Auth instance, created once at startup. */
export const auth = getAuth(database)

export type Session = typeof auth.$Infer.Session
