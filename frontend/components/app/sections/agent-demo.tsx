"use client"
import Link from "next/link"
import { Terminal, Search, Code2, Zap, ArrowRight, BookOpen } from "lucide-react"
import { ScrollReveal } from "@/components/app/scroll-reveal"

const PILL_LINKS = [
  { label: "npm create devmind", href: "#", mono: true },
  { label: "MCP Docs", href: "#" },
  { label: "Templates", href: "#" },
  { label: "Agent Guide", href: "#" },
  { label: "Community", href: "#" },
]

// ─── Shared glass card style ──────────────────────────────────────────────────
const glass = {
  background: "rgba(14,18,24,0.72)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.07)",
  boxShadow: "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 24px 48px rgba(0,0,0,0.35)",
} as React.CSSProperties

// ─── Preview components ───────────────────────────────────────────────────────
function MacChrome({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-3">
      <span className="h-2 w-2 rounded-full bg-[#FF5F57]" />
      <span className="h-2 w-2 rounded-full bg-[#FFBD2E]" />
      <span className="h-2 w-2 rounded-full bg-[#28CA41]" />
      <span className="ml-2 text-[#4B5563] text-[10px] font-mono">{label}</span>
    </div>
  )
}

function PRReviewerPreview() {
  return (
    <div className="rounded-xl p-4 font-mono text-xs leading-relaxed" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}>
      <MacChrome label="agent.log" />
      <div className="space-y-1.5">
        <p className="text-[#8B96A0]"><span className="text-[#ADFF2F]">→</span> PR #247 opened: switch auth to sessions</p>
        <p className="text-[#ADFF2F]">get_memory(&quot;auth decision&quot;)</p>
        <p className="text-[#8B96A0] pl-3">Found: JWT chosen 2024-11-15</p>
        <p className="text-[#8B96A0] pl-3 truncate">stateless scalability rationale</p>
        <p className="text-[#FBBF24]">post_review: warning flagged</p>
        <p className="text-[#8B96A0] pl-3 text-[10px]">⚠ contradicts arch/auth-2024-11-15</p>
      </div>
    </div>
  )
}

function MemoryBrowserPreview() {
  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <Search className="h-3.5 w-3.5 shrink-0 text-[#4B5563]" />
        <span className="text-xs font-mono text-[#4B5563]">auth implementation decision…</span>
      </div>
      <div className="space-y-1.5">
        {[
          { type: "decision", title: "JWT over sessions",       date: "2024-11-15" },
          { type: "arch",     title: "Redis not required MVP",  date: "2024-11-20" },
          { type: "decision", title: "Sui wallet identity",     date: "2024-12-01" },
        ].map((item) => (
          <div key={item.title} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="flex items-center gap-2 min-w-0">
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-mono ${item.type === "decision" ? "bg-[rgba(173,255,47,0.1)] text-[#ADFF2F]" : "bg-[rgba(251,191,36,0.1)] text-[#FBBF24]"}`}>{item.type}</span>
              <span className="text-xs text-[#E8EDF0] truncate">{item.title}</span>
            </div>
            <span className="shrink-0 text-[10px] font-mono text-[#4B5563] ml-2">{item.date}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MCPConfigPreview() {
  return (
    <div className="rounded-xl p-4 font-mono text-xs leading-relaxed overflow-hidden" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}>
      <MacChrome label="~/.claude.json" />
      <pre className="text-[11px] leading-5 overflow-hidden">
        <span className="text-[#8B96A0]">{"{"}</span>{"\n"}
        <span className="text-[#8B96A0]">{"  "}</span><span className="text-[#ADFF2F]">&quot;mcpServers&quot;</span><span className="text-[#8B96A0]">{": {"}</span>{"\n"}
        <span className="text-[#8B96A0]">{"    "}</span><span className="text-[#ADFF2F]">&quot;devmind&quot;</span><span className="text-[#8B96A0]">{": {"}</span>{"\n"}
        <span className="text-[#8B96A0]">{"      "}</span><span className="text-[#FBBF24]">&quot;command&quot;</span><span className="text-[#8B96A0]">{": "}</span><span className="text-[#A3E635]">&quot;npx&quot;</span><span className="text-[#8B96A0]">{","}</span>{"\n"}
        <span className="text-[#8B96A0]">{"      "}</span><span className="text-[#FBBF24]">&quot;args&quot;</span><span className="text-[#8B96A0]">{": ["}</span>{"\n"}
        <span className="text-[#8B96A0]">{"        "}</span><span className="text-[#A3E635]">&quot;devmind-mcp&quot;</span>{"\n"}
        <span className="text-[#8B96A0]">{"      ]"}</span>{"\n"}
        <span className="text-[#8B96A0]">{"    }"}</span>{"\n"}
        <span className="text-[#8B96A0]">{"  }"}</span>{"\n"}
        <span className="text-[#8B96A0]">{"}"}</span>
      </pre>
    </div>
  )
}

function CLIPreview() {
  return (
    <div className="rounded-xl p-5 font-mono text-sm leading-relaxed" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}>
      <MacChrome label="terminal" />
      <div className="space-y-2">
        <p><span className="text-[#ADFF2F]">$</span><span className="text-[#E8EDF0]"> npm create devmind@latest</span></p>
        <p className="text-[#4B5563] text-xs">Creating your DevMind workspace…</p>
        <p className="text-[#8B96A0] text-xs"><span className="text-[#28CA41]">✓</span> Workspace created</p>
        <p className="text-[#8B96A0] text-xs"><span className="text-[#28CA41]">✓</span> Sui contract deployed</p>
        <p className="text-[#8B96A0] text-xs"><span className="text-[#28CA41]">✓</span> MCP server started</p>
        <p className="text-[#8B96A0] text-xs"><span className="text-[#28CA41]">✓</span> Claude Code connected</p>
        <p className="mt-3 text-[#ADFF2F] text-xs">Ready. Your AI remembers everything.</p>
      </div>
    </div>
  )
}

import type React from "react"

const TOP_CARDS = [
  { icon: Terminal, title: "PR Reviewer Agent",  subtitle: "Autonomous code review with team memory",       preview: <PRReviewerPreview /> },
  { icon: Search,   title: "Memory Browser",      subtitle: "Semantic search across your workspace memories", preview: <MemoryBrowserPreview /> },
  { icon: Code2,    title: "MCP Integration",     subtitle: "Connect Claude Code in 60 seconds",             preview: <MCPConfigPreview /> },
]

export function AgentDemoSection() {
  return (
    <section
      id="agent-demo"
      className="py-16 md:py-24 px-4 md:px-6 border-t border-[rgba(255,255,255,0.04)] overflow-x-hidden"
    >
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <ScrollReveal>
          <div className="mb-14 text-center space-y-5">
            <p className="text-xs font-mono tracking-widest uppercase text-[#ADFF2F]">Autonomous Agents</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#E8EDF0]">
              Build with DevMind
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {PILL_LINKS.map((pill) => (
                <Link key={pill.label} href={pill.href}
                  className={`inline-flex items-center rounded-full border border-[rgba(255,255,255,0.08)] px-3 py-1.5 text-xs text-[#8B96A0] transition-all duration-200 hover:border-[rgba(173,255,47,0.3)] hover:text-[#E8EDF0] hover:bg-[rgba(173,255,47,0.04)] ${pill.mono ? "font-mono" : ""}`}
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  {pill.label}
                </Link>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Bento grid */}
        <div className="space-y-3">

          {/* Top row — 3 equal cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
            {TOP_CARDS.map(({ icon: Icon, title, subtitle, preview }, i) => (
              <ScrollReveal key={title} delay={i * 80} className="h-full">
                <div
                  className="group h-full rounded-2xl p-5 flex flex-col gap-4 transition-all duration-300 cursor-default"
                  style={{
                    ...glass,
                    transition: "border-color 300ms, box-shadow 300ms",
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget
                    el.style.borderColor = "rgba(173,255,47,0.18)"
                    el.style.boxShadow = "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 24px 48px rgba(0,0,0,0.4), 0 0 40px rgba(173,255,47,0.04)"
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget
                    el.style.borderColor = "rgba(255,255,255,0.07)"
                    el.style.boxShadow = "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 24px 48px rgba(0,0,0,0.35)"
                  }}
                >
                  <div className="flex-1">{preview}</div>
                  <div className="space-y-1 shrink-0">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 shrink-0 text-[#ADFF2F]" />
                      <h3 className="text-sm font-semibold text-[#E8EDF0]">{title}</h3>
                    </div>
                    <p className="text-xs text-[#8B96A0] leading-relaxed pl-6">{subtitle}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">

            {/* Left wide card */}
            <ScrollReveal className="lg:col-span-3 h-full">
              <div
                className="h-full rounded-2xl p-6 flex flex-col gap-5 transition-all duration-300 cursor-default"
                style={glass}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  el.style.borderColor = "rgba(173,255,47,0.18)"
                  el.style.boxShadow = "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 24px 48px rgba(0,0,0,0.4), 0 0 40px rgba(173,255,47,0.04)"
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.borderColor = "rgba(255,255,255,0.07)"
                  el.style.boxShadow = "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 24px 48px rgba(0,0,0,0.35)"
                }}
              >
                <div className="flex-1"><CLIPreview /></div>
                <div className="space-y-1 shrink-0">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 shrink-0 text-[#ADFF2F]" />
                    <h3 className="text-base font-semibold text-[#E8EDF0]">Zero to memory in 5 minutes</h3>
                  </div>
                  <p className="text-sm text-[#8B96A0] leading-relaxed pl-6">Ship your first persistent AI memory in one command</p>
                </div>
              </div>
            </ScrollReveal>

            {/* Right column — 2 compact stacked cards */}
            <div className="lg:col-span-2 flex flex-col gap-3">

              <ScrollReveal delay={80} className="flex-1 min-h-0">
                <div
                  className="h-full rounded-2xl p-5 flex flex-col gap-4 transition-all duration-300 cursor-default"
                  style={glass}
                  onMouseEnter={e => {
                    const el = e.currentTarget
                    el.style.borderColor = "rgba(173,255,47,0.18)"
                    el.style.boxShadow = "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 24px 48px rgba(0,0,0,0.4), 0 0 40px rgba(173,255,47,0.04)"
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget
                    el.style.borderColor = "rgba(255,255,255,0.07)"
                    el.style.boxShadow = "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 24px 48px rgba(0,0,0,0.35)"
                  }}
                >
                  <BookOpen className="h-5 w-5 text-[#ADFF2F]" />
                  <p className="text-sm text-[#8B96A0] leading-relaxed">
                    Get started quickly with pre-built DevMind workflows and integrations.
                  </p>
                  <Link href="#"
                    className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-[#ADFF2F] transition-all duration-200 hover:bg-[rgba(173,255,47,0.15)] w-fit"
                    style={{ background: "rgba(173,255,47,0.08)", border: "1px solid rgba(173,255,47,0.18)" }}
                  >
                    Explore templates <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={160} className="flex-1 min-h-0">
                <div
                  className="h-full rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 cursor-default"
                  style={glass}
                  onMouseEnter={e => {
                    const el = e.currentTarget
                    el.style.borderColor = "rgba(173,255,47,0.18)"
                    el.style.boxShadow = "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 24px 48px rgba(0,0,0,0.4), 0 0 40px rgba(173,255,47,0.04)"
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget
                    el.style.borderColor = "rgba(255,255,255,0.07)"
                    el.style.boxShadow = "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 24px 48px rgba(0,0,0,0.35)"
                  }}
                >
                  <Terminal className="h-5 w-5 text-[#ADFF2F]" />
                  <div>
                    <p className="text-sm font-semibold text-[#E8EDF0]">MCP Course — DevMind 101</p>
                    <p className="text-xs text-[#8B96A0] mt-0.5">Introduced by the DevMind team</p>
                  </div>
                  <Link href="#"
                    className="inline-flex items-center gap-1.5 text-xs text-[#ADFF2F] hover:text-[#C8FF52] transition-colors duration-200 w-fit"
                  >
                    Start learning <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </ScrollReveal>

            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
