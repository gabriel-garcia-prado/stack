# @stack/web

<div align="center">

A modern web app built with **React 19**, **Vite**, **TanStack**, and **Tailwind CSS**.

[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38BDF8)](https://tailwindcss.com/)
[![TanStack](https://img.shields.io/badge/TanStack-Router%20·%20Query%20·%20Form-ff4154)](https://tanstack.com/)

</div>

## 📚 Overview

The frontend is a React 19 + Vite app. It uses
[TanStack Router](https://tanstack.com/router/latest) for type-safe file-based routing,
[TanStack Query](https://tanstack.com/query/latest) for data fetching/caching,
[TanStack Form](https://tanstack.com/form/latest) for forms, and
[Tailwind CSS v4](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/)
components for styling.

It talks to [`@stack/api`](../api/README.md) through a **fully type-safe Hono RPC
client** — the API's `AppType` is imported at build time, so endpoints, params, and
response shapes are all checked by the compiler. Auth is handled by the Better Auth
React client.

## ✨ Features

- ⚡️ Fast dev/build with [Vite](https://vitejs.dev/)
- ⚛️ React 19 (StrictMode)
- 🧭 Type-safe, file-based routing (TanStack Router)
- 🔄 Data fetching & caching (TanStack Query)
- 📝 Type-safe forms (TanStack Form)
- 🔗 End-to-end type-safe API calls (Hono RPC client)
- 🔒 Auth state via the Better Auth React client
- 🎨 Tailwind v4 + shadcn/ui, with light/dark theme support
- 🧯 Route-level error boundary + skeleton loading states

## 🚀 Quick Start

> Usually you'll run the whole stack from the repo root with `bun dev`. The steps below
> are for working on the web app in isolation (it needs the API running).

### Prerequisites

- [Bun](https://bun.sh/) (>= 1.0)
- The API running at `http://localhost:3000` (`bun dev` from the repo root)

### 1. Install dependencies (from the repo root)

```sh
bun install
```

### 2. Configure environment

```sh
cp .env.example .env
```

| Variable           | Description                              | Default                 |
| ------------------ | ---------------------------------------- | ----------------------- |
| `VITE_APP_API_URL` | API base URL (used by the RPC + auth client) | `http://localhost:3000` |

### 3. Start the dev server

```sh
bun dev
```

Visit [http://localhost:5173](http://localhost:5173).

## 📦 Project Structure

```
apps/web/
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui primitives (button, card, skeleton, …)
│   │   ├── api-client-provider.tsx  # Hono RPC client context + useApiClient()
│   │   ├── error-boundary.tsx     # Route-level error UI
│   │   ├── login-form.tsx         # TanStack Form login
│   │   ├── theme-provider.tsx     # Light/dark theme context
│   │   └── mode-toggle.tsx        # Theme switcher
│   ├── routes/                    # File-based routes (TanStack Router)
│   │   ├── __root.tsx             # Root layout + errorComponent
│   │   ├── index.lazy.tsx         # Home ("/")
│   │   ├── _auth.tsx              # Auth-guarded layout
│   │   └── _auth.dashboard.tsx    # /dashboard (protected)
│   ├── lib/                       # auth-client, utils (cn)
│   ├── routeTree.gen.ts           # Auto-generated route tree (do not edit)
│   ├── main.tsx                   # App entry: providers + router
│   └── main.css                   # Tailwind + theme tokens
├── public/                        # Static assets
├── components.json                # shadcn/ui config
└── vite.config.ts
```

## 🛠️ Scripts

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `bun dev`       | Start the Vite dev server            |
| `bun build`     | Production build (Vite)              |
| `bun lint`      | Lint + format check (Biome)          |
| `bun typecheck` | Type-check with `tsc --noEmit`       |
| `bun test`      | Run tests (`bun test`)               |

## 🧱 Core concepts

### Type-safe API calls (Hono RPC)

`main.tsx` creates the client with `hc<AppType>(...)` and provides it via context.
Components read it with `useApiClient()` and call endpoints as typed methods —
no manual types, no codegen.

```tsx
import { useMutation } from '@tanstack/react-query'

import { useApiClient } from '@/components/api-client-provider'

const client = useApiClient()
const mutation = useMutation({
  mutationFn: (data: { name: string; age: string }) =>
    client['hello-world'].$get({ query: data }).then((r) => r.json())
})
```

### Routing

File-based via TanStack Router. The router plugin generates `routeTree.gen.ts` from the
`routes/` folder (don't edit it by hand). `_auth.tsx` is a layout route that guards its
children behind a Better Auth session, rendering `LoginForm` when there's no valid
session and a skeleton while the session is loading.

### Authentication

`src/lib/auth-client.ts` exposes the Better Auth React client:

```ts
import { client } from '@/lib/auth-client'

const { data, isPending } = client.useSession()
// client.signIn.email(...), client.signOut(), ...
```

### Styling & components

Tailwind v4 (via `@tailwindcss/vite`) with theme tokens in `main.css`. UI primitives
come from [shadcn/ui](https://ui.shadcn.com/) (Radix under the hood) in
`components/ui/`, configured by `components.json`. The `cn()` helper in `lib/utils.ts`
merges class names (`clsx` + `tailwind-merge`).

### Error & loading states

A route-level error boundary (`components/error-boundary.tsx`) is wired into the root
route via `errorComponent`, so render/loader errors show a friendly recovery UI instead
of a blank page. Loading states use the `Skeleton` primitive and TanStack Query's
pending flags.

## 🧹 Linting

This app is linted and formatted with **Biome** (`bun lint` / `bun lint:fix` from the
repo root). There is no ESLint config.
