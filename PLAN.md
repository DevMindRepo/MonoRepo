# DevMind — Implementation Plan (Walrus Hackathon MVP)

## Context

**DevMind** adalah persistent memory layer untuk AI coding assistant (Claude Code, Cursor, Copilot, dll) supaya AI bisa **ingat keputusan tim lintas sesi, lintas tool, dan lintas anggota tim**. Memory disimpan permanen di **Walrus** (via **MemWal** abstraction), terenkripsi dengan **Seal**, dan workspace identity di-anchor ke **Sui smart contract Move**.

Project ini ditarget untuk **Walrus Hackathon track** dengan deadline 3 minggu. Sumber blueprint awal: `e:\devmind\DEVMIND (1).md`. Workspace `e:\devmind` masih kosong (greenfield).

**Problem yang diselesaikan** (sesuai problem statement track Walrus):
> *"AI agents lose context across sessions, struggle to share knowledge across tools, teams, or workflows. Memory is often tied to a single app, model, or device."*

**Outcome yang diharapkan**: demo end-to-end yang menunjukkan (1) AI assistant save/get memory lintas tool, (2) GitHub webhook auto-extract decision, (3) PR Reviewer Agent autonomous yang pakai memory, (4) dashboard untuk inspect/manage memory.

---

## 👥 Pembagian Tim (3 Orang)

> **Untuk anggota tim baru**: cari role kamu di bawah, baca checklist mingguanmu, lalu lanjut baca seluruh PLAN.md untuk konteks. Saat pakai Claude Code untuk buat plan implementasi, sebutkan role kamu agar AI tau bagian mana yang harus dibantu.
>
> **📚 PRA-SYARAT**: Sebelum coding, semua anggota tim WAJIB baca [RESOURCES.md](./RESOURCES.md) — berisi docs Sui/Walrus/Seal/MemWal, MCP servers untuk install, dan reading plan per role.
>
> **Contoh prompt ke Claude Code**:
> ```
> "Saya Role 1 (Web3 Engineer) di project DevMind.
>  Baca PLAN.md dan RESOURCES.md, lalu bantu saya implementasi Week 1 checklist saya."
> ```

### 🔍 Quick Lookup — Role kamu yang mana?

| Role | Owns | Working Directory |
|---|---|---|
| **🔗 Role 1 — Web3 & Smart Contract** | Blockchain, Walrus, Seal, MemWal | `packages/contracts/`, `packages/memwal-client/`, `packages/seal-client/` |
| **🔧 Role 2 — Backend & MCP** | API, MCP server, agent, database | `apps/mcp-server/`, `apps/api/`, `apps/agent-pr-reviewer/` |
| **🎨 Role 3 — Frontend & UX** | Dashboard, auth UI, demo prep | `apps/web/` |

---

### 🔗 Role 1: Web3 & Smart Contract Engineer

**Tanggung jawab**:
- Smart contract Move (workspace + Seal policy)
- Walrus integration via MemWal abstraction
- Seal Minimal encrypt/decrypt
- Sui wallet authentication helpers
- Walrus testnet setup (faucet WAL/SUI, master wallet)

**Files yang kamu OWN**:
- `packages/contracts/sources/workspace.move`
- `packages/contracts/sources/seal_policy.move`
- `packages/contracts/Move.toml`
- `packages/memwal-client/src/index.ts`
- `packages/seal-client/src/index.ts`

**Files yang kamu BANTU (review only)**:
- `apps/api/src/routes/auth.ts` (Sui wallet signature verification)
- `apps/api/src/routes/workspaces.ts` (workspace contract integration)

**Week 1 Checklist**:
- [ ] Install Sui CLI dan setup testnet wallet
- [ ] Dapatkan WAL + SUI testnet dari faucet (Discord Sui #testnet-faucet)
- [ ] Setup `packages/memwal-client/` dengan `@mysten/walrus` SDK
- [ ] Implement `store()` dan `retrieve()` wrapper (pakai `writeFiles` / `getFiles` API current)
- [ ] Setup `packages/seal-client/` dengan `@mysten/seal` SDK
- [ ] Implement `encrypt()` dan `decrypt()` Seal Minimal wrapper
- [ ] Test end-to-end: encrypt → upload Walrus → retrieve → decrypt
- [ ] **🤝 Handoff Day 7**: API docs untuk Role 2 (method signatures + contoh pakai)

**Week 2 Checklist**:
- [ ] Setup `packages/contracts/` dengan `Move.toml` (edition 2024)
- [ ] Tulis `workspace.move`:
  - [ ] `create_workspace(name, walrus_root, ctx)`
  - [ ] `invite_member(workspace, new_member, ctx)`
  - [ ] `remove_member(workspace, member, ctx)`
  - [ ] `is_member(workspace, user): bool`
- [ ] Tulis `seal_policy.move` (trivial — cuma allow master wallet)
- [ ] Test contract dengan `sui move test`
- [ ] Deploy ke Sui testnet, catat Package ID di shared docs
- [ ] **🤝 Handoff Day 14**: Sharing contract address + Workspace object ABI ke Role 2

**Week 3 Checklist**:
- [ ] Bantu Role 2 debug integrasi contract
- [ ] Polish smart contract (kalau ada edge case ketemu saat testing)
- [ ] Document Sui wallet setup flow untuk users
- [ ] Bantu Role 3 dengan `@mysten/dapp-kit` integration di frontend
- [ ] Standby buat demo (siap-siap jelaskan smart contract saat tanya judges)

**Skill yang harus dimiliki**:
- Move language (atau willingness to learn dalam 3-7 hari)
- TypeScript intermediate
- Basic crypto concepts (encryption, signatures)
- Comfortable dengan CLI tools (sui, walrus)

**Resources**:
- [Sui Move docs](https://docs.sui.io/concepts/sui-move-concepts)
- [Walrus SDK](https://sdk.mystenlabs.com/walrus)
- [Seal docs](https://seal-docs.wal.app/)
- [Move Book](https://move-book.com/)

---

### 🔧 Role 2: Backend & MCP Engineer

**Tanggung jawab**:
- MCP Server (4 tools)
- Backend API (Fastify, Prisma)
- Database schema + migrations
- GitHub webhook + auto-extract decision via LLM
- PR Reviewer Agent (Mastra framework)
- Embedding generation (OpenAI/DeepSeek)

**Files yang kamu OWN**:
- `apps/mcp-server/src/**`
- `apps/api/src/**`
- `apps/agent-pr-reviewer/src/**`
- `packages/shared/src/types/**`
- `docker-compose.yml`
- `prisma/schema.prisma`

**Files yang kamu BANTU (consume + feedback)**:
- `packages/memwal-client/` (consumer dari Role 1)
- `packages/seal-client/` (consumer dari Role 1)

**Week 1 Checklist**:
- [ ] Setup `apps/api/` dengan Fastify + Prisma
- [ ] Setup PostgreSQL schema: users, workspaces, workspace_members, memories, incidents
- [ ] Enable pgvector extension untuk semantic search
- [ ] Auth routes: `/auth/register`, `/auth/login`, `/auth/wallet`
- [ ] Workspace routes: CRUD + invite member endpoint
- [ ] Setup `apps/mcp-server/` skeleton dengan `@modelcontextprotocol/sdk`
- [ ] Implement `save_memory` tool (push ke pending queue Redis dengan TTL 24h)
- [ ] Implement `get_memory` tool (semantic search + decrypt via memwal-client)
- [ ] Test MCP server dengan Claude Code (lokal)
- [ ] **🤝 Handoff Day 7**: OpenAPI spec di `docs/api-spec.md` untuk Role 3

**Week 2 Checklist**:
- [ ] GitHub webhook endpoint: `POST /webhook/github`
- [ ] Auto-extract decision dari commit/PR pakai LLM
- [ ] Push extracted decision ke pending queue
- [ ] Setup `apps/agent-pr-reviewer/` dengan Mastra framework
- [ ] PR Reviewer Agent workflow:
  - [ ] Step 1: Parse PR diff dari webhook payload
  - [ ] Step 2: Query DevMind memory untuk file/keputusan terkait
  - [ ] Step 3: LLM analyze (deteksi drift dari past decisions)
  - [ ] Step 4: Post GitHub comment via Octokit
  - [ ] Step 5: Save reasoning back ke DevMind
- [ ] Implement `save_artifact` tool (binary blob ke Walrus)
- [ ] Integrate workspace contract ke backend (call Role 1's contract via `@mysten/sui` SDK)

**Week 3 Checklist**:
- [ ] End-to-end testing
- [ ] Fix bugs dari Role 3's frontend testing
- [ ] Optimize semantic search performance (index tuning)
- [ ] Polish error messages (user-friendly)
- [ ] Document API endpoints untuk demo

**Skill yang harus dimiliki**:
- Node.js + TypeScript advanced
- Fastify / Express experience
- Prisma + PostgreSQL
- LLM API integration (OpenAI SDK / Anthropic SDK)
- Familiar dengan Redis basics
- Bonus: pernah pakai agent framework (Mastra/LangChain/CrewAI)

**Resources**:
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Mastra Docs](https://mastra.ai)
- [Fastify Docs](https://fastify.dev/)
- [Prisma Docs](https://www.prisma.io/docs)

---

### 🎨 Role 3: Frontend & UX Engineer

**Tanggung jawab**:
- Next.js dashboard (~8 halaman)
- Auth flow UI (email + Sui wallet)
- Memory browser & approval queue (KRITIKAL untuk demo)
- Agent timeline visualization
- Onboarding & MCP setup guide
- Demo video recording

**Files yang kamu OWN**:
- `apps/web/**`

**Files yang kamu BANTU (consume API + feedback)**:
- Backend API endpoints (kasih feedback ke Role 2 kalau API kurang ergonomic)
- `packages/shared/src/types/**` (shared types untuk request/response)

**Week 1 Checklist** (parallel work — backend belum ready):
- [ ] Setup `apps/web/` dengan Next.js 14 App Router
- [ ] Setup Tailwind + shadcn/ui
- [ ] Design system: colors, typography, spacing tokens
- [ ] Buat layout shell (sidebar, topbar, content area)
- [ ] Wireframe semua 8 halaman (boleh Figma atau code mockup)
- [ ] Setup mock API dengan MSW untuk development local
- [ ] Landing page (boleh hardcode dulu)
- [ ] Login/register page (UI saja, integrate API nanti)
- [ ] Setup `@mysten/dapp-kit` untuk wallet connect

**Week 2 Checklist**:
- [ ] Onboarding flow:
  - [ ] `/onboarding/workspace` (setup workspace baru)
  - [ ] `/onboarding/connect` (MCP config guide untuk Claude Code/Cursor)
- [ ] Dashboard home (overview cards: memory count, recent activity)
- [ ] Memory browser:
  - [ ] `/memories` (list dengan search & filter)
  - [ ] `/memories/[id]` (detail page)
- [ ] **🔥 Approval queue page (KRITIKAL untuk demo)**:
  - [ ] List pending memories
  - [ ] Preview content dengan regex highlight (API keys, JWT, password)
  - [ ] Tombol Approve / Edit / Reject
  - [ ] Show source (Claude Code session ID, dll)
- [ ] Workspace settings page
- [ ] Integrate dengan real API (replace MSW mocks)

**Week 3 Checklist**:
- [ ] `/agent-timeline` page (visualisasi PR Reviewer Agent execution):
  - [ ] Timeline view per agent run
  - [ ] Step-by-step status (parse → query → LLM → post → save)
  - [ ] Durasi tiap step
- [ ] `/incidents` page (kalau ada waktu — fitur lower priority)
- [ ] UI polish: animations, loading states, error states
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] **🎬 Demo prep**:
  - [ ] Tulis demo script dengan timing per scene
  - [ ] Test demo flow end-to-end (rehearse 3-5 kali)
  - [ ] Record demo video (3 menit, max)
- [ ] Update README dengan screenshot dashboard

**Skill yang harus dimiliki**:
- Next.js 14 App Router
- React + TypeScript
- Tailwind CSS + shadcn/ui
- UX/UI sensibility
- Basic video editing (untuk demo)

**Resources**:
- [Next.js Docs](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Mysten dapp-kit](https://sdk.mystenlabs.com/dapp-kit)
- [TanStack Query](https://tanstack.com/query/latest)

---

### 🔗 Integration Handoffs (Critical Sync Points)

#### **End Week 1 (Day 7) — Foundation Handoff**

| From → To | Yang di-handoff |
|---|---|
| Role 1 → Role 2 | Walrus + Seal wrapper API ready + method signatures docs |
| Role 2 → Role 3 | OpenAPI spec, auth flow detail, Postgres schema final |
| **All** | Sync meeting + demo: backend bisa save+retrieve memory encrypted |

#### **End Week 2 (Day 14) — Feature Handoff**

| From → To | Yang di-handoff |
|---|---|
| Role 1 → Role 2 | Smart contract deployed + Package ID + Workspace object struct |
| Role 2 → Role 3 | All API endpoints LIVE, PR Reviewer Agent functional |
| **All** | Sync meeting + demo: full memory flow + agent works end-to-end |

#### **End Week 3 (Day 19-20) — Polish & Demo**

| Role | Tugas |
|---|---|
| Role 3 (lead) | Demo video recording + script |
| Role 1 + 2 (standby) | Bug fixes, support demo |
| **All** | Bug bash + integration testing |

---

### 💬 Tim Coordination Strategy

**Daily standup** (15 menit, async OK via Slack/Discord):
- ✅ Done yesterday
- 🚧 Doing today
- 🚨 Blocker (kalau ada)

**Shared docs** (di `docs/` folder):
- `docs/api-spec.md` — Role 2 owns
- `docs/walrus-client.md` — Role 1 owns
- `docs/ui-mockups/` — Role 3 owns
- `.env.example` — semua role contribute

**Code review rules**:
- Cross-review antar role (catch integration issues lebih awal)
- Tidak boleh self-merge kalau PR menyangkut shared types
- Tag role yang relevan di PR description

**Pacing**:
- Minimum 1 hari off di Week 2 (recommended Sunday)
- Day 19-20 sengaja dilonggar untuk crisis bug
- Demo prep dimulai sejak Day 15, jangan tunggu hari terakhir

---

### 🚨 Risk Mitigation per Role

| Risk | Mitigasi Utama | Plan B |
|---|---|---|
| Role 1 stuck di Move/Seal >2 hari | Switch ke plain Walrus tanpa Seal sementara | Role 2 ambil Walrus integration, Role 1 fokus Move |
| Role 2 overloaded (3 komponen besar) | Cut PR Reviewer Agent (Fix A) dari MVP | Role 3 bantu MCP tool sederhana di Week 3 |
| Role 3 ketinggalan (frontend butuh API selesai) | Pakai MSW mock API di Week 1-2 | Cut dashboard pages dari 8 → 5 essential |
| Integration bug di Week 3 | Saturday Week 2 = integration day (semua nge-debug bareng) | Defer Fix C (artifact) kalau perlu |

---

### 📚 Cara Memulai untuk Tiap Anggota Tim

1. **Clone repository**: `git clone <repo-url> && cd devmind`
2. **Baca PLAN.md** sampai habis untuk konteks project
3. **Cari section role kamu** di atas (Role 1 / 2 / 3)
4. **Setup environment lokal**: `pnpm install && docker-compose up -d`
5. **Ikuti Week 1 checklist** role kamu
6. **Pakai Claude Code dengan konteks role**:
   ```
   "Saya Role 1 (Web3 Engineer) di project DevMind.
    Baca PLAN.md, lalu bantu saya implementasi Week 1 checklist saya:
    - Setup memwal-client
    - Setup seal-client
    - Test end-to-end encrypt/upload/retrieve/decrypt"
   ```
7. **Daily check-in** di Slack/Discord
8. **Tag teammate** saat butuh review atau ada blocker

---

## Re-Scope dari Blueprint Awal

### ✅ Pertahankan (Core MVP)
- MCP Server (4 tools: `save_memory`, `get_memory`, `share_context`, `save_artifact`)
- MemWal sebagai memory abstraction layer (bukan Walrus raw)
- Walrus testnet sebagai storage backend
- Seal Minimal untuk encryption (Seal SDK, access control off-chain)
- Workspace Registry smart contract (Move, sederhana — ~50 baris)
- Sui wallet sebagai identity (optional: email fallback)
- GitHub webhook → auto-extract memory (1 webhook saja)
- Web Dashboard ~8 halaman (memory browser, audit, approval queue, dll)
- Semantic search via pgvector
- PR Reviewer Agent (autonomous, pakai Mastra framework)

### ❌ Buang dari MVP
- Knowledge Marketplace (smart contract, listing, buy, sell, fee split)
- Token economy (DevMind token, fees, billing)
- Auto-rating AI
- Vercel + Sentry webhook (cukup GitHub saja)
- SDK npm package terpisah (apps/sdk) — MCP server sebagai integration point
- BullMQ queue (over-engineering, pakai Redis cache saja)
- Socket.io realtime (polling cukup untuk MVP)
- NextAuth (auth langsung pakai JWT + Sui wallet)

### 🔄 Perbaiki / Pertegas
- **Incident response** → re-frame sebagai "Agent recall on trigger", bukan DevOps tool
- **Memory framing** → "agent artifacts: decisions, code patches, error contexts" bukan sekedar "catatan"
- **Smart contract** → sederhanakan ke workspace registry saja (cut marketplace contract)
- **Walrus claim** → "long-lived, renewable" bukan "permanent forever" (Walrus epoch-based)
- **Move syntax** → pakai edition 2024 (`public struct`, `ctx.sender()`, dll)
- **MCP config docs** → `~/.claude.json` untuk Claude Code CLI (bukan `claude_desktop_config.json` yang Claude Desktop)
- **MCP SDK API** → `server.registerTool()` bukan `server.tool()` (API current)

---

## Keputusan Desain Penting

### Secret Scrubbing
**Strategi: Trust AI + User Approve via Dashboard + Regex Highlight**
- Tidak ada hard block server-side
- `save_memory` simpan ke **pending queue** (Redis dengan TTL 24 jam)
- Dashboard tampilkan content dengan regex highlight (pattern API keys, JWT, password)
- User klik Approve/Edit/Reject sebelum content benar-benar masuk Walrus
- `save_memory` return immediately dengan status "pending" (tidak block AI)

### Memory Granularity
**Strategi: Hybrid — AI suggest, user approve**
- AI assistant panggil `save_memory` kapanpun
- Memory masuk pending queue dulu, bukan langsung Walrus
- User control via dashboard approval

### Privacy / Encryption: Seal Minimal
- **Pakai `@mysten/seal` SDK** untuk encrypt content sebelum upload Walrus
- Smart contract Move untuk Seal policy = **trivial** (cuma allow master wallet DevMind)
- Backend DevMind = decryption proxy, pakai master Sui wallet
- Access control = SQL ACL check di backend (workspace_members table)
- **Trade-off yang diterima**: trust DevMind backend, tapi UX mulus dan effort kecil (1-2 hari)
- **Roadmap Phase 2**: migrate ke Seal Full dengan on-chain access control

### Storage
- **MVP: Walrus testnet only**
- Tidak ada flow renewal blob (testnet bisa di-reset, accept risk untuk demo)
- Master wallet DevMind topped up dengan WAL testnet (faucet gratis)

### Workflow Orchestration
- **Tidak bangun dari nol** — pakai **Mastra** (https://mastra.ai) untuk PR Reviewer Agent
- Narrative: "DevMind = memory layer plug-and-play untuk agent framework"

### Multi-Agent Coordination (Stretch Goal)
- **Skip dari MVP base**
- Kalau Week 2 selesai cepat → tambah di Week 3 sebagai stretch (Implementer + Reviewer agent coordinate via DevMind memory)

---

## Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│ Layer User                                                   │
│ • Claude Code / Cursor / Copilot (via MCP)                  │
│ • Web Dashboard (Next.js)                                    │
│ • Sui Wallet (Suiet/Sui Wallet)                              │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│ DevMind Platform                                             │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│ │  MCP Server  │  │ Backend API  │  │  PR Reviewer     │    │
│ │  (TypeScript)│  │  (Fastify)   │  │  Agent (Mastra)  │    │
│ └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘    │
│        │                 │                    │              │
│        └─────────────────┼────────────────────┘              │
│                          │                                    │
│ ┌────────────────────────▼─────────────────────────────┐    │
│ │ Core Services                                          │    │
│ │ • PostgreSQL + pgvector (index, ACL, embeddings)      │    │
│ │ • Redis (pending queue, cache)                         │    │
│ │ • MemWal client (memory abstraction)                  │    │
│ │ • Seal client (encrypt/decrypt)                       │    │
│ └──────────┬─────────────────────────────────────┬─────┘    │
└────────────┼─────────────────────────────────────┼──────────┘
             │                                     │
   ┌─────────▼──────────┐                ┌────────▼─────────┐
   │  Walrus Testnet    │                │  Sui Testnet     │
   │  (memory content)  │                │  • Workspace SC  │
   │  via MemWal        │                │  • Seal policy SC│
   └────────────────────┘                └──────────────────┘
```

---

## Struktur Monorepo (Trimmed)

```
devmind/
├── apps/
│   ├── web/                # Next.js dashboard (~8 halaman)
│   ├── mcp-server/         # MCP server (TypeScript)
│   ├── api/                # Backend API (Fastify)
│   └── agent-pr-reviewer/  # PR Reviewer Agent (Mastra)
├── packages/
│   ├── contracts/          # Sui Move (workspace + seal policy)
│   ├── memwal-client/      # MemWal + Walrus wrapper
│   ├── seal-client/        # Seal Minimal encrypt/decrypt
│   └── shared/             # Shared types & utilities
├── docker-compose.yml      # PostgreSQL + Redis local
├── package.json            # pnpm workspace root
└── README.md
```

**Dihapus dari blueprint awal**: `apps/sdk/` (npm package terpisah), `packages/walrus-client/` (merge ke `memwal-client/`).

---

## Tech Stack

| Layer | Pilihan |
|---|---|
| Frontend | Next.js 14, TailwindCSS, shadcn/ui, Zustand, TanStack Query, @mysten/dapp-kit |
| MCP Server | Node.js 20+, `@modelcontextprotocol/sdk` (`server.registerTool` API), Zod, stdio + StreamableHTTP transport |
| Backend API | Fastify 4, Prisma 5, PostgreSQL 16 + pgvector, Redis 7 (cache only) |
| Agent | Mastra (TypeScript agent framework), DeepSeek/Claude untuk LLM, GitHub Octokit |
| Smart Contract | Sui Move (edition 2024), `public struct`, `ctx.sender()` style |
| Storage | `@mysten/walrus` (via MemWal abstraction), `@mysten/seal` (Seal Minimal) |
| Identity | Sui wallet signature + JWT session |

---

## Tools MCP Server

```ts
// apps/mcp-server/src/index.ts

server.registerTool('save_memory', {
  description: 'Save decision/context/decision ke pending queue, user approve via dashboard',
  inputSchema: z.object({
    content: z.string(),
    type: z.enum(['decision', 'bug', 'arch', 'note']),
    privacy: z.enum(['private', 'team', 'public']).default('team'),
    tags: z.array(z.string()).optional(),
  })
}, handler)
// Returns immediately dengan pending_id, status "pending_approval"

server.registerTool('get_memory', {
  description: 'Semantic search memory di workspace',
  inputSchema: z.object({
    query: z.string(),
    limit: z.number().default(5),
  })
}, handler)

server.registerTool('share_context', {
  description: 'Push context ke workspace member tertentu',
  inputSchema: z.object({
    context: z.string(),
    target_workspace: z.string(),
  })
}, handler)

server.registerTool('save_artifact', {
  description: 'Save file artifact (dataset, log, report) ke Walrus',
  inputSchema: z.object({
    filename: z.string(),
    content_base64: z.string(),
    type: z.enum(['dataset', 'log', 'report', 'output']),
    related_memory_id: z.string().optional(),
  })
}, handler)
```

---

## Smart Contract Move (Sederhana)

**File**: `packages/contracts/sources/workspace.move`

```move
module devmind::workspace {
    use sui::vec_set::{Self, VecSet};
    use std::string::String;

    public struct Workspace has key, store {
        id: UID,
        name: String,
        owner: address,
        members: VecSet<address>,
        walrus_root: String,
        created_at: u64,
    }

    public fun create_workspace(name: String, walrus_root: String, ctx: &mut TxContext) { ... }
    public fun invite_member(workspace: &mut Workspace, new_member: address, ctx: &mut TxContext) { ... }
    public fun remove_member(workspace: &mut Workspace, member: address, ctx: &mut TxContext) { ... }
    public fun is_member(workspace: &Workspace, user: address): bool { ... }
}
```

**File**: `packages/contracts/sources/seal_policy.move` (trivial untuk Seal Minimal)
```move
module devmind::seal_policy {
    public fun seal_approve(id: vector<u8>, ctx: &TxContext) {
        let master = @0xDEVMIND_BACKEND_WALLET;
        assert!(ctx.sender() == master, 0);
    }
}
```

---

## Timeline 3 Minggu

### Minggu 1 — Foundation
- **Hari 1-2**: Setup monorepo (pnpm), Docker (Postgres + Redis), env vars, Sui wallet testnet
- **Hari 3-4**: Backend API auth (JWT + Sui wallet sig), workspace CRUD, PostgreSQL schema
- **Hari 5-6**: MemWal + Walrus integration (`writeFiles` / `getFiles`), Seal Minimal wrapper (encrypt/decrypt)
- **Hari 7**: MCP server skeleton + `save_memory` + `get_memory` tools, test dengan Claude Code

### Minggu 2 — Features + Smart Contract
- **Hari 8-9**: GitHub webhook handler, auto-extract decision via LLM, save ke pending queue
- **Hari 10-11**: Move smart contract (workspace + seal policy), deploy testnet, integrate ke backend
- **Hari 12-13**: PR Reviewer Agent (Mastra) — read PR diff, query memory, post review, save reasoning
- **Hari 14**: `save_artifact` tool + integrate ke agent flow

### Minggu 3 — Frontend + Polish
- **Hari 15-16**: Dashboard pages — landing, auth, workspace setup, MCP connect guide
- **Hari 17-18**: Dashboard pages — memory browser, approval queue, agent timeline, incident view
- **Hari 19**: End-to-end testing, fix bugs
- **Hari 20**: UI polish, error handling, demo prep
- **Hari 21**: Record demo video (3 menit), push to GitHub public repo, submit

**Stretch goal Week 3** (kalau Day 18 selesai cepat):
- Multi-agent demo (Implementer + Reviewer coordinate via DevMind memory)

---

## Demo Stories untuk Hackathon

1. **Cross-tool memory** (0:30-1:00): User A pakai Claude Code → save decision. User B pakai Cursor (sim) → langsung dapat konteks. *"Lintas tool, lintas user, lintas hari"*.

2. **Long-running context** (1:00-1:30): Buka memory dari 1 minggu lalu di dashboard, tunjukkan tersimpan permanen di Walrus (blob ID + Walrus explorer link).

3. **Autonomous agent** (1:30-2:15): Push PR yang melanggar past decision → PR Reviewer Agent otomatis review dengan reference ke memory DevMind. *"Tidak ada human in the loop, agent kerja autonomous pakai memory"*.

4. **Artifact-driven** (2:15-2:45): Agent generate `drift-report.md` → save_artifact → next session agent pakai report itu sebagai reference.

5. **Privacy via Seal** (2:45-3:00): Buka Walrus explorer, tunjukkan blob = ciphertext. *"Memory team-only, encrypted dengan Seal SDK"*.

---

## Critical Files (untuk implementasi)

| File | Tujuan |
|---|---|
| `apps/mcp-server/src/index.ts` | MCP server entry, register 4 tools |
| `apps/mcp-server/src/tools/save-memory.ts` | save_memory handler (push ke pending queue) |
| `apps/mcp-server/src/tools/get-memory.ts` | get_memory handler (semantic search + decrypt) |
| `apps/mcp-server/src/tools/save-artifact.ts` | save_artifact handler (binary blob ke Walrus) |
| `apps/api/src/routes/auth.ts` | JWT + Sui wallet signature verification |
| `apps/api/src/routes/workspaces.ts` | Workspace CRUD + member management |
| `apps/api/src/routes/memories.ts` | Memory CRUD + approval endpoints |
| `apps/api/src/routes/webhook/github.ts` | GitHub webhook handler |
| `apps/api/src/services/embedding.ts` | OpenAI/DeepSeek embedding generation |
| `apps/api/src/services/scrubber.ts` | Regex secret detection (untuk highlight UI) |
| `packages/memwal-client/src/index.ts` | MemWal wrapper (write/get) |
| `packages/seal-client/src/index.ts` | Seal Minimal encrypt/decrypt wrapper |
| `packages/contracts/sources/workspace.move` | Workspace registry Move contract |
| `packages/contracts/sources/seal_policy.move` | Trivial Seal policy contract |
| `apps/agent-pr-reviewer/src/index.ts` | Mastra agent definition + workflow |
| `apps/web/app/(dashboard)/approval-queue/page.tsx` | UI untuk approve pending memory |
| `apps/web/app/(dashboard)/memories/page.tsx` | Memory browser dengan workspace filter |
| `apps/web/app/(dashboard)/agent-timeline/page.tsx` | Visualisasi execution agent |

---

## Verifikasi End-to-End

### Setup local
```bash
pnpm install
docker-compose up -d        # Postgres + Redis
pnpm prisma migrate dev
pnpm dev                     # Run semua apps
```

### Test scenarios
1. **MCP integration**: connect Claude Code ke local MCP server, panggil `save_memory("test decision")`. Verify: pending entry muncul di Redis.
2. **Approval flow**: buka dashboard `/approval-queue`, approve pending memory. Verify: blob muncul di Walrus testnet, metadata di PostgreSQL.
3. **Get memory**: di Claude Code panggil `get_memory("test")`. Verify: content kembali (sudah ter-decrypt via Seal Minimal).
4. **Smart contract**: deploy ke Sui testnet, buat workspace baru via dashboard. Verify: object tercatat di Sui Explorer.
5. **GitHub webhook**: push commit ke repo test, webhook handler trigger. Verify: extracted decision masuk pending queue.
6. **PR Reviewer Agent**: open PR yang violate past decision. Verify: agent post review comment dalam 1-2 menit, reasoning saved ke DevMind.
7. **Artifact**: agent generate report.md, panggil `save_artifact`. Verify: file recoverable via `get_artifact` di session berikutnya.
8. **Privacy**: copy blob_id dari memory team, buka Walrus aggregator URL publik. Verify: content = ciphertext (tidak readable).

### Deployment minimal
- Backend API + MCP server: Railway (single instance)
- Web: Vercel
- Smart contract: Sui testnet (sudah deployed)
- Postgres + Redis: Railway managed

---

## Out of Scope (Phase 2 Roadmap)

Hal-hal yang **eksplisit di-defer**, akan disebut di pitch sebagai future work:

- Knowledge Marketplace + token economy
- Seal Full (on-chain access control)
- Multi-agent coordination beyond stretch goal
- Walrus Sites deployment untuk dashboard
- Sui Stack Messaging untuk workspace chat
- Vercel + Sentry webhook handlers
- Mainnet deployment + storage renewal flow
- SDK npm package terpisah
- BullMQ queue (untuk scale)
- Mobile app
- Marketplace bonus track
