import type { ResultAsync } from 'neverthrow'
import type { DependencyError } from '../../types/errors'

type Dependencies = {
  generateId: () => string
  saveName: (id: string, name: string) => ResultAsync<void, DependencyError>
}

type Input = Readonly<{
  name: string
  age: number
}>

type Output = ResultAsync<{ message: string }, DependencyError>

export const helloWorld =
  (dependencies: Dependencies) =>
  (input: Input): Output =>
    dependencies.saveName(dependencies.generateId(), input.name).map(() => ({
      message: `Hello ${input.name}, you are ${input.age} years old`
    }))
