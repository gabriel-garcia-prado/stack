# Full-Stack TypeScript Monorepo

<div align="center">

A modern, vendor-neutral full-stack starter built with **Bun**, **Hono**, and **React**.

[![Bun](https://img.shields.io/badge/Bun-1-black)](https://bun.sh/)
[![Hono](https://img.shields.io/badge/Hono-4-blue)](https://hono.dev/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6)](https://www.typescriptlang.org/)
[![Biome](https://img.shields.io/badge/Biome-2-60a5fa)](https://biomejs.dev/)
[![Docker](https://img.shields.io/badge/Docker-portable-2496ed)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)

</div>

## 📚 Overview

A complete full-stack application designed to start new projects fast, with no cloud
vendor lock-in:

- 🌐 **React frontend** — Vite, TanStack Router/Query/Form, Tailwind v4, shadcn/ui
- 🚀 **Hono API on Bun** — end-to-end type-safe RPC client, Zod validation
- 🧩 **Typed errors with [neverthrow](https://github.com/supermacro/neverthrow)** (`Result` / `ResultAsync`)
- 💾 **PostgreSQL** via **Drizzle ORM** (on Bun's native `bun:sql` driver)
- 🔒 **Authentication** with **Better Auth** (email + password, cookie sessions)
- 🧹 One fast tool for lint + format: **Biome**
- 🐳 Ships as a single **Docker** image (API serves the built web app) — deploy anywhere

## 📦 Project Structure

```
.
├── apps/
│   ├── web/              # React frontend (Vite)
│   └── api/              # Hono backend API (Bun) — also serves the web build
├── biome.json           # Lint + format config
├── docker-compose.yml   # Local + portable production stack
├── package.json         # Bun workspaces + root scripts
└── tsconfig.json        # Shared TS config + path aliases
```

This is a [Bun workspaces](https://bun.sh/docs/install/workspaces) monorepo. The web app
imports the API's `AppType` (`@stack/api`) to get a fully typed RPC client at compile time.

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (>= 1.0)
- [Docker](https://www.docker.com/) (for PostgreSQL and deployment)

> **Note:** This project is **Bun-only** — all tooling runs on Bun, not Node.js.

### 1. Install dependencies

```sh
bun install
```

### 2. Configure environment

```sh
cp .env.example .env                  # Postgres password + auth secret (Docker Compose)
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Generate a strong auth secret with `openssl rand -base64 32`.

### 3. Start dev servers

```sh
bun dev
```

`bun dev` starts Postgres (Docker), applies pending migrations, then runs the API
and web with hot reload.

Visit:

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:3000](http://localhost:3000)

## ⚙️ Scripts

| Command           | Description                                  |
| ----------------- | -------------------------------------------- |
| `bun dev`         | Start Postgres + migrate + run apps (watch)  |
| `bun db:up`       | Start the Postgres container                 |
| `bun db:down`     | Stop the Postgres container                  |
| `bun db:generate` | Generate a migration from schema changes     |
| `bun db:migrate`  | Apply pending migrations                     |
| `bun typecheck`   | Type-check all packages (no emit)            |
| `bun lint`        | Lint + format check (Biome)                  |
| `bun lint:fix`    | Apply safe lint fixes + format               |
| `bun format`      | Format only                                  |
| `bun test`        | Run tests across all packages                |
| `bun check`       | typecheck + lint + test                      |
| `bun up`          | Build & run the whole stack via Docker       |
| `bun down`        | Stop the Docker stack                        |

## 🔑 Environment variables

The root `.env` feeds **Docker Compose**; each app has its own `.env` for local dev.

| Variable                     | Used by        | Description                                  |
| ---------------------------- | -------------- | -------------------------------------------- |
| `POSTGRES_PASSWORD`          | compose        | Postgres password (required)                 |
| `BETTER_AUTH_SECRET`         | compose, api   | Secret for signing sessions (required)       |
| `DATABASE_CONNECTION_STRING` | api            | PostgreSQL connection URL                    |
| `BETTER_AUTH_URL`            | api            | Auth server base URL (default `:3000`)       |
| `TRUSTED_ORIGINS`            | api            | Comma-separated CORS origins (default `:5173`) |
| `VITE_APP_API_URL`           | web            | API base URL for the RPC + auth client       |

## 🐳 Run the whole stack locally

```sh
bun up   # builds the image, starts postgres + api (which also serves the web build)
```

- App (web + API): [http://localhost:3000](http://localhost:3000)

## 🏗️ Deployment (no vendor lock-in)

Everything is a standard Docker image, so it runs identically on Fly.io, Railway,
Render, a VPS, AWS ECS, Google Cloud Run, or your own machine. The API container
serves the compiled React app from `./public` with an SPA fallback, so a single
image hosts the entire stack.

```sh
bun up     # build images + run postgres + api
bun down   # stop the stack
```

## 🧭 Stack decisions

| Layer        | Choice                                    |
| ------------ | ----------------------------------------- |
| Runtime      | Bun                                       |
| API          | Hono + Zod                                |
| Typed errors | neverthrow (`Result` / `ResultAsync`)     |
| ORM          | Drizzle + `bun:sql`                       |
| Auth         | Better Auth (email + password)            |
| Frontend     | React 19 + Vite + TanStack + Tailwind 4   |
| Lint/format  | Biome                                     |
| Packaging    | Docker                                    |

See [`apps/api/README.md`](apps/api/README.md) and [`apps/web/README.md`](apps/web/README.md)
for per-app details.
