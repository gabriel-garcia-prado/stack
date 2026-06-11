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
| `POSTGRES_PASSWORD`          | Postgres password; assembled into the connection URL (must match the root `.env`) | `my_password`           |
| `BETTER_AUTH_SECRET`         | Secret for signing sessions | `openssl rand -base64 32`                                |
| `BETTER_AUTH_URL`            | Auth server base URL      | `http://localhost:3000`                                    |
| `TRUSTED_ORIGINS`            | Extra origins trusted by Better Auth (comma-separated, optional) | `http://localhost:5173`             |
| `DATABASE_CONNECTION_STRING` | Full connection URL; overrides the assembled one, optional | `postgresql://user:pass@host:5432/db`        |

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
│   ├── modules/              # Feature modules (auth, hello-world, me)
│   │   └── <name>/
│   │       ├── <name>.ts          # Pure business logic (DI + neverthrow)
│   │       ├── <name>.handler.ts  # HTTP wiring (sub-app: validation + response)
│   │       └── <name>.test.ts     # Unit tests (mocked dependencies)
│   ├── middleware/           # logger, app-response, validator, require-auth
│   ├── lib/                  # test helpers
│   ├── types/                # environment (Zod), errors (AppError union)
│   ├── database.ts           # Drizzle client (bun:sql)
│   ├── factory.ts            # Hono factory + typed context (logger, appResponse)
│   ├── index.ts              # App entry point + route wiring
│   └── index.test.ts         # Integration tests + RPC type guardrails
├── drizzle/
│   ├── migrations/           # Generated SQL migrations
│   ├── schema/               # Table definitions (auth, hello-world)
│   └── utils/                # Shared column helpers, auth schema config, migrate runner
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
| `bun db:seed`       | Seed dev data (idempotent; also runs in `bun dev`)   |
| `bun auth:generate` | Regenerate the Better Auth Drizzle schema            |

## 🧱 Core concepts

### 1. Business logic — pure, dependency-injected functions

Located at `src/modules/<name>/<name>.ts`. Each is a curried function that takes its
dependencies, then its input, and returns a `ResultAsync`. No I/O is hard-coded, so
the logic is pure and easy to test.

```ts
import type { ResultAsync } from 'neverthrow'

import type { DependencyError } from '#errors'

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

Located at `src/modules/<name>/<name>.handler.ts`. Each module exports a Hono
sub-app that validates the request, injects real dependencies (the database,
etc.), and hands the `Result` to `c.var.appResponse`, which maps it to a typed
JSON response. The sub-app is mounted in `src/index.ts` with
`.route('/api/<name>', <name>Routes)`.

```ts
import { factory } from '#factory'
import { validator } from '#validator'

export const helloWorldRoutes = factory
  .createApp()
  .post('/', validator('json', schema), async (c) =>
    c.var.appResponse(await helloWorld(dependencies)(c.req.valid('json')))
  )
```

> `validator(...)` returns zValidator's middleware unwrapped, so the validated
> input types and the success body type both flow into the RPC client. Never
> wrap it in `createMiddleware` — that erases the route's type information.
> Compile-time assertions in `src/index.test.ts` fail the build if this
> inference ever breaks.

### 3. Typed errors

All failures are values, not exceptions. `src/types/errors.ts` defines the union:

```ts
type AppError = DependencyError | ValidationError | InternalError
```

`appResponse` exhaustively maps each variant to a status code
(`ValidationError` → 400, `DependencyError` / `InternalError` → 500) and logs it.

### 4. Protected routes

`src/middleware/require-auth.ts` validates the session cookie server-side via
`auth.api.getSession` and returns 401 otherwise; downstream handlers read the
user from `c.var.user`. See `src/modules/me/me.handler.ts` for an example —
any client-side gating in the web app is UX only, the API is the real guard.

### 5. Path aliases (package subpath imports)

The modules everything imports get a `#`-prefixed alias, declared in the `imports`
field of this package's `package.json` — a Node/Bun standard that Bun, tsc, esbuild
(drizzle-kit, the Better Auth CLI) and editors all resolve natively, with no
tsconfig `paths`:

| Alias            | Points to                          |
| ---------------- | ---------------------------------- |
| `#factory`       | `src/factory.ts`                   |
| `#errors`        | `src/types/errors.ts`              |
| `#environment`   | `src/types/environment.ts`         |
| `#database`      | `src/database.ts`                  |
| `#validator`     | `src/middleware/validator.ts`      |
| `#require-auth`  | `src/middleware/require-auth.ts`   |
| `#test`          | `src/lib/test.ts`                  |

`#database` also re-exports every table from `drizzle/schema`, so the client and the
schema come from a single import: `import { database, helloWorld } from '#database'`.

Because they're scoped to this package, they also resolve correctly when the web
app typechecks `AppType` through `@stack/api`, and the web app cannot import them —
no cross-app leaks. The aliases are exactly the infrastructure every new module
exercises (factory + validator in handlers, errors in business logic, require-auth
on protected routes, test helpers in tests); feature modules like auth don't get
one — import them relatively.

## 🧪 Testing

Because business logic is dependency-injected, tests mock the dependencies and assert
on the returned `Result` — no database required. Type-safe mock helpers live in
`src/lib/test.ts` (`MockDependencies` / `MockInput`).

```ts
import { describe, expect, mock, test } from 'bun:test'
import { okAsync } from 'neverthrow'

import type { MockDependencies, MockInput } from '#test'

import { helloWorld } from './hello-world'

const mockDependencies: MockDependencies<typeof helloWorld> = (overrides) => ({
  generateId: mock(() => 'fixed-id'),
  saveName: mock(() => okAsync(undefined)),
  ...overrides
})
```

Run with `bun test`. `src/index.test.ts` adds integration tests that exercise the
real middleware chain through `app.request(...)` (no database needed), plus
compile-time assertions that the RPC client's request/response types stay inferred.

## 🔒 Authentication

[Better Auth](https://www.better-auth.com/) is configured in `auth.config.ts` with the
Drizzle adapter (`provider: 'pg'`) and email + password enabled. Its routes are mounted
under `/api/auth/*` in `src/index.ts`, and its tables live in `drizzle/schema/auth.ts`.

- Regenerate the auth schema after upgrading Better Auth: `bun auth:generate`
- `secret`, `baseURL` and `trustedOrigins` come from the validated environment
  (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `TRUSTED_ORIGINS`).
- In dev, `drizzle/utils/seed.ts` creates a known user through Better Auth's own
  API (`dev@example.com` / `password1234`) so you can sign in immediately. It is
  idempotent, refuses to run with `NODE_ENV=production`, and is not part of the
  production container CMD.

## 🗄️ Database & migrations

Schema is defined in `drizzle/schema/` (e.g. `hello_world` plus the Better Auth tables).
Column names derive from the TS property names via `casing: 'snake_case'`. Shared
column helpers (`createdAt` / `updatedAt`) live in `drizzle/utils/columns.ts`.

```sh
bun db:generate   # diff the schema → new SQL migration in drizzle/migrations
bun db:migrate    # apply pending migrations
```

`bun dev` runs `drizzle/utils/migrate.ts` automatically before starting the server.
