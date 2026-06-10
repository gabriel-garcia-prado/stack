# @stack/api

<div align="center">

A type-safe API backend built with **Bun**, **Hono**, **Drizzle**, and **PostgreSQL**.

[![Bun](https://img.shields.io/badge/Bun-1-black)](https://bun.sh/)
[![Hono](https://img.shields.io/badge/Hono-4-blue)](https://hono.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)
[![Drizzle](https://img.shields.io/badge/Drizzle-0.45-green)](https://orm.drizzle.team/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.6-green)](https://www.better-auth.com/)

</div>

## 📚 Overview

The backend is a [Hono](https://hono.dev/) app running on the Bun runtime. It uses
[Drizzle ORM](https://orm.drizzle.team/) over Bun's native `bun:sql` driver for
PostgreSQL, [Zod](https://zod.dev/) for request validation,
[Better Auth](https://www.better-auth.com/) for authentication, and
[neverthrow](https://github.com/supermacro/neverthrow) for typed, functional error
handling — no exceptions thrown across business logic.

## ✨ Features

- ⚡️ Bun runtime with hot reload
- 🔐 End-to-end type-safe endpoints (Hono RPC — the web app infers `AppType`)
- 📦 PostgreSQL via Drizzle ORM (`bun:sql`)
- 🛡️ Request validation with Zod
- 🚦 Typed error handling with neverthrow (`Result` / `ResultAsync`)
- 🔒 Email + password auth with Better Auth (cookie sessions)
- 🧩 Modular, dependency-injected architecture that's trivial to unit test
- 🌐 Serves the built web app from `./public` (single-image deploy)

## 🚀 Quick Start

> Most of the time you'll run everything from the repo root with `bun dev`. The steps
> below are for working on the API in isolation.

### Prerequisites

- [Bun](https://bun.sh/) (>= 1.0)
- [Docker](https://www.docker.com/) for PostgreSQL

### 1. Install dependencies (from the repo root)

```sh
bun install
```

### 2. Start PostgreSQL

```sh
bun db:up        # from the repo root (docker compose)
```

### 3. Configure environment

```sh
cp .env.example .env
```

| Variable                     | Description               | Example                                                    |
| ---------------------------- | ------------------------- | ---------------------------------------------------------- |
| `DATABASE_CONNECTION_STRING` | PostgreSQL connection URL | `postgresql://postgres:my_password@localhost:5432/postgres` |
| `BETTER_AUTH_SECRET`         | Secret for signing sessions | `openssl rand -base64 32`                                |
| `BETTER_AUTH_URL`            | Auth server base URL      | `http://localhost:3000`                                    |
| `TRUSTED_ORIGINS`            | Comma-separated CORS origins | `http://localhost:5173`                                 |

Environment variables are validated **once at startup** with Zod
(`src/types/environment.ts`); the process exits early with a clear message if any
required value is missing.

### 4. Apply migrations & run

```sh
bun db:migrate
bun dev
```

## 📦 Project Structure

```
apps/api/
├── src/
│   ├── modules/              # Feature modules (auth, hello-world)
│   │   └── <name>/
│   │       ├── <name>.ts          # Pure business logic (DI + neverthrow)
│   │       ├── <name>.handler.ts  # HTTP wiring (validation + response)
│   │       └── <name>.test.ts     # Unit tests (mocked dependencies)
│   ├── middleware/           # cors, logger, validator
│   ├── lib/                  # app-response, test helpers
│   ├── types/                # environment (Zod), errors (AppError union)
│   ├── database.ts           # Drizzle client (bun:sql)
│   ├── factory.ts            # Hono factory + typed context (logger)
│   ├── migrate.ts            # Programmatic migration runner
│   └── index.ts              # App entry point + route wiring
├── drizzle/
│   ├── migrations/           # Generated SQL migrations
│   ├── schema/               # Table definitions (auth, hello-world)
│   └── utils/                # Shared column helpers, auth schema config
├── auth.config.ts            # Better Auth configuration
├── drizzle.config.ts         # drizzle-kit config
└── Dockerfile                # Production image (API + web build)
```

## 🛠️ Scripts

| Command             | Description                                          |
| ------------------- | ---------------------------------------------------- |
| `bun dev`           | Run migrations, then start the server with hot reload |
| `bun test`          | Run unit tests (`bun test`)                          |
| `bun lint`          | Lint + format check (Biome)                          |
| `bun typecheck`     | Type-check with `tsc --noEmit`                       |
| `bun db:generate`   | Generate a migration from schema changes             |
| `bun db:migrate`    | Apply pending migrations                             |
| `bun auth:generate` | Regenerate the Better Auth Drizzle schema            |

## 🧱 Core concepts

### 1. Business logic — pure, dependency-injected functions

Located at `src/modules/<name>/<name>.ts`. Each is a curried function that takes its
dependencies, then its input, and returns a `ResultAsync`. No I/O is hard-coded, so
the logic is pure and easy to test.

```ts
import type { DependencyError } from '@errors'
import type { ResultAsync } from 'neverthrow'

type Dependencies = {
  generateId: () => string
  saveName: (id: string, name: string) => ResultAsync<void, DependencyError>
}

type Input = Readonly<{ name: string; age: number }>
type Output = ResultAsync<{ message: string }, DependencyError>

export const helloWorld =
  (dependencies: Dependencies) =>
  (input: Input): Output =>
    dependencies.saveName(dependencies.generateId(), input.name).map(() => ({
      message: `Hello ${input.name}, you are ${input.age} years old`
    }))
```

### 2. Handlers — validation, dependency wiring, response

Located at `src/modules/<name>/<name>.handler.ts`. Handlers validate the request,
inject real dependencies (the database, etc.), and hand the `Result` to
`appResponse`, which maps it to a typed JSON response.

```ts
import { appResponse } from '@appResponse'
import { factory } from '@factory'
import { queryValidator } from '@validator'

export const helloWorldHandler = factory.createHandlers(queryValidator(schema), async (c) => {
  const input = c.req.valid('query')
  return appResponse(c, await helloWorld(dependencies)(input))
})
```

> `appResponse(c, result)` is called **directly** (not via `c.var`) so Hono's RPC
> client can infer the concrete success type for each route.

### 3. Typed errors

All failures are values, not exceptions. `src/types/errors.ts` defines the union:

```ts
type AppError = DependencyError | ValidationError | InternalError
```

`appResponse` exhaustively maps each variant to a status code
(`ValidationError` → 400, `DependencyError` / `InternalError` → 500) and logs it.

### 4. Path aliases

Configured in the root `tsconfig.json`:

| Alias           | Points to                          |
| --------------- | ---------------------------------- |
| `@factory`      | `src/factory.ts`                   |
| `@appResponse`  | `src/lib/app-response.ts`          |
| `@validator`    | `src/middleware/validator.ts`      |
| `@errors`       | `src/types/errors.ts`              |
| `@database`     | `src/database.ts`                  |
| `@environment`  | `src/types/environment.ts`         |
| `@dbSchema`     | `drizzle/schema/index.ts`          |
| `@testHelpers`  | `src/lib/test.ts`                  |

## 🧪 Testing

Because business logic is dependency-injected, tests mock the dependencies and assert
on the returned `Result` — no database required. Type-safe mock helpers live in
`src/lib/test.ts` (`MockDependencies` / `MockInput`).

```ts
import { describe, expect, mock, test } from 'bun:test'
import type { MockDependencies, MockInput } from '@testHelpers'
import { okAsync } from 'neverthrow'

import { helloWorld } from './hello-world'

const mockDependencies: MockDependencies<typeof helloWorld> = (overrides) => ({
  generateId: mock(() => 'fixed-id'),
  saveName: mock(() => okAsync(undefined)),
  ...overrides
})
```

Run with `bun test`.

## 🔒 Authentication

[Better Auth](https://www.better-auth.com/) is configured in `auth.config.ts` with the
Drizzle adapter (`provider: 'pg'`) and email + password enabled. Its routes are mounted
under `/api/auth/*` in `src/index.ts`, and its tables live in `drizzle/schema/auth.ts`.

- Regenerate the auth schema after upgrading Better Auth: `bun auth:generate`
- `trustedOrigins` is driven by the `TRUSTED_ORIGINS` env var (also used by CORS).

## 🗄️ Database & migrations

Schema is defined in `drizzle/schema/` (e.g. `helloWorld` plus the Better Auth tables).
Shared column helpers (`createdAt` / `updatedAt`) live in `drizzle/utils/columns.ts`.

```sh
bun db:generate   # diff the schema → new SQL migration in drizzle/migrations
bun db:migrate    # apply pending migrations
```

`bun dev` runs `src/migrate.ts` automatically before starting the server.
