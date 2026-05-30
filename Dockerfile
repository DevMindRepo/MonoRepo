# DevMind backend — production Dockerfile for Railway / Fly / any container host.
#
# Builds: TypeScript backend with Prisma client + workspace deps installed.
# Runs:   compiled JS from backend/dist with the long-running incident worker.

# ───────────── Build stage ─────────────
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate

WORKDIR /app

# Copy workspace manifests first (better Docker cache)
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY backend/package.json backend/
COPY packages/shared/package.json packages/shared/

# Install only what the backend needs (and its workspace deps)
RUN pnpm install --filter @devmind/api... --frozen-lockfile

# Copy source (including root tsconfig.base.json which backend's tsconfig extends)
COPY tsconfig.base.json ./
COPY packages/shared packages/shared
COPY backend backend

# Build shared first (backend imports compiled dist/index.js from @devmind/shared)
WORKDIR /app/packages/shared
RUN pnpm run build

# Build backend
WORKDIR /app/backend
RUN pnpm run build

# ───────────── Runtime stage ─────────────
FROM node:20-alpine
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate

WORKDIR /app

# Copy installed deps + built code + Prisma client
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend/package.json ./backend/package.json
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/packages/shared ./packages/shared

ENV NODE_ENV=production
EXPOSE 3001

WORKDIR /app/backend
CMD ["node", "dist/index.js"]
