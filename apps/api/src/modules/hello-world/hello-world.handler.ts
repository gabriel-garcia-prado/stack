import { appResponse } from '@appResponse'
import { database } from '@database'
import { helloWorld as helloWorldTable } from '@dbSchema'
import { factory } from '@factory'
import { queryValidator } from '@validator'
import { ResultAsync } from 'neverthrow'
import { z } from 'zod'

import { helloWorld } from './hello-world'

const schema = z.object({
  name: z.string(),
  age: z.coerce.number()
})

const dependencies = {
  generateId: () => crypto.randomUUID(),
  saveName: (id: string, name: string) =>
    ResultAsync.fromPromise(database.insert(helloWorldTable).values({ id, name }).execute(), (error) => ({
      type: 'DependencyError' as const,
      message: `${error}`,
      dependency: 'db',
      input: { id, name }
    })).map(() => undefined)
}

export const helloWorldHandler = factory.createHandlers(queryValidator(schema), async (c) => {
  const input = c.req.valid('query')
  return appResponse(c, await helloWorld(dependencies)(input))
})
