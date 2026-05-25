# DevMind Backend API

Fastify API yang menjadi orchestrator antara MCP server, smart contract Sui, Walrus storage, dan dashboard.

## Setup

### 1. Env vars

Copy `.env.example` ke root (`E:\devmind\.env`), lalu isi:

| Variable | Source |
|---|---|
| `DATABASE_URL` | Supabase project → Settings → Database → Connection string (gunakan **session pooler** untuk Prisma) |
| `REDIS_URL` | Upstash Redis → Details → REST URL atau redis:// |
| `JWT_SECRET` | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `SUI_MASTER_WALLET_PHRASE` | Output `sui client new-address ed25519` |
| `WORKSPACE_REGISTRY_PACKAGE_ID` | Hasil `sui client publish` (Package ID) |
| `SEAL_POLICY_PACKAGE_ID` | Sama dengan workspace package (1 publish) |
| `SEAL_POLICY_OBJECT_ID` | Shared SealPolicy object ID dari publish output |
| `OPENAI_API_KEY` | https://platform.openai.com/api-keys |
| `GITHUB_WEBHOOK_SECRET` | Random string, set juga di GitHub webhook settings |

### 2. Prisma migration

```
pnpm prisma:generate
pnpm prisma:migrate
```

Migration akan otomatis enable `vector` extension (untuk pgvector).

### 3. Run

```
pnpm dev    # development with hot reload
pnpm build && pnpm start   # production
```

Health check: `GET http://localhost:3001/health`

## Endpoints

### Auth
- `POST /auth/challenge` — `{ suiAddress }` → returns message to sign
- `POST /auth/verify` — `{ suiAddress, signature, displayName? }` → returns JWT
- `GET /auth/me` — current user info (auth required)

### Workspaces (auth required)
- `GET /workspaces` — list workspaces user belongs to
- `POST /workspaces` — `{ name }` → creates on-chain + DB
- `GET /workspaces/:id` — details + members
- `POST /workspaces/:id/members` — `{ suiAddress }` → invite (owner only)
- `DELETE /workspaces/:id/members/:userId` — remove (owner only)

### Memories (auth required)
- `POST /memories` — `{ workspaceId, content, type, privacy?, tags? }` → enqueue pending
- `POST /memories/search` — `{ workspaceId, query, limit? }` → semantic search
- `GET /memories?workspaceId=...` — list approved
- `GET /memories/:id` — single

### Pending Queue (auth required)
- `GET /pending?workspaceId=...` — list pending
- `POST /pending/:id/approve` — `{ editedContent?, editedTags? }` → encrypt + Walrus + DB
- `POST /pending/:id/reject` — discard

### Artifacts (auth required)
- `POST /artifacts` — `{ workspaceId, filename, contentBase64, type, relatedMemoryId? }`
- `GET /artifacts?workspaceId=...` — list
- `GET /artifacts/:id` — download (returns base64)

### GitHub Webhook
- `POST /webhook/github` — public, validates HMAC signature
- `POST /webhook/github/ingest` — auth, manual ingestion for testing

## Architecture

```
lib/         env config, error classes
plugins/     Fastify decorators (prisma, redis, auth, error-handler)
services/    business logic (sui, walrus, seal, embedding, llm, pending-queue)
routes/      HTTP handlers (auth, workspaces, memories, pending, artifacts, webhook)
```
