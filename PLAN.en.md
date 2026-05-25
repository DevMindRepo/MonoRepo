# DevMind — Implementation Plan (Walrus Hackathon MVP)

## Context

**DevMind** is a persistent memory layer for AI coding assistants (Claude Code, Cursor, Copilot, etc.) so that AI can **remember team decisions across sessions, across tools, and across team members**. Memory is permanently stored on **Walrus** (via the **MemWal** abstraction), encrypted with **Seal**, and workspace identity is anchored to a **Sui Move smart contract**.

This project targets the **Walrus Hackathon track** with a 3-week deadline. Source of the initial blueprint: `e:\devmind\DEVMIND (1).md`. The workspace `e:\devmind` is currently empty (greenfield).

**Problem statement** (per Walrus track):
> *"AI agents lose context across sessions, struggle to share knowledge across tools, teams, or workflows. Memory is often tied to a single app, model, or device."*

**Expected outcome**: an end-to-end demo showing (1) AI assistants save/get memory across tools, (2) GitHub webhook auto-extracts decisions, (3) a PR Reviewer Agent autonomously uses memory, (4) a dashboard for inspecting/managing memory.

---

## 👥 Team Allocation (3-Person Team)

> **For new team members**: find your role below, read your weekly checklist, then continue reading the full PLAN.en.md for context. When using Claude Code to create your implementation plan, mention your role so the AI knows which parts to help with.
>
> **📚 PREREQUISITE**: Before coding, every team member MUST read [RESOURCES.md](./RESOURCES.md) — it contains docs for Sui/Walrus/Seal/MemWal, MCP servers to install, and a reading plan per role.
>
> **Example prompt to Claude Code**:
> ```
> "I am Role 1 (Web3 Engineer) on the DevMind project.
>  Read PLAN.en.md and RESOURCES.md, then help me implement my Week 1 checklist."
> ```

### 🔍 Quick Lookup — Which role are you?

| Role | Owns | Working Directory |
|---|---|---|
| **🔗 Role 1 — Web3 & Smart Contract** | Blockchain, Walrus, Seal, MemWal | `packages/contracts/`, `packages/memwal-client/`, `packages/seal-client/` |
| **🔧 Role 2 — Backend & MCP** | API, MCP server, agent, database | `apps/mcp-server/`, `apps/api/`, `apps/agent-pr-reviewer/` |
| **🎨 Role 3 — Frontend & UX** | Dashboard, auth UI, demo prep | `apps/web/` |

---

### 🔗 Role 1: Web3 & Smart Contract Engineer

**Responsibilities**:
- Move smart contracts (workspace + Seal policy)
- Walrus integration via MemWal abstraction
- Seal Minimal encrypt/decrypt
- Sui wallet authentication helpers
- Walrus testnet setup (WAL/SUI faucet, master wallet)

**Files you OWN**:
- `packages/contracts/sources/workspace.move`
- `packages/contracts/sources/seal_policy.move`
- `packages/contracts/Move.toml`
- `packages/memwal-client/src/index.ts`
- `packages/seal-client/src/index.ts`

**Files you SUPPORT (review only)**:
- `apps/api/src/routes/auth.ts` (Sui wallet signature verification)
- `apps/api/src/routes/workspaces.ts` (workspace contract integration)

**Week 1 Checklist**:
- [ ] Install Sui CLI and set up testnet wallet
- [ ] Get WAL + SUI testnet tokens from faucet (Sui Discord #testnet-faucet)
- [ ] Set up `packages/memwal-client/` with `@mysten/walrus` SDK
- [ ] Implement `store()` and `retrieve()` wrappers (using current `writeFiles` / `getFiles` API)
- [ ] Set up `packages/seal-client/` with `@mysten/seal` SDK
- [ ] Implement Seal Minimal `encrypt()` and `decrypt()` wrappers
- [ ] Test end-to-end: encrypt → upload to Walrus → retrieve → decrypt
- [ ] **🤝 Handoff Day 7**: API docs for Role 2 (method signatures + usage examples)

**Week 2 Checklist**:
- [ ] Set up `packages/contracts/` with `Move.toml` (edition 2024)
- [ ] Write `workspace.move`:
  - [ ] `create_workspace(name, walrus_root, ctx)`
  - [ ] `invite_member(workspace, new_member, ctx)`
  - [ ] `remove_member(workspace, member, ctx)`
  - [ ] `is_member(workspace, user): bool`
- [ ] Write `seal_policy.move` (trivial — master wallet only)
- [ ] Test contracts with `sui move test`
- [ ] Deploy to Sui testnet; record Package ID in shared docs
- [ ] **🤝 Handoff Day 14**: Share contract address + Workspace object ABI with Role 2

**Week 3 Checklist**:
- [ ] Help Role 2 debug contract integration
- [ ] Polish smart contract (any edge cases found during testing)
- [ ] Document Sui wallet setup flow for end users
- [ ] Help Role 3 with `@mysten/dapp-kit` integration on the frontend
- [ ] Standby for demo (be ready to explain the smart contract to judges)

**Skills required**:
- Move language (or willingness to learn within 3-7 days)
- Intermediate TypeScript
- Basic crypto concepts (encryption, signatures)
- Comfortable with CLI tools (sui, walrus)

**Resources**:
- [Sui Move docs](https://docs.sui.io/concepts/sui-move-concepts)
- [Walrus SDK](https://sdk.mystenlabs.com/walrus)
- [Seal docs](https://seal-docs.wal.app/)
- [Move Book](https://move-book.com/)

---

### 🔧 Role 2: Backend & MCP Engineer

**Responsibilities**:
- MCP Server (4 tools)
- Backend API (Fastify, Prisma)
- Database schema + migrations
- GitHub webhook + auto-extract decision via LLM
- PR Reviewer Agent (Mastra framework)
- Embedding generation (OpenAI/DeepSeek)

**Files you OWN**:
- `apps/mcp-server/src/**`
- `apps/api/src/**`
- `apps/agent-pr-reviewer/src/**`
- `packages/shared/src/types/**`
- `docker-compose.yml`
- `prisma/schema.prisma`

**Files you SUPPORT (consume + give feedback)**:
- `packages/memwal-client/` (consumer of Role 1's wrapper)
- `packages/seal-client/` (consumer of Role 1's wrapper)

**Week 1 Checklist**:
- [ ] Set up `apps/api/` with Fastify + Prisma
- [ ] Set up PostgreSQL schema: users, workspaces, workspace_members, memories, incidents
- [ ] Enable pgvector extension for semantic search
- [ ] Auth routes: `/auth/register`, `/auth/login`, `/auth/wallet`
- [ ] Workspace routes: CRUD + invite member endpoint
- [ ] Set up `apps/mcp-server/` skeleton with `@modelcontextprotocol/sdk`
- [ ] Implement `save_memory` tool (push to pending queue in Redis with 24h TTL)
- [ ] Implement `get_memory` tool (semantic search + decrypt via memwal-client)
- [ ] Test MCP server with Claude Code locally
- [ ] **🤝 Handoff Day 7**: OpenAPI spec in `docs/api-spec.md` for Role 3

**Week 2 Checklist**:
- [ ] GitHub webhook endpoint: `POST /webhook/github`
- [ ] Auto-extract decision from commits/PRs using LLM
- [ ] Push extracted decisions to the pending queue
- [ ] Set up `apps/agent-pr-reviewer/` with the Mastra framework
- [ ] PR Reviewer Agent workflow:
  - [ ] Step 1: Parse PR diff from webhook payload
  - [ ] Step 2: Query DevMind memory for related files/decisions
  - [ ] Step 3: LLM analyze (detect drift from past decisions)
  - [ ] Step 4: Post a GitHub comment via Octokit
  - [ ] Step 5: Save reasoning back to DevMind
- [ ] Implement `save_artifact` tool (binary blob to Walrus)
- [ ] Integrate workspace contract into the backend (call Role 1's contract via `@mysten/sui` SDK)

**Week 3 Checklist**:
- [ ] End-to-end testing
- [ ] Fix bugs found by Role 3 during frontend testing
- [ ] Optimize semantic search performance (index tuning)
- [ ] Polish error messages (user-friendly)
- [ ] Document API endpoints for demo

**Skills required**:
- Advanced Node.js + TypeScript
- Fastify / Express experience
- Prisma + PostgreSQL
- LLM API integration (OpenAI SDK / Anthropic SDK)
- Familiar with Redis basics
- Bonus: prior experience with agent frameworks (Mastra/LangChain/CrewAI)

**Resources**:
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Mastra Docs](https://mastra.ai)
- [Fastify Docs](https://fastify.dev/)
- [Prisma Docs](https://www.prisma.io/docs)

---

### 🎨 Role 3: Frontend & UX Engineer

**Responsibilities**:
- Next.js dashboard (~8 pages)
- Auth flow UI (email + Sui wallet)
- Memory browser & approval queue (CRITICAL for demo)
- Agent timeline visualization
- Onboarding & MCP setup guide
- Demo video recording

**Files you OWN**:
- `apps/web/**`

**Files you SUPPORT (consume API + give feedback)**:
- Backend API endpoints (give feedback to Role 2 if API is not ergonomic)
- `packages/shared/src/types/**` (shared types for request/response)

**Week 1 Checklist** (parallel work — backend not ready yet):
- [ ] Set up `apps/web/` with Next.js 14 App Router
- [ ] Set up Tailwind + shadcn/ui
- [ ] Design system: colors, typography, spacing tokens
- [ ] Build layout shell (sidebar, topbar, content area)
- [ ] Wireframe all 8 pages (Figma or code mockups, either works)
- [ ] Set up mock API with MSW for local development
- [ ] Landing page (hardcoded for now)
- [ ] Login/register page (UI only; integrate API later)
- [ ] Set up `@mysten/dapp-kit` for wallet connect

**Week 2 Checklist**:
- [ ] Onboarding flow:
  - [ ] `/onboarding/workspace` (new workspace setup)
  - [ ] `/onboarding/connect` (MCP config guide for Claude Code/Cursor)
- [ ] Dashboard home (overview cards: memory count, recent activity)
- [ ] Memory browser:
  - [ ] `/memories` (list with search & filter)
  - [ ] `/memories/[id]` (detail page)
- [ ] **🔥 Approval queue page (CRITICAL for demo)**:
  - [ ] List pending memories
  - [ ] Preview content with regex highlights (API keys, JWT, passwords)
  - [ ] Approve / Edit / Reject buttons
  - [ ] Show source (Claude Code session ID, etc.)
- [ ] Workspace settings page
- [ ] Integrate with real API (replace MSW mocks)

**Week 3 Checklist**:
- [ ] `/agent-timeline` page (visualization of PR Reviewer Agent runs):
  - [ ] Timeline view per agent run
  - [ ] Step-by-step status (parse → query → LLM → post → save)
  - [ ] Duration per step
- [ ] `/incidents` page (if time permits — lower priority)
- [ ] UI polish: animations, loading states, error states
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] **🎬 Demo prep**:
  - [ ] Write demo script with timing per scene
  - [ ] Rehearse end-to-end demo flow (3-5 times)
  - [ ] Record demo video (3 minutes max)
- [ ] Update README with dashboard screenshots

**Skills required**:
- Next.js 14 App Router
- React + TypeScript
- Tailwind CSS + shadcn/ui
- UX/UI sensibility
- Basic video editing (for the demo)

**Resources**:
- [Next.js Docs](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Mysten dapp-kit](https://sdk.mystenlabs.com/dapp-kit)
- [TanStack Query](https://tanstack.com/query/latest)

---

### 🔗 Integration Handoffs (Critical Sync Points)

#### **End of Week 1 (Day 7) — Foundation Handoff**

| From → To | What is handed off |
|---|---|
| Role 1 → Role 2 | Walrus + Seal wrapper API ready + method signature docs |
| Role 2 → Role 3 | OpenAPI spec, auth flow details, finalized Postgres schema |
| **All** | Sync meeting + demo: backend can save+retrieve encrypted memory |

#### **End of Week 2 (Day 14) — Feature Handoff**

| From → To | What is handed off |
|---|---|
| Role 1 → Role 2 | Smart contract deployed + Package ID + Workspace object struct |
| Role 2 → Role 3 | All API endpoints LIVE, PR Reviewer Agent functional |
| **All** | Sync meeting + demo: full memory flow + agent work end-to-end |

#### **End of Week 3 (Day 19-20) — Polish & Demo**

| Role | Task |
|---|---|
| Role 3 (lead) | Demo video recording + script |
| Role 1 + 2 (standby) | Bug fixes, demo support |
| **All** | Bug bash + integration testing |

---

### 💬 Team Coordination Strategy

**Daily standup** (15 minutes, async via Slack/Discord works fine):
- ✅ Done yesterday
- 🚧 Doing today
- 🚨 Blocker (if any)

**Shared docs** (in `docs/` folder):
- `docs/api-spec.md` — owned by Role 2
- `docs/walrus-client.md` — owned by Role 1
- `docs/ui-mockups/` — owned by Role 3
- `.env.example` — all roles contribute

**Code review rules**:
- Cross-review across roles (catch integration issues earlier)
- No self-merge on PRs touching shared types
- Tag the relevant role in PR descriptions

**Pacing**:
- Minimum 1 day off in Week 2 (recommended: Sunday)
- Days 19-20 are intentionally buffered for crisis bugs
- Demo prep starts on Day 15 — do NOT wait until the last day

---

### 🚨 Risk Mitigation by Role

| Risk | Primary Mitigation | Plan B |
|---|---|---|
| Role 1 stuck on Move/Seal >2 days | Switch to plain Walrus without Seal temporarily | Role 2 takes Walrus integration; Role 1 focuses on Move |
| Role 2 overloaded (3 large components) | Cut PR Reviewer Agent (Fix A) from MVP | Role 3 helps with simple MCP tools in Week 3 |
| Role 3 falling behind (frontend waits for API) | Use MSW mock API in Weeks 1-2 | Trim dashboard pages from 8 → 5 essentials |
| Integration bugs in Week 3 | Saturday of Week 2 = integration day (everyone debugs together) | Defer Fix C (artifact) if needed |

---

### 📚 How to Start (per team member)

1. **Clone the repository**: `git clone <repo-url> && cd devmind`
2. **Read PLAN.en.md** fully for project context
3. **Find your role section** above (Role 1 / 2 / 3)
4. **Set up local environment**: `pnpm install && docker-compose up -d`
5. **Follow your Week 1 checklist**
6. **Use Claude Code with role context**:
   ```
   "I am Role 1 (Web3 Engineer) on the DevMind project.
    Read PLAN.en.md, then help me implement my Week 1 checklist:
    - Set up memwal-client
    - Set up seal-client
    - Test end-to-end encrypt/upload/retrieve/decrypt"
   ```
7. **Daily check-in** on Slack/Discord
8. **Tag teammates** when you need review or hit a blocker

---

## Re-Scope from Initial Blueprint

### ✅ Keep (Core MVP)
- MCP Server (4 tools: `save_memory`, `get_memory`, `share_context`, `save_artifact`)
- MemWal as memory abstraction layer (not raw Walrus)
- Walrus testnet as storage backend
- Seal Minimal for encryption (Seal SDK, off-chain access control)
- Workspace Registry smart contract (Move, simple — ~50 lines)
- Sui wallet as identity (optional: email fallback)
- GitHub webhook → auto-extract memory (single webhook only)
- Web Dashboard ~8 pages (memory browser, audit, approval queue, etc.)
- Semantic search via pgvector
- PR Reviewer Agent (autonomous, using Mastra framework)

### ❌ Drop from MVP
- Knowledge Marketplace (smart contract, listing, buy, sell, fee split)
- Token economy (DevMind token, fees, billing)
- Auto-rating AI
- Vercel + Sentry webhooks (GitHub is enough)
- Separate SDK npm package (apps/sdk) — MCP server serves as integration point
- BullMQ queue (over-engineering; Redis cache is enough)
- Socket.io realtime (polling is sufficient for MVP)
- NextAuth (use JWT + Sui wallet directly)

### 🔄 Refine / Sharpen
- **Incident response** → reframe as "Agent recall on trigger", not a DevOps tool
- **Memory framing** → "agent artifacts: decisions, code patches, error contexts" rather than just "notes"
- **Smart contract** → simplify to workspace registry only (cut marketplace contract)
- **Walrus claim** → "long-lived, renewable" rather than "permanent forever" (Walrus is epoch-based)
- **Move syntax** → use edition 2024 (`public struct`, `ctx.sender()`, etc.)
- **MCP config docs** → `~/.claude.json` for Claude Code CLI (NOT `claude_desktop_config.json` — that's Claude Desktop)
- **MCP SDK API** → `server.registerTool()` instead of `server.tool()` (current API)

---

## Key Design Decisions

### Secret Scrubbing
**Strategy: Trust AI + User Approve via Dashboard + Regex Highlight**
- No hard server-side block
- `save_memory` saves to a **pending queue** (Redis with 24h TTL)
- Dashboard displays content with regex highlights (patterns for API keys, JWT, passwords)
- User clicks Approve / Edit / Reject before content is actually uploaded to Walrus
- `save_memory` returns immediately with status "pending" (does not block the AI)

### Memory Granularity
**Strategy: Hybrid — AI suggests, user approves**
- AI assistants can call `save_memory` at any time
- Memory enters pending queue first, not directly to Walrus
- User controls finalization via dashboard approval

### Privacy / Encryption: Seal Minimal
- Use **`@mysten/seal` SDK** to encrypt content before Walrus upload
- Move smart contract for Seal policy = **trivial** (only allows DevMind master wallet)
- DevMind backend = decryption proxy, uses master Sui wallet
- Access control = SQL ACL check in backend (workspace_members table)
- **Accepted trade-off**: trust DevMind backend, but UX is smooth and effort is small (1-2 days)
- **Phase 2 roadmap**: migrate to Seal Full with on-chain access control

### Storage
- **MVP: Walrus testnet only**
- No blob renewal flow (testnet can be reset; accepted risk for demo)
- DevMind master wallet topped up with testnet WAL (free faucet)

### Workflow Orchestration
- **Do not build from scratch** — use **Mastra** (https://mastra.ai) for the PR Reviewer Agent
- Narrative: "DevMind = plug-and-play memory layer for agent frameworks"

### Multi-Agent Coordination (Stretch Goal)
- **Skip from MVP base**
- If Week 2 finishes early → add in Week 3 as stretch (Implementer + Reviewer agents coordinate via DevMind memory)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ User Layer                                                   │
│ • Claude Code / Cursor / Copilot (via MCP)                  │
│ • Web Dashboard (Next.js)                                    │
│ • Sui Wallet (Suiet / Sui Wallet)                            │
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

## Monorepo Structure (Trimmed)

```
devmind/
├── apps/
│   ├── web/                # Next.js dashboard (~8 pages)
│   ├── mcp-server/         # MCP server (TypeScript)
│   ├── api/                # Backend API (Fastify)
│   └── agent-pr-reviewer/  # PR Reviewer Agent (Mastra)
├── packages/
│   ├── contracts/          # Sui Move (workspace + seal policy)
│   ├── memwal-client/      # MemWal + Walrus wrapper
│   ├── seal-client/        # Seal Minimal encrypt/decrypt
│   └── shared/             # Shared types & utilities
├── docker-compose.yml      # Local PostgreSQL + Redis
├── package.json            # pnpm workspace root
└── README.md
```

**Removed from initial blueprint**: `apps/sdk/` (separate npm package), `packages/walrus-client/` (merged into `memwal-client/`).

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 14, TailwindCSS, shadcn/ui, Zustand, TanStack Query, @mysten/dapp-kit |
| MCP Server | Node.js 20+, `@modelcontextprotocol/sdk` (`server.registerTool` API), Zod, stdio + StreamableHTTP transport |
| Backend API | Fastify 4, Prisma 5, PostgreSQL 16 + pgvector, Redis 7 (cache only) |
| Agent | Mastra (TypeScript agent framework), DeepSeek/Claude for LLM, GitHub Octokit |
| Smart Contract | Sui Move (edition 2024), `public struct`, `ctx.sender()` style |
| Storage | `@mysten/walrus` (via MemWal abstraction), `@mysten/seal` (Seal Minimal) |
| Identity | Sui wallet signature + JWT session |

---

## MCP Server Tools

```ts
// apps/mcp-server/src/index.ts

server.registerTool('save_memory', {
  description: 'Save a decision/context entry to the pending queue; user approves via dashboard',
  inputSchema: z.object({
    content: z.string(),
    type: z.enum(['decision', 'bug', 'arch', 'note']),
    privacy: z.enum(['private', 'team', 'public']).default('team'),
    tags: z.array(z.string()).optional(),
  })
}, handler)
// Returns immediately with pending_id, status "pending_approval"

server.registerTool('get_memory', {
  description: 'Semantic search of workspace memory',
  inputSchema: z.object({
    query: z.string(),
    limit: z.number().default(5),
  })
}, handler)

server.registerTool('share_context', {
  description: 'Push context to a specific workspace member',
  inputSchema: z.object({
    context: z.string(),
    target_workspace: z.string(),
  })
}, handler)

server.registerTool('save_artifact', {
  description: 'Save a file artifact (dataset, log, report) to Walrus',
  inputSchema: z.object({
    filename: z.string(),
    content_base64: z.string(),
    type: z.enum(['dataset', 'log', 'report', 'output']),
    related_memory_id: z.string().optional(),
  })
}, handler)
```

---

## Move Smart Contract (Simple)

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

**File**: `packages/contracts/sources/seal_policy.move` (trivial for Seal Minimal)
```move
module devmind::seal_policy {
    public fun seal_approve(id: vector<u8>, ctx: &TxContext) {
        let master = @0xDEVMIND_BACKEND_WALLET;
        assert!(ctx.sender() == master, 0);
    }
}
```

---

## 3-Week Timeline

### Week 1 — Foundation
- **Day 1-2**: Set up monorepo (pnpm), Docker (Postgres + Redis), env vars, Sui wallet testnet
- **Day 3-4**: Backend API auth (JWT + Sui wallet signature), workspace CRUD, PostgreSQL schema
- **Day 5-6**: MemWal + Walrus integration (`writeFiles` / `getFiles`), Seal Minimal wrapper (encrypt/decrypt)
- **Day 7**: MCP server skeleton + `save_memory` + `get_memory` tools, test with Claude Code

### Week 2 — Features + Smart Contract
- **Day 8-9**: GitHub webhook handler, auto-extract decision via LLM, push to pending queue
- **Day 10-11**: Move smart contract (workspace + seal policy), deploy to testnet, integrate to backend
- **Day 12-13**: PR Reviewer Agent (Mastra) — read PR diff, query memory, post review, save reasoning
- **Day 14**: `save_artifact` tool + integrate into agent flow

### Week 3 — Frontend + Polish
- **Day 15-16**: Dashboard pages — landing, auth, workspace setup, MCP connect guide
- **Day 17-18**: Dashboard pages — memory browser, approval queue, agent timeline, incident view
- **Day 19**: End-to-end testing, bug fixes
- **Day 20**: UI polish, error handling, demo prep
- **Day 21**: Record demo video (3 min), push to GitHub public repo, submit

**Week 3 stretch goal** (if Day 18 finishes early):
- Multi-agent demo (Implementer + Reviewer coordinate via DevMind memory)

---

## Hackathon Demo Stories

1. **Cross-tool memory** (0:30-1:00): User A uses Claude Code → saves a decision. User B uses Cursor (simulated) → immediately gets the context. *"Across tools, across users, across days"*.

2. **Long-running context** (1:00-1:30): Open a memory from 1 week ago in the dashboard, show it stored permanently on Walrus (blob ID + Walrus explorer link).

3. **Autonomous agent** (1:30-2:15): Push a PR that violates a past decision → PR Reviewer Agent automatically reviews it, referencing DevMind memory. *"No human in the loop; the agent works autonomously using memory"*.

4. **Artifact-driven** (2:15-2:45): Agent generates `drift-report.md` → `save_artifact` → next session the agent uses that report as a reference.

5. **Privacy via Seal** (2:45-3:00): Open Walrus explorer, show the blob = ciphertext. *"Team-only memory, encrypted with the Seal SDK"*.

---

## Critical Files (for implementation)

| File | Purpose |
|---|---|
| `apps/mcp-server/src/index.ts` | MCP server entry; registers 4 tools |
| `apps/mcp-server/src/tools/save-memory.ts` | save_memory handler (push to pending queue) |
| `apps/mcp-server/src/tools/get-memory.ts` | get_memory handler (semantic search + decrypt) |
| `apps/mcp-server/src/tools/save-artifact.ts` | save_artifact handler (binary blob to Walrus) |
| `apps/api/src/routes/auth.ts` | JWT + Sui wallet signature verification |
| `apps/api/src/routes/workspaces.ts` | Workspace CRUD + member management |
| `apps/api/src/routes/memories.ts` | Memory CRUD + approval endpoints |
| `apps/api/src/routes/webhook/github.ts` | GitHub webhook handler |
| `apps/api/src/services/embedding.ts` | OpenAI/DeepSeek embedding generation |
| `apps/api/src/services/scrubber.ts` | Regex secret detection (for UI highlighting) |
| `packages/memwal-client/src/index.ts` | MemWal wrapper (write/get) |
| `packages/seal-client/src/index.ts` | Seal Minimal encrypt/decrypt wrapper |
| `packages/contracts/sources/workspace.move` | Workspace registry Move contract |
| `packages/contracts/sources/seal_policy.move` | Trivial Seal policy contract |
| `apps/agent-pr-reviewer/src/index.ts` | Mastra agent definition + workflow |
| `apps/web/app/(dashboard)/approval-queue/page.tsx` | UI for approving pending memories |
| `apps/web/app/(dashboard)/memories/page.tsx` | Memory browser with workspace filter |
| `apps/web/app/(dashboard)/agent-timeline/page.tsx` | Agent execution visualization |

---

## End-to-End Verification

### Local setup
```bash
pnpm install
docker-compose up -d         # Postgres + Redis
pnpm prisma migrate dev
pnpm dev                     # Run all apps
```

### Test scenarios
1. **MCP integration**: connect Claude Code to the local MCP server, call `save_memory("test decision")`. Verify: a pending entry appears in Redis.
2. **Approval flow**: open the dashboard `/approval-queue`, approve the pending memory. Verify: blob appears on Walrus testnet, metadata in PostgreSQL.
3. **Get memory**: in Claude Code, call `get_memory("test")`. Verify: content returns (decrypted via Seal Minimal).
4. **Smart contract**: deploy to Sui testnet, create a new workspace via the dashboard. Verify: object recorded on Sui Explorer.
5. **GitHub webhook**: push a commit to a test repo, webhook handler triggers. Verify: extracted decision enters the pending queue.
6. **PR Reviewer Agent**: open a PR that violates a past decision. Verify: agent posts a review comment within 1-2 minutes, reasoning saved to DevMind.
7. **Artifact**: agent generates report.md, calls `save_artifact`. Verify: file recoverable via `get_artifact` in a later session.
8. **Privacy**: copy a blob_id from a team memory, open the public Walrus aggregator URL. Verify: content is ciphertext (unreadable).

### Minimal deployment
- Backend API + MCP server: Railway (single instance)
- Web: Vercel
- Smart contract: Sui testnet (already deployed)
- Postgres + Redis: Railway managed

---

## Out of Scope (Phase 2 Roadmap)

Items explicitly **deferred**; will be mentioned in the pitch as future work:

- Knowledge Marketplace + token economy
- Seal Full (on-chain access control)
- Multi-agent coordination beyond stretch goal
- Walrus Sites deployment for the dashboard
- Sui Stack Messaging for workspace chat
- Vercel + Sentry webhook handlers
- Mainnet deployment + storage renewal flow
- Separate SDK npm package
- BullMQ queue (for scale)
- Mobile app
- Marketplace bonus track
