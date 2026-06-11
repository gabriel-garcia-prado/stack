# syntax=docker/dockerfile:1
# Build context is the monorepo root: `docker build -f apps/api/Dockerfile .`

# --- build web ---
FROM oven/bun:1.3 AS web-build
WORKDIR /app
COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN bun install --frozen-lockfile
COPY . .
WORKDIR /app/apps/web
RUN bun run build

# --- install runtime dependencies (cached unless a package.json/lockfile changes) ---
FROM oven/bun:1.3 AS install
WORKDIR /app
COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN bun install --frozen-lockfile --production

# --- runtime image ---
FROM oven/bun:1.3 AS release
ENV NODE_ENV=production
WORKDIR /app
COPY --from=install /app/node_modules ./node_modules
COPY package.json tsconfig.json ./
COPY apps/api ./apps/api
COPY --from=web-build /app/apps/web/dist ./apps/api/public
WORKDIR /app/apps/api
# Drop root privileges; the oven/bun image ships a non-root `bun` user.
USER bun
EXPOSE 3000
# Apply pending migrations, then start the server.
CMD ["sh", "-c", "bun run drizzle/utils/migrate.ts && bun run src/index.ts"]
