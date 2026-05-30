# Deploy DevMind — Railway + Vercel

> Backend → Railway (Docker). Frontend → Vercel (Next.js).
> Database (Supabase), Redis (Upstash), MemWal (Mysten staging) already hosted.

---

## Prerequisites

- ✅ GitHub repo: `DevMindRepo/MonoRepo` (sudah ada)
- ✅ Akun Railway (signup via GitHub di https://railway.app)
- ✅ Akun Vercel (signup via GitHub di https://vercel.com)
- ✅ Semua env vars yang ada di `.env` lokal kamu

---

## Step 1 — Deploy Backend ke Railway

### 1.1 Create Project

1. Login https://railway.app
2. **New Project** → **Deploy from GitHub repo**
3. Pilih `DevMindRepo/MonoRepo`
4. Railway auto-detect `Dockerfile` di root + `railway.json`

### 1.2 Set Environment Variables

Di Railway dashboard → **Variables** tab → klik **Raw Editor**, paste seluruh ini, ganti value-nya pakai value asli dari `.env` kamu:

```
# Database (Supabase)
DATABASE_URL=postgresql://...pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://...pooler.supabase.com:5432/postgres

# Redis (Upstash)
REDIS_URL=rediss://default:xxx@xxx.upstash.io:6379

# Auth
JWT_SECRET=...

# Sui
SUI_NETWORK=testnet
SUI_MASTER_WALLET_KEY=...
WORKSPACE_REGISTRY_PACKAGE_ID=0xfd29d3cf0786abbdc5eecb70bb017492500c5c15817b34b5ac1d3c8cfbf99f4e
SEAL_POLICY_PACKAGE_ID=0xfd29d3cf0786abbdc5eecb70bb017492500c5c15817b34b5ac1d3c8cfbf99f4e
SEAL_POLICY_OBJECT_ID=0x619c24c7d2728a9885ba3a70bf02d40e81ae18d7875e9a427f72b95593b501dd

# Walrus
WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space

# MemWal
MEMWAL_RELAYER_URL=https://relayer.staging.memwal.ai
MEMWAL_ACCOUNT_ID=...
MEMWAL_DELEGATE_KEY=...

# Gemini
GEMINI_API_KEY=...
GEMINI_CHAT_MODEL=gemini-2.5-flash-lite

# GitHub
GITHUB_WEBHOOK_SECRET=...
GITHUB_APP_TOKEN=...

# Pending queue
PENDING_TTL_SECONDS=86400

# Railway-injected
NODE_ENV=production
```

`PORT` jangan di-set — Railway injects automatically.

### 1.3 Deploy

- Klik **Deploy**
- Tunggu ~3-5 menit
- Logs harus muncul: `DevMind API listening on :XXXX (testnet)` + `Incident worker started`

### 1.4 Generate Public Domain

- Tab **Settings** → **Networking** → klik **Generate Domain**
- Dapat URL seperti `https://devmind-backend-production-xxxx.up.railway.app`
- **SIMPAN URL INI** — dipakai di Vercel + MCP config

### 1.5 Verify

```bash
curl https://devmind-backend-production-xxxx.up.railway.app/health
# Expected: {"status":"ok","network":"testnet","ts":...}
```

---

## Step 2 — Deploy Frontend ke Vercel

### 2.1 Import Project

1. Login https://vercel.com
2. **Add New** → **Project**
3. Pilih `DevMindRepo/MonoRepo`
4. **Root Directory**: ketik `frontend` (penting!)
5. **Framework Preset**: Next.js (auto-detected)

### 2.2 Set Environment Variables

Sebelum klik Deploy, expand **Environment Variables**, tambah:

```
NEXT_PUBLIC_API_URL=https://devmind-backend-production-xxxx.up.railway.app
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_SUI_EXPLORER=https://suiscan.xyz/testnet
NEXT_PUBLIC_WALRUS_AGGREGATOR=https://aggregator.walrus-testnet.walrus.space
```

(Replace `NEXT_PUBLIC_API_URL` dengan Railway URL dari Step 1.4)

### 2.3 Build Settings (auto-detected, verify)

- **Install Command**: `pnpm install` (atau biarkan default)
- **Build Command**: `pnpm build` (auto)
- **Output Directory**: `.next` (auto)

### 2.4 Deploy

- Klik **Deploy**
- Tunggu ~3 menit
- Dapat URL `https://monorepo-frontend-xxx.vercel.app` (atau custom domain)

### 2.5 Verify

Buka URL → harus muncul landing page DevMind. Click **Login** → connect wallet → bisa masuk dashboard.

---

## Step 3 — Update MCP & Monitor Config

### 3.1 Update Claude Code MCP (`~/.claude.json`)

Ganti localhost:3001 ke Railway URL:

```json
{
  "mcpServers": {
    "devmind": {
      "command": "devmind-mcp",
      "env": {
        "DEVMIND_API_BASE_URL": "https://devmind-backend-production-xxxx.up.railway.app",
        "DEVMIND_API_TOKEN": "dm_sk_...",
        "DEVMIND_WORKSPACE_ID": "..."
      }
    }
  }
}
```

Restart Claude Code → MCP sekarang konek ke Railway, bukan lokal.

### 3.2 Update CashLog `.env`

```
DEVMIND_API_BASE_URL=https://devmind-backend-production-xxxx.up.railway.app
DEVMIND_API_TOKEN=dm_sk_...
DEVMIND_WORKSPACE_ID=...
```

CashLog backend (devmind-monitor SDK) sekarang kirim incidents ke Railway.

---

## Step 4 — End-to-end Test

1. Buka Vercel URL → login dengan wallet
2. Save memory dari Claude Code (yang udah update config) → muncul di `/approval-queue` di Vercel
3. Approve → memory ke Walrus
4. CashLog `npm start` → trigger error → muncul di `/incidents` di Vercel

---

## Troubleshooting

### Backend deploy fail di Railway

**Error**: `pnpm not found`
- Dockerfile pakai `corepack enable && corepack prepare pnpm@10.27.0` — should work
- Coba force redeploy

**Error**: Prisma client mismatch
- Railway perlu install Prisma client di build stage
- Dockerfile sudah `prisma generate` di build script (`prisma generate && tsc`)

**Error**: Crash di start, log: "Invalid environment variables"
- Cek env vars di Railway dashboard — pasti ada yang miss
- Khusus `SUI_MASTER_WALLET_KEY` — pastikan format benar (mnemonic atau bech32)

### Frontend deploy fail di Vercel

**Error**: Type error saat build
- Run `pnpm typecheck` lokal dulu untuk catch
- Vercel use strict TypeScript build by default

**Error**: Missing env var
- Cek Vercel dashboard Environment Variables — semua 4 var harus di-set
- Re-deploy after add

### CORS error

Backend `cors({ origin: true })` allows all — should work. Kalau masih error:
- Tambah Vercel domain explicit di `app.register(cors, { origin: [...] })`
- Re-deploy backend

### MCP server gagal connect

- Test endpoint health: `curl https://railway-url/health`
- Cek `DEVMIND_API_TOKEN` di `~/.claude.json` masih valid (belum di-revoke)
- Logout/login di Vercel UI untuk dapat token baru kalau perlu

---

## Cost Estimate

| Service | Free Tier | After Free |
|---|---|---|
| Railway | $5 trial credit | $5+/month (Hobby plan) |
| Vercel | Generous, no card needed | $20/month (Pro) |
| Supabase | 500MB DB, 50K MAU | $25/month (Pro) |
| Upstash | 10K commands/day | $10/month (Pay-as-you-go) |

Buat hackathon, **free tier cukup**.

---

## Post-Deploy Checklist

- [ ] Backend `/health` return 200
- [ ] Frontend home page load
- [ ] Login dengan wallet success
- [ ] `/memories` page tampil (mungkin kosong kalau workspace baru)
- [ ] Buat workspace via `/onboarding` (on-chain tx jalan)
- [ ] Save memory via Claude Code (dengan API URL Railway) → muncul di `/approval-queue`
- [ ] Approve memory → blob ID muncul (Walrus terhubung)
- [ ] Trigger incident → 3-agent pipeline jalan
- [ ] Update README di repo dengan link URL hidup
