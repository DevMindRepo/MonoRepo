# Resources & Reference Knowledge Base — DevMind

> File ini berisi semua referensi yang harus tim baca/install sebelum coding. Setiap anggota tim wajib baca section yang sesuai dengan role mereka (lihat [PLAN.md](./PLAN.md) untuk pembagian role).

---

## 🧭 Quick Reference per Role

| Role | Essential Reading | MCP Servers |
|---|---|---|
| **Role 1 (Web3)** | Sui Move Intro Course, Move Book, Security Best Practices | sui-agent-mcp, Motion Sui Developer MCP |
| **Role 2 (Backend/MCP)** | MCP TypeScript SDK, Mastra docs | 0xdwong/sui-mcp (untuk integrasi) |
| **Role 3 (Frontend)** | Next.js docs, shadcn/ui, Mysten dapp-kit | — |

---

## 📚 Learning Resources

### 🔹 Sui Move & Smart Contracts (Role 1 — WAJIB)

| Resource | Tujuan | Priority |
|---|---|---|
| [Sui Move Intro Course](https://github.com/sui-foundation/sui-move-intro-course) | Course resmi Sui Foundation — basics → advanced Move | 🔴 Essential |
| [Move Book](https://move-book.com/) | Komprehensif reference Move language | 🔴 Essential |
| [Sui Docs](https://docs.sui.io/) | Official Sui documentation | 🔴 Essential |
| [Sui Examples](https://github.com/MystenLabs/sui/tree/main/examples) | Code examples resmi (NFT, DeFi, game, dll) | 🟡 Important |
| [Sui Main Repo](https://github.com/MystenLabs/sui/) | Source code utama Sui (untuk lihat best practices) | 🟢 Reference |
| [awesome-sui](https://github.com/sui-foundation/awesome-sui) | Curated list ekosistem Sui (tools, libraries, projects) | 🟡 Important |
| [sui-dev-skill](https://github.com/Nebryx/sui-dev-skill) | Skill progression guide untuk Sui developer | 🟢 Optional |

### 🔹 Security (Role 1 — WAJIB sebelum deploy contract)

| Resource | Tujuan | Priority |
|---|---|---|
| [Sui Security Best Practices](https://blog.sui.io/security-best-practices/) | Patterns yang harus dihindari saat tulis Move | 🔴 Essential |

### 🔹 Walrus & Storage (Role 1)

| Resource | Tujuan | Priority |
|---|---|---|
| [Walrus Docs](https://docs.wal.app/) | Walrus official documentation | 🔴 Essential |
| [Walrus TypeScript SDK](https://sdk.mystenlabs.com/walrus) | API reference `@mysten/walrus` | 🔴 Essential |
| [Walrus HTTP API](https://docs.wal.app/docs/http-api/storing-blobs) | Alternatif kalau SDK bermasalah | 🟡 Important |
| [Public Aggregators](https://docs.wal.app/docs/system-overview/public-aggregators-and-publishers) | Endpoint publik untuk testing | 🟡 Important |

### 🔹 MemWal (Role 1 & 2 — WAJIB karena pilihan track)

| Resource | Tujuan | Priority |
|---|---|---|
| [MemWal Docs](https://docs.memwal.ai/) | Memory abstraction layer di atas Walrus | 🔴 Essential |
| [MemWal Playground](https://memwal.ai/) | Test interaktif + buat delegate key untuk agent | 🔴 Essential |
| [MemWal GitHub](https://github.com/MystenLabs/MemWal) | Sample apps + skills + source code | 🟡 Important |

### 🔹 Seal (Role 1 — Privacy Layer)

| Resource | Tujuan | Priority |
|---|---|---|
| [Seal Docs](https://seal-docs.wal.app/) | Threshold encryption untuk Walrus | 🔴 Essential |
| [Seal Mainnet Launch Blog](https://www.mystenlabs.com/blog/seal-mainnet-launch-privacy-access-control) | Konteks recent launch + capabilities | 🟢 Reference |

### 🔹 MCP Protocol (Role 2 — WAJIB)

| Resource | Tujuan | Priority |
|---|---|---|
| [MCP Specification](https://modelcontextprotocol.io/) | Protocol definition + concepts | 🔴 Essential |
| [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) | SDK yang kita pakai untuk MCP server | 🔴 Essential |
| [Claude Code MCP Guide](https://code.claude.com/docs/en/mcp) | Cara user connect MCP ke Claude Code | 🔴 Essential |

### 🔹 Agent Framework (Role 2 — WAJIB untuk PR Reviewer)

| Resource | Tujuan | Priority |
|---|---|---|
| [Mastra Docs](https://mastra.ai) | Framework agent yang kita pakai | 🔴 Essential |

### 🔹 Backend Stack (Role 2)

| Resource | Tujuan | Priority |
|---|---|---|
| [Fastify Docs](https://fastify.dev/) | Web framework | 🔴 Essential |
| [Prisma Docs](https://www.prisma.io/docs) | ORM + migrations | 🔴 Essential |
| [pgvector](https://github.com/pgvector/pgvector) | Semantic search extension | 🟡 Important |
| [BullMQ Docs](https://bullmq.io/) | Queue (kalau scale; MVP pakai Redis cache) | 🟢 Reference |

### 🔹 Frontend Stack (Role 3 — WAJIB)

| Resource | Tujuan | Priority |
|---|---|---|
| [Next.js Docs](https://nextjs.org/docs) | Framework utama | 🔴 Essential |
| [shadcn/ui](https://ui.shadcn.com/) | Component library | 🔴 Essential |
| [Tailwind CSS](https://tailwindcss.com/docs) | Styling | 🔴 Essential |
| [Mysten dapp-kit](https://sdk.mystenlabs.com/dapp-kit) | Sui wallet connect | 🔴 Essential |
| [TanStack Query](https://tanstack.com/query/latest) | Data fetching | 🟡 Important |
| [Zustand](https://github.com/pmndrs/zustand) | State management | 🟡 Important |

---

## 🤖 MCP Servers untuk Sui Development

MCP servers berikut bisa di-install di Claude Code untuk meningkatkan kemampuan AI saat kerja dengan Sui. Sangat dianjurkan untuk **Role 1 (Web3 Engineer)**.

### 1. **sui-agent-mcp** (EasonC13-agent) — Primary

**Tujuan**: Interaksi langsung dengan Sui blockchain dari Claude Code (deploy contract, query objects, simulate transactions, dll)

> ⚠️ **WAJIB di-install oleh setiap anggota tim secara lokal** (terutama Role 1). MCP server di-register per project local config, jadi tidak otomatis ter-share saat clone repo. Setiap anggota tim harus jalankan command install di local environment mereka masing-masing.

**Install via npm (RECOMMENDED — 1 command, paling cepat)**:
```bash
# Pastikan kamu sedang di folder e:\devmind (atau project root DevMind)
claude mcp add sui -- npx -y sui-agent-mcp
```

**Alternative — clone source** (kalau mau modifikasi/study internal MCP):
```bash
git clone https://github.com/EasonC13-agent/sui-mcp.git
cd sui-mcp
pnpm install && pnpm build
# Lalu register MCP manual via ~/.claude.json
```

**Verifikasi install berhasil**:
1. Restart Claude Code (atau buka session baru di project)
2. Jalankan slash command: `/mcp`
3. Harus muncul `sui` server dengan status **"connected"**
4. Test capability: tanya Claude "list tools dari sui MCP server"
5. Kalau berhasil, akan muncul list tools seperti `deploy_contract`, `query_object`, dll

**Troubleshooting**:
- ❌ Status "failed" → cek `npx -y sui-agent-mcp --version` di terminal, pastikan npm bisa download package
- ❌ Server tidak muncul → cek `C:\Users\<user>\.claude.json` ada entry `"sui"` di `mcpServers`
- ❌ Tools tidak muncul → restart Claude Code total (close + open lagi)

**Yang bisa dilakukan dengan sui-agent-mcp**:
- ✅ Cek balance wallet
- ✅ Deploy Move contract
- ✅ Call contract functions
- ✅ Query Sui objects
- ✅ Simulate transactions

**Tanggung jawab per role**:
- **Role 1**: WAJIB install (akan dipakai harian untuk deploy & test Move contract)
- **Role 2**: RECOMMENDED (untuk debug saat integrate backend dengan contract)
- **Role 3**: OPTIONAL (jarang interact langsung dengan blockchain)

---

### 2. **0xdwong/sui-mcp** — Wallet & Blockchain Interactions

**Tujuan**: Fokus ke wallet operations + blockchain queries

**GitHub**: https://github.com/0xdwong/sui-mcp

**Cocok untuk**:
- Role 1 (saat develop wallet integration)
- Role 2 (saat integrate backend dengan Sui)

---

### 3. **tamago-labs/sui-mcp** — DeFi & Smart Contract

**Tujuan**: Focus DeFi flows + smart contract operations

**GitHub**: https://github.com/tamago-labs/sui-mcp

**Cocok untuk**:
- Role 1 saat butuh DeFi-style smart contract patterns (kurang relevan untuk DevMind, tapi bagus sebagai reference)

---

### 4. **Motion Ecosystem Sui Developer MCP** — Semantic Search & Code Analysis

**Tujuan**: Semantic search di codebase Sui + code analysis specific to Sui patterns

**Cocok untuk**:
- Role 1 saat butuh "cari pattern Move yang serupa di ekosistem"
- Reference saat ketemu masalah unfamiliar

---

## 🚀 Setup Instructions untuk Tim

### Sebelum Hari 1 (Pre-Setup)

**Semua anggota tim**:
1. Install Claude Code CLI: https://claude.com/code
2. Install Node.js 20+: https://nodejs.org
3. Install pnpm: `npm install -g pnpm`
4. Install Docker Desktop: https://www.docker.com/products/docker-desktop/

**Role 1 (Web3) tambahan**:
1. Install Sui CLI: https://docs.sui.io/guides/developer/getting-started/sui-install
2. Setup Sui wallet (testnet): generate keypair, request faucet
3. Install MCP sui-agent-mcp:
   ```bash
   claude mcp add sui -- npx -y sui-agent-mcp
   ```
4. Verify: di Claude Code, jalankan slash command `/mcp` untuk check `sui` server connected

**Role 2 (Backend) tambahan**:
1. Setup OpenAI/DeepSeek/Claude API key untuk embedding & LLM
2. (Optional) Install 0xdwong/sui-mcp untuk debug blockchain interactions
3. Setup local Postgres + Redis (akan dihandle docker-compose nanti)

**Role 3 (Frontend) tambahan**:
1. Install browser extension Sui wallet (Suiet atau Sui Wallet): https://suiet.app/
2. Setup development environment Next.js (familiar dengan App Router)

---

## 📖 Reading Plan — Hari 1 (Sebelum Tulis Kode)

### Role 1 (Web3 Engineer) — 4-6 jam reading

1. ⏱️ **1 jam**: [Sui Docs Quickstart](https://docs.sui.io/guides/developer/getting-started)
2. ⏱️ **2 jam**: [Sui Move Intro Course](https://github.com/sui-foundation/sui-move-intro-course) — Chapter 1-3
3. ⏱️ **1 jam**: [Walrus Docs Getting Started](https://docs.wal.app/docs/getting-started)
4. ⏱️ **30 menit**: [MemWal Docs Overview](https://docs.memwal.ai/)
5. ⏱️ **30 menit**: [Seal Docs Overview](https://seal-docs.wal.app/)
6. ⏱️ **30 menit**: [Sui Security Best Practices](https://blog.sui.io/security-best-practices/)

### Role 2 (Backend Engineer) — 3-4 jam reading

1. ⏱️ **1 jam**: [MCP Specification](https://modelcontextprotocol.io/) — concepts + protocol
2. ⏱️ **1 jam**: [MCP TypeScript SDK README](https://github.com/modelcontextprotocol/typescript-sdk)
3. ⏱️ **1 jam**: [Mastra Quickstart](https://mastra.ai)
4. ⏱️ **30 menit**: [Claude Code MCP Configuration](https://code.claude.com/docs/en/mcp)
5. ⏱️ **30 menit**: [pgvector basics](https://github.com/pgvector/pgvector)

### Role 3 (Frontend Engineer) — 2-3 jam reading

1. ⏱️ **30 menit**: [Next.js 14 App Router](https://nextjs.org/docs/app)
2. ⏱️ **30 menit**: [shadcn/ui setup](https://ui.shadcn.com/docs/installation)
3. ⏱️ **1 jam**: [Mysten dapp-kit](https://sdk.mystenlabs.com/dapp-kit) — wallet integration patterns
4. ⏱️ **30 menit**: Sketch UI mockups di Figma/code

---

## 🔄 Update Resource List

File ini akan terus berkembang. Kalau tim ketemu resource baru yang berguna:
1. Tambah ke section yang relevan
2. Set priority (🔴 Essential / 🟡 Important / 🟢 Reference)
3. Update `Last updated` di bawah

**Last updated**: Initial creation
