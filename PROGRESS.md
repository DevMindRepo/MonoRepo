# DevMind — Progress & Handover

> Snapshot tanggal **2026-05-25**. Dokumen ini untuk sharing progress ke tim dan resume kerja di sesi berikutnya.

DevMind adalah persistent memory layer untuk AI coding assistant (Claude Code, Cursor) — memory disimpan permanen di **Walrus**, di-encrypt dengan **Seal**, workspace identity di-anchor ke **Sui smart contract Move**. Target: submission Walrus Hackathon (3 minggu MVP).

---

## TL;DR Status

| Layer | Status |
|---|---|
| Smart Contract (Sui Move) | ✅ Deployed testnet |
| Backend API (Fastify) | ✅ Running locally `:3001` |
| MCP Server | ✅ Built, MCP Inspector tested |
| Frontend Dashboard (Next.js 16) | ✅ All 10 pages wired to real API |
| Database (Supabase + pgvector) | ✅ Schema synced |
| Wallet auth E2E | ✅ Verified (login + workspace create) |
| End-to-end MCP flow | ⏳ Belum di-test full path |
| PR Reviewer Agent (Mastra) | ❌ Belum dibangun |
| GitHub App + webhook real | ❌ Belum dibangun |

---

## Arsitektur Singkat

```
┌──────────────┐   MCP stdio    ┌──────────────┐
│ Claude Code  │ ─────────────▶ │  MCP Server  │
│ / Cursor     │                │ (devmind)    │
└──────────────┘                └──────┬───────┘
                                       │ HTTP + dm_sk_* token
                                       ▼
┌─────────────────────────────────────────────────────┐
│                  Backend (Fastify :3001)             │
│  • Dual auth (JWT for web, dm_sk_* for MCP)         │
│  • 18+ endpoints                                     │
│  • Pending queue → approval → Walrus upload         │
└──────┬──────────────────┬─────────────────┬─────────┘
       │                  │                 │
       ▼                  ▼                 ▼
  Supabase           Upstash           Walrus + Seal
  (Postgres +        (Redis pending     (encrypted blob
   pgvector 768d)    queue 24h TTL)     storage)

       ▲
       │ react-query + axios
       │
┌──────┴─────────────────────────────────┐
│  Frontend (Next 16 + Tailwind 4)       │
│  10 pages: /auth, /onboarding,         │
│  /dashboard, /memories, /approval-     │
│  queue, /connect, /artifacts,          │
│  /agent-timeline, /settings            │
└────────────────────────────────────────┘

Workspace identity anchored on Sui testnet:
- Package: 0xfd29d3cf0786abbdc5eecb70bb017492500c5c15817b34b5ac1d3c8cfbf99f4e
```

---

## Tech Stack (final)

| Layer | Choice | Catatan penting |
|---|---|---|
| Frontend | Next.js 16.2.6 + React 19.2 + Tailwind 4 | Banyak breaking changes dari Next 14/15. Tailwind 4 pakai CSS-based config, no `tailwind.config.js` |
| State | Zustand (persist) + react-query | Hydration-safe via `hasHydrated` flag |
| Wallet | `@mysten/dapp-kit ^0.18.0` + `@mysten/sui ^2.17.0` | Sui SDK v2 rename `SuiClient` → `SuiJsonRpcClient`. Workaround di providers.tsx pakai raw fullnode URL |
| Backend | Fastify 5 + Prisma 6 + Zod | Dotenv loaded dari `../.env` (monorepo root) |
| Database | Supabase (managed) + pgvector | `DATABASE_URL` (pooled 6543) + `DIRECT_URL` (5432). Pakai `prisma db push` BUKAN `migrate dev` |
| Redis | Upstash | URL `rediss://` (TLS) |
| LLM/Embedding | Gemini (free tier) | `gemini-2.5-flash` untuk chat, `gemini-embedding-001` 768 dim |
| Encryption | `@mysten/seal ^1.1.3` | `getAllowlistedKeyServers` removed, testnet key server IDs hardcoded di `packages/seal-client` |
| Storage | `@mysten/walrus` (via memwal-client) | Master wallet pakai testnet WAL |
| Smart contract | Sui Move 2024.beta | edition 2024 syntax (`public struct`, `ctx.sender()`) |
| Auth | JWT 7d (web) + `dm_sk_*` token (MCP) | Dual-mode verifier di `backend/src/plugins/auth.ts` |

---

## Deployed IDs (Sui testnet)

```
Package ID:      0xfd29d3cf0786abbdc5eecb70bb017492500c5c15817b34b5ac1d3c8cfbf99f4e
SealPolicy:      0x619c24c7d2728a9885ba3a70bf02d40e81ae18d7875e9a427f72b95593b501dd  (Shared)
AdminCap:        0x12c76eddcb5b7404535587beb33b21b8b739caa2dfb8de93af7857c1946b24e9  (owned by deployer)
Deployer wallet: 0xdffd5fc26f13e8d2b71e3539068ab52ed78afbd34081857cd843db4b13c04dd0
```

Sample memory blob (sebelum frontend wiring): `ZE1nG7RoifhGysCCBW2qoiagG1l9NTGv8LkgFP581dc`

Smart contract repo (separate): https://github.com/DevMindRepo/smartcontract
Frontend repo (cloned ke monorepo): https://github.com/DevMindRepo/frontend

---

## Monorepo Layout

```
E:\devmind\
├── smart_contract/      ✅ deployed testnet, separate GitHub repo
├── backend/             ✅ Fastify :3001, dual auth, 18+ endpoints
├── mcp-server/          ✅ built, 4 tools (save_memory/get/share/save_artifact)
├── packages/
│   ├── shared/          shared types
│   ├── memwal-client/   Walrus wrapper
│   └── seal-client/     Seal encrypt/decrypt
├── frontend/            ✅ 10 pages wired to real API (Next 16, @devmind/web)
│   ├── app/
│   │   ├── auth/page.tsx               wallet login
│   │   ├── onboarding/page.tsx         workspace creation
│   │   └── (dashboard)/
│   │       ├── dashboard/              overview + stats
│   │       ├── memories/               browser + semantic search
│   │       ├── approval-queue/         approve/reject pending
│   │       ├── connect/                generate dm_sk_* token
│   │       ├── artifacts/              file downloads
│   │       ├── agent-timeline/         agent run history
│   │       └── settings/               workspace, members, webhooks
│   ├── components/
│   │   ├── providers.tsx               QueryClient + Sui + WalletProvider + Toaster
│   │   └── app/auth-guard.tsx          hydration-safe redirect
│   └── lib/
│       ├── api.ts                      axios + interceptor (auto-clear on 401)
│       ├── api-endpoints.ts            typed wrappers
│       ├── api-types.ts                response types
│       ├── auth.ts                     signAndLogin helper
│       ├── env.ts                      zod-validated public env
│       └── store/auth.ts               zustand + localStorage persist
├── agent/               ⏳ stub — Mastra PR Reviewer belum dibangun
└── .env                 backend secrets (DO NOT COMMIT)
```

**Workspaces (pnpm)**: top-level dirs adalah workspaces (BUKAN `apps/*`). Frontend punya nama package `@devmind/web`.

---

## Backend Endpoints

**Public / auth:**
- `GET /health`
- `POST /auth/challenge` — minta nonce untuk wallet sign
- `POST /auth/verify` — verify signature → JWT
- `GET /auth/me` — current user

**Authenticated (JWT atau `dm_sk_*`):**
- `GET/POST /workspaces`, `GET /workspaces/:id`
- `POST/DELETE /workspaces/:id/members`
- `GET/POST /memories`, `GET /memories/:id`
- `POST /memories/search` — semantic search (Gemini embed → pgvector)
- `GET /pending`, `POST /pending/:id/approve`, `POST /pending/:id/reject`
- `GET/POST /artifacts`, `GET /artifacts/:id` (returns base64)
- `GET/POST/DELETE /api-tokens` — manage `dm_sk_*` tokens
- `GET /stats`, `GET /activity` — dashboard stats
- `GET/POST/DELETE/PATCH /workspaces/:id/webhooks`
- `GET/POST/PATCH /agent-runs`, `GET /agent-runs/:id`

**Public webhook (HMAC verified, no auth header):**
- `POST /webhook/github` — per-workspace secret support

---

## Cara Restart / Resume Kerja

Buka 3 terminal di `E:\devmind\`:

```bash
# Terminal 1 — backend
cd backend
pnpm dev
# Tunggu: "Backend listening on :3001"

# Terminal 2 — frontend
pnpm --filter @devmind/web dev
# Tunggu: "Ready in XXXms" di http://localhost:3000

# Terminal 3 — kalau perlu rebuild MCP
cd mcp-server
pnpm build
```

Buka `http://localhost:3000` → connect Sui wallet (Suiet/Sui Wallet extension, network **testnet**) → sign challenge → auto-redirect ke `/onboarding` (kalau belum punya workspace) atau `/dashboard`.

---

## Sisa Pekerjaan — Yang Belum Dikerjakan

### 🔥 P0 — E2E test flow (1–2 jam)

Belum diverifikasi end-to-end. Langkah:

1. **Generate API token**
   - Buka `/connect` di dashboard
   - Input nama token (misal "My laptop") → klik **Generate**
   - Copy token `dm_sk_xxxx...` (cuma ditampilkan sekali!)

2. **Wire ke Claude Code (sesi terpisah)**
   - Buka `C:\Users\<USER>\.claude.json` (atau `~/.claude.json` di Linux/Mac)
   - Paste config yang di-copy dari `/connect` tab Claude Code
   - Config formatnya:
     ```json
     {
       "mcpServers": {
         "devmind": {
           "command": "node",
           "args": ["E:/devmind/mcp-server/dist/index.js"],
           "env": {
             "DEVMIND_API_BASE_URL": "http://localhost:3001",
             "DEVMIND_API_TOKEN": "dm_sk_xxxx...",
             "DEVMIND_WORKSPACE_ID": "<workspace-id>"
           }
         }
       }
     }
     ```
   - Restart sesi Claude Code

3. **Test save_memory**
   - Di sesi Claude Code itu, minta: *"Save a memory: kita decide pakai pgvector untuk semantic search"*
   - Claude akan panggil `save_memory` MCP tool
   - Verify: response include `pending_id`, status "pending_approval"

4. **Approve di dashboard**
   - Buka `/approval-queue`
   - Klik **Approve** pada entry yang baru muncul
   - Backend akan: encrypt via Seal → upload Walrus → save metadata + embedding ke Postgres

5. **Test get_memory**
   - Di Claude Code, minta: *"Get memory tentang pgvector"*
   - Verify: content kembali (sudah ter-decrypt)

6. **Test save_artifact**
   - Minta: *"Save this report as artifact"*
   - Verify muncul di `/artifacts`, bisa di-download

### 🟡 P1 — PR Reviewer Agent (Mastra, 4–6 jam)

Workspace `agent/` masih stub. Yang perlu dibuat:

- Setup Mastra framework di `agent/`
- Agent definition: read PR diff (via Octokit) → query DevMind memory (`get_memory`) → reasoning (Gemini) → post review comment (via Octokit)
- Wire ke backend `POST /agent-runs` untuk log execution timeline
- Test trigger via webhook handler atau manual `agent.run({prNumber, prUrl})`

File yang perlu dibuat:
- `agent/src/index.ts` — Mastra agent definition
- `agent/src/tools/devmind-memory.ts` — wrapper untuk get_memory API
- `agent/src/tools/github-review.ts` — wrapper untuk Octokit createReview
- `agent/package.json` — dependencies (`@mastra/core`, `octokit`, `axios`)

### 🟡 P1 — GitHub App + real webhook (1–2 jam)

Handler & per-workspace secret support sudah ada di `backend/src/routes/webhook/github.ts`. Yang belum:

- Buat GitHub App di https://github.com/settings/apps
- Set webhook URL ke `https://<ngrok-or-deployed-backend>/webhook/github`
- Install App ke test repo
- Verify webhook delivery di `/settings` (lastDeliveryAt updated)
- Connect ke PR Reviewer Agent trigger

### 🟢 P2 — Demo prep (3–4 jam)

- **Seed data** — sample memories, fake agent runs, artifacts biar dashboard ga kosong saat demo
- **README.md** — setup instructions, arsitektur diagram, demo flow
- **Demo video 3 menit** — script 5 demo stories (lihat PLAN.md "Demo Stories")
- **Hackathon submission** — submit ke Walrus track

### 🟢 P3 — Polish (optional)

- Active-workspace switcher di Topbar (sekarang single workspace cukup)
- Form validation di onboarding/connect
- Type sharing FE↔BE via `@devmind/shared` (sekarang FE punya `api-types.ts` sendiri — intentional untuk hackathon)

---

## Known Issues / Gotchas

1. **Sidebar Approval Queue badge tidak sync dengan stat card** — badge cache 3, card show 0. Stale data dari MCP Inspector tests sebelumnya. Approve/reject untuk bersihkan.
2. **MCP token ditampilkan sekali** — kalau hilang, harus revoke + generate baru
3. **Backend & frontend harus tetap nyala** saat test MCP — MCP server connect ke `localhost:3001`
4. **Tailwind 4 quirk** — no `tailwind.config.js`, semua di CSS via `@theme`
5. **Next 16 quirk** — banyak API berbeda dari training data, baca `node_modules/next/dist/docs/` dulu
6. **Sui SDK v2 quirk** — di providers.tsx pakai raw fullnode URL (`https://fullnode.testnet.sui.io:443`) bukan `getFullnodeUrl()`
7. **Seal SDK quirk** — encrypt `id` harus hex string, BUKAN Uint8Array
8. **Supabase migration** — selalu pakai `prisma db push`, JANGAN `migrate dev` (Supabase auto-install extensions seperti `supabase_vault` yang bikin Prisma detect drift)

---

## Demo Stories (untuk hackathon submission)

1. **Cross-tool memory** (0:30–1:00) — User A Claude Code save decision → User B Cursor langsung dapat konteks
2. **Long-running context** (1:00–1:30) — buka memory 1 minggu lalu, tunjukkan tersimpan di Walrus (blob ID + Walrus explorer link)
3. **Autonomous agent** (1:30–2:15) — push PR yang violate past decision → PR Reviewer Agent review autonomous dengan reference memory
4. **Artifact-driven** (2:15–2:45) — agent generate report → save_artifact → next session pakai sebagai reference
5. **Privacy via Seal** (2:45–3:00) — buka Walrus aggregator URL publik, tunjukkan blob = ciphertext

---

## Phase 2 Roadmap (out of MVP scope, mention di pitch)

- Knowledge Marketplace + token economy
- Seal Full (on-chain access control, bukan Seal Minimal proxy)
- Multi-agent coordination beyond stretch goal
- Walrus Sites deployment untuk dashboard
- Vercel + Sentry webhook handlers
- Mainnet deployment + storage renewal flow
- SDK npm package terpisah
- BullMQ queue untuk scale

---

## GitHub Repos (8 repos di org DevMindRepo)

Setiap folder lokal punya repo terpisah di GitHub. **Lokal tetap monorepo** — workspace deps `workspace:*` tetap jalan. Tiap repo TIDAK runnable standalone (clone satu folder doang akan gagal install karena workspace deps).

| Folder lokal | GitHub repo |
|---|---|
| `smart_contract/` | https://github.com/DevMindRepo/smartcontract |
| `backend/` | https://github.com/DevMindRepo/backend |
| `mcp-server/` | https://github.com/DevMindRepo/mcp-server |
| `packages/shared/` | https://github.com/DevMindRepo/shared |
| `packages/memwal-client/` | https://github.com/DevMindRepo/memwal-client |
| `packages/seal-client/` | https://github.com/DevMindRepo/seal-client |
| `frontend/` | https://github.com/DevMindRepo/frontend |
| `agent/` | https://github.com/DevMindRepo/agent |

**Untuk update**: `cd <folder> && git add . && git commit -m "msg" && git push` — origin/main sudah ke-set di tiap repo.

---

## Kontak / Links

- Hackathon track: Walrus
- Submission deadline: cek hackathon page
