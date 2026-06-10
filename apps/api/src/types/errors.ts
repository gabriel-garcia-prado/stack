export type DependencyError = {
  type: 'DependencyError'
  message: string
  dependency: string
  input: unknown
}

export type ValidationError = {
  type: 'ValidationError'
  message: string
  input: unknown
}

export type InternalError = {
  type: 'InternalError'
  message: string
  error: unknown
}

export type AppError = DependencyError | ValidationError | InternalError
