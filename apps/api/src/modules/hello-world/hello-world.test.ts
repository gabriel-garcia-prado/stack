import { describe, expect, mock, test } from 'bun:test'
import type { MockDependencies, MockInput } from '@testHelpers'
import { errAsync, okAsync } from 'neverthrow'

import { helloWorld } from './hello-world'

const ID = 'b16ed4bb-2c3f-478f-8b1d-1139467daf4d'

const mockDependencies: MockDependencies<typeof helloWorld> = (overrides) => ({
  generateId: mock(() => ID),
  saveName: mock((_id: string, _name: string) => okAsync(undefined)),
  ...overrides
})

const mockInput: MockInput<typeof helloWorld> = (overrides) => ({
  name: 'Alice',
  age: 42,
  ...overrides
})

describe('helloWorld', () => {
  test('saves the name under a generated id', async () => {
    const dependencies = mockDependencies()
    const input = mockInput()

    await helloWorld(dependencies)(input)

    expect(dependencies.saveName).toHaveBeenCalledWith(ID, 'Alice')
  })

  test('return dependency error', async () => {
    const error = {
      type: 'DependencyError' as const,
      message: 'db error',
      dependency: 'db',
      input: 'Alice'
    }
    const dependencies = mockDependencies({
      saveName: mock((_id: string, _name: string) => errAsync(error))
    })
    const input = mockInput()

    const response = await helloWorld(dependencies)(input)

    expect(dependencies.saveName).toHaveBeenCalledWith(ID, 'Alice')
    expect(response._unsafeUnwrapErr()).toEqual(error)
  })
})
