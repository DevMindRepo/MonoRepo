"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import {
  BrainCircuit, Lock, Database, CheckCircle2, Fingerprint, Plug2,
  type LucideIcon,
} from "lucide-react"
import { ScrollReveal } from "@/components/app/scroll-reveal"

// ─── Code snippets per tab ────────────────────────────────────────────────────
const CODE: Record<string, string> = {
  memory: `import { DevMind } from "devmind"
import { SealClient } from "@mysten/seal"

const memory = await devmind.save({
  content: "JWT chosen for auth",
  type: "decision",
  tags: ["auth", "security"],
})

// encrypted + stored on Walrus
memory.blobId // → "8xKp3.mN9q"`,

  encrypt: `import { SealClient } from "@mysten/seal"
import { fromHex } from "@mysten/sui/utils"

const client = new SealClient({ suiClient })
const encrypted = await client.encrypt({
  message: Buffer.from(content),
  packageId: SEAL_PACKAGE_ID,
  id: workspaceId,
})

// AES-256-GCM, key managed on Sui`,

  storage: `import { WalrusClient } from "@mysten/walrus"

const walrus = new WalrusClient({
  network: "testnet",
})

const { blobId } = await walrus.writeBlob({
  blob: encrypted,
  deletable: false,
  epochs: 5,
})

// blobId indexed in PostgreSQL`,

  approve: `// GET /approval-queue
// → [{ id: "m_01", status: "pending",
//      preview: "JWT chosen for auth" }]

await fetch("/api/memories/approve", {
  method: "POST",
  body: JSON.stringify({ id: "m_01" }),
})

// triggers Seal encrypt + Walrus upload`,

  identity: `import { Transaction } from "@mysten/sui/transactions"

const tx = new Transaction()
tx.moveCall({
  target: \`\${PKG}::workspace::register\`,
  arguments: [
    tx.pure.string(workspaceName),
    tx.object(CLOCK),
  ],
})

// workspace anchored on Sui testnet`,

  connect: `// ~/.claude.json
{
  "mcpServers": {
    "devmind": {
      "command": "npx",
      "args": ["-y", "devmind-mcp"],
      "env": {
        "DEVMIND_API_URL": "https://api.devmind.io",
        "DEVMIND_TOKEN": "your-token"
      }
    }
  }
}`,
}

const LABELS: Record<string, { title: string; desc: string }> = {
  memory:   { title: "Build memory tools in minutes",  desc: "Write once, persist forever — encrypted on Walrus, anchored on Sui." },
  encrypt:  { title: "Zero-plaintext encryption",       desc: "Seal encrypts client-side before any data leaves your environment." },
  storage:  { title: "Decentralized blob storage",      desc: "Every memory lives on Walrus testnet with a verifiable blob ID." },
  approve:  { title: "Human-in-the-loop approval",      desc: "Every memory is gated behind team approval before encryption." },
  identity: { title: "On-chain workspace identity",     desc: "Workspace registry anchored on Sui Move — permissionless and auditable." },
  connect:  { title: "One-line MCP integration",        desc: "Drop into any MCP-compatible AI coding assistant in seconds." },
}

// ─── Tab definitions ──────────────────────────────────────────────────────────
interface TabDef { id: string; label: string; Icon: LucideIcon }
const TABS: TabDef[] = [
  { id: "memory",   label: "Memory",   Icon: BrainCircuit  },
  { id: "encrypt",  label: "Encrypt",  Icon: Lock          },
  { id: "storage",  label: "Storage",  Icon: Database      },
  { id: "approve",  label: "Approve",  Icon: CheckCircle2  },
  { id: "identity", label: "Identity", Icon: Fingerprint   },
  { id: "connect",  label: "Connect",  Icon: Plug2         },
]

// ─── Scramble hook ────────────────────────────────────────────────────────────
const SC = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz0123456789!@#$%&*[]{}|<>"

function useScramble(target: string, trigger: boolean) {
  const [text, setText] = useState("")
  const [done, setDone] = useState(false)
  const rafRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (!trigger) { setText(""); setDone(false); return }

    setDone(false)
    // Immediately show fully-scrambled version so no blank flash on tab switch
    setText(
      target.split("").map(ch =>
        ch === "\n" || ch === " " ? ch : SC[Math.floor(Math.random() * SC.length)]
      ).join("")
    )

    const DURATION = 1400
    const start = performance.now()

    const tick = (now: number) => {
      const progress = Math.min((now - start) / DURATION, 1)
      const revealed = Math.floor(progress * target.length)
      let out = ""
      for (let i = 0; i < target.length; i++) {
        const ch = target[i]
        if (i < revealed || ch === "\n" || ch === " ") out += ch
        else out += SC[Math.floor(Math.random() * SC.length)]
      }
      setText(out)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setText(target)
        setDone(true)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, trigger])

  return { text, done }
}

// ─── InView hook ──────────────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true) },
      { threshold }
    )
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

// ─── Syntax tokenizer ─────────────────────────────────────────────────────────
const KW = /^(import|export|from|const|let|var|await|async|new|return|function|interface|type|if|else|for|of|in|true|false|null|undefined)\b/

function tokenizeLine(line: string): ReactNode {
  const out: ReactNode[] = []
  let rest = line
  let i = 0

  while (rest.length > 0) {
    const cm = rest.match(/^\/\/.*/)
    if (cm) { out.push(<span key={i++} style={{ color: "#546E7A" }}>{cm[0]}</span>); break }

    const sm = rest.match(/^("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/)
    if (sm) { out.push(<span key={i++} style={{ color: "#C3E88D" }}>{sm[0]}</span>); rest = rest.slice(sm[0].length); continue }

    const kw = rest.match(KW)
    if (kw) { out.push(<span key={i++} style={{ color: "#C792EA" }}>{kw[0]}</span>); rest = rest.slice(kw[0].length); continue }

    const nm = rest.match(/^\b\d+\b/)
    if (nm) { out.push(<span key={i++} style={{ color: "#F78C6C" }}>{nm[0]}</span>); rest = rest.slice(nm[0].length); continue }

    const om = rest.match(/^(\w+)(\s*:)(?!=)/)
    if (om) {
      out.push(<span key={i++} style={{ color: "#F07178" }}>{om[1]}</span>)
      out.push(<span key={i++} style={{ color: "#89DDFF" }}>{om[2]}</span>)
      rest = rest.slice(om[0].length); continue
    }

    const pm = rest.match(/^[{}[\]();,.]|^=>|^[=<>!+\-*/&|^~]+/)
    if (pm) { out.push(<span key={i++} style={{ color: "#89DDFF" }}>{pm[0]}</span>); rest = rest.slice(pm[0].length); continue }

    const wm = rest.match(/^\w+/)
    if (wm) { out.push(<span key={i++} style={{ color: "#E8EDF0" }}>{wm[0]}</span>); rest = rest.slice(wm[0].length); continue }

    out.push(<span key={i++}>{rest[0]}</span>)
    rest = rest.slice(1)
  }
  return <>{out}</>
}

// ─── WindowChrome ─────────────────────────────────────────────────────────────
function WindowChrome({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#FF5F57" }} />
      <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#FEBC2E" }} />
      <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#28C840" }} />
      <span className="ml-2 text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>{title}</span>
    </div>
  )
}

// ─── CodePanel ────────────────────────────────────────────────────────────────
function CodePanel({ code, inView }: { code: string; inView: boolean }) {
  const { text, done } = useScramble(code, inView)

  const buildLines = (src: string, highlight: boolean) =>
    src.split("\n").map((line, idx) => (
      <div key={idx} className="flex items-start gap-3" style={{ lineHeight: "1.75" }}>
        <span className="text-[10px] select-none shrink-0 mt-[2px]" style={{ color: "rgba(255,255,255,0.15)" }}>•</span>
        <code className="font-mono text-[13px] whitespace-pre">
          {highlight
            ? tokenizeLine(line)
            : <span style={{ color: "#ADFF2F", opacity: 0.85 }}>{line}</span>
          }
        </code>
      </div>
    ))

  return (
    <div
      className="rounded-[16px] overflow-hidden flex flex-col"
      style={{
        background: "rgba(13,17,23,0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset",
      }}
    >
      <WindowChrome title="devmind.ts" />
      <div className="p-4 relative" style={{ minHeight: "230px" }}>
        {/* Syntax-highlighted version — fades in when done */}
        <div style={{ opacity: done ? 1 : 0, transition: done ? "opacity 0.4s ease" : "none" }}>
          {buildLines(code, true)}
        </div>
        {/* Scrambled overlay — sits on top, fades out when done */}
        <div
          className="absolute inset-0 p-4"
          style={{
            opacity: done ? 0 : 1,
            transition: done ? "opacity 0.4s ease" : "none",
            pointerEvents: "none",
          }}
        >
          {buildLines(text || code, false)}
        </div>
      </div>
    </div>
  )
}

// ─── ApprovalQueueMock ────────────────────────────────────────────────────────
function ApprovalQueueMock() {
  const ITEMS = [
    { type: "decision", text: "JWT for auth · 2h ago",       color: "#FB923C" },
    { type: "arch",     text: "Walrus blob expiry · 1h ago",  color: "#ADFF2F" },
    { type: "bug",      text: "race condition upload · 30m",  color: "#F87171" },
  ]
  return (
    <div
      className="rounded-[16px] overflow-hidden flex flex-col"
      style={{
        background: "rgba(13,17,23,0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset",
        minHeight: "230px",
      }}
    >
      <WindowChrome title="DevMind — Approval Queue" />
      <div className="p-3 flex-1 space-y-2">
        {ITEMS.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-[8px]"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: item.color }} />
              <span className="text-[13px] truncate" style={{ color: "rgba(255,255,255,0.55)" }}>
                <span style={{ color: item.color }}>{item.type}</span>{" — "}{item.text}
              </span>
            </div>
            <button
              className="shrink-0 text-[11px] px-3 py-1.5 rounded-md font-mono"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              Approve
            </button>
          </div>
        ))}
        <p className="text-[9px] font-mono pt-1 px-1" style={{ color: "rgba(255,255,255,0.2)" }}>
          3 pending · encrypted with Seal before upload
        </p>
      </div>
    </div>
  )
}

// ─── ShipSection ──────────────────────────────────────────────────────────────
export function ShipSection() {
  const [activeTab, setActiveTab] = useState("memory")
  const { ref, inView } = useInView(0.15)

  return (
    <section id="ship" className="py-16 lg:py-24" style={{ background: "#070B0E" }}>
      <div className="max-w-5xl mx-auto px-6">

        {/* Section header */}
        <ScrollReveal>
          <div className="text-center mb-14">
            <p className="text-[13px] font-mono text-[#ADFF2F] uppercase tracking-[0.25em] mb-4">
              Memory Platform
            </p>
            <h2 className="text-4xl lg:text-[52px] font-bold text-[#E8EDF0] leading-tight">
              Ship memory tools{" "}
              <span className="gradient-text-mint">in minutes</span>
            </h2>
          </div>
        </ScrollReveal>

        {/* Main card */}
        <ScrollReveal delay={100}>
          <div
            ref={ref}
            className="rounded-[24px] overflow-hidden"
            style={{
              background: "#0D1117",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
            }}
          >
            {/* Tab row */}
            <div
              className="flex items-center justify-center gap-3 p-5 flex-wrap"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              {TABS.map(({ id, label, Icon }) => {
                const active = activeTab === id
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className="group relative flex items-center justify-center rounded-[14px] transition-all duration-200 shrink-0"
                    style={{
                      width: "110px",
                      height: "64px",
                      background: active ? "rgba(173,255,47,0.10)" : "rgba(255,255,255,0.04)",
                      border: active ? "1px solid rgba(173,255,47,0.28)" : "1px solid rgba(255,255,255,0.08)",
                      color: active ? "#ADFF2F" : "rgba(255,255,255,0.5)",
                      boxShadow: active ? "0 0 20px rgba(173,255,47,0.08)" : "none",
                    }}
                  >
                    {/* Icon — hidden when active, fades on hover */}
                    <span
                      className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
                        active ? "opacity-0" : "opacity-100 group-hover:opacity-0"
                      }`}
                    >
                      <Icon size={22} />
                    </span>
                    {/* Label — shown when active, fades in on hover */}
                    <span
                      className={`absolute inset-0 flex items-center justify-center font-mono text-[13px] font-semibold tracking-wide transition-opacity duration-200 ${
                        active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      {label}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
              {/* Left: code panel */}
              <div className="flex flex-col gap-5">
                <CodePanel code={CODE[activeTab]} inView={inView} />
                <div>
                  <p className="text-white font-bold text-[20px] leading-snug">
                    {LABELS[activeTab].title}
                  </p>
                  <p className="text-[15px] mt-1.5 leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {LABELS[activeTab].desc}
                  </p>
                </div>
              </div>

              {/* Right: approval queue mock */}
              <div className="flex flex-col gap-5">
                <ApprovalQueueMock />
                <div>
                  <p className="text-white font-bold text-[20px] leading-snug">
                    Your team&apos;s memory dashboard
                  </p>
                  <p className="text-[15px] mt-1.5 leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                    Browse, approve, and manage AI memories across your team.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  )
}
