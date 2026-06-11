import { ResultAsync } from 'neverthrow'
import { z } from 'zod'
import { database, helloWorld as helloWorldTable } from '#database'
import { factory } from '#factory'
import { validator } from '#validator'
import { helloWorld } from './hello-world'

const schema = z.object({
  name: z.string(),
  age: z.number()
})

const dependencies = {
  generateId: () => crypto.randomUUID(),
  saveName: (id: string, name: string) =>
    ResultAsync.fromPromise(database.insert(helloWorldTable).values({ id, name }), (error) => ({
      type: 'DependencyError' as const,
      message: `${error}`,
      dependency: 'db',
      input: { id, name }
    })).map(() => undefined)
}

export const helloWorldRoutes = factory
  .createApp()
  .post('/', validator('json', schema), async (c) =>
    c.var.appResponse(await helloWorld(dependencies)(c.req.valid('json')))
  )
