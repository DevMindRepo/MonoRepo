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

function PRReviewerPreview() {
  return (
    <div className="rounded-xl bg-[#0D1117] border border-[rgba(255,255,255,0.06)] p-4 font-mono text-xs leading-relaxed">
      <div className="flex items-center gap-1.5 mb-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28CA41]" />
        <span className="ml-2 text-[#4B5563] text-[10px]">agent.log</span>
      </div>
      <div className="space-y-1.5">
        <p className="text-[#8B96A0]">
          <span className="text-[#ADFF2F]">→</span> PR #247 opened: switch auth to sessions
        </p>
        <p className="text-[#ADFF2F]">get_memory(&quot;auth decision&quot;)</p>
        <p className="text-[#8B96A0] pl-3">
          Found: JWT chosen 2024-11-15
        </p>
        <p className="text-[#8B96A0] pl-3 truncate">
          stateless scalability rationale
        </p>
        <p className="text-[#FBBF24]">post_review: warning flagged</p>
        <p className="text-[#8B96A0] pl-3 text-[10px]">
          ⚠ contradicts arch/auth-2024-11-15
        </p>
      </div>
    </div>
  )
}

function MemoryBrowserPreview() {
  return (
    <div className="rounded-xl bg-[#0D1117] border border-[rgba(255,255,255,0.06)] p-4 space-y-3">
      <div className="flex items-center gap-2 rounded-lg bg-[#161D22] border border-[rgba(255,255,255,0.06)] px-3 py-2">
        <Search className="h-3.5 w-3.5 shrink-0 text-[#4B5563]" />
        <span className="text-xs font-mono text-[#4B5563]">auth implementation decision&hellip;</span>
      </div>
      <div className="space-y-2">
        {[
          { type: "decision", title: "JWT over sessions", date: "2024-11-15" },
          { type: "arch", title: "Redis not required MVP", date: "2024-11-20" },
          { type: "decision", title: "Sui wallet identity", date: "2024-12-01" },
        ].map((item) => (
          <div
            key={item.title}
            className="flex items-center justify-between rounded-lg bg-[#161D22] border border-[rgba(255,255,255,0.04)] px-3 py-2"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-mono ${
                  item.type === "decision"
                    ? "bg-[rgba(173,255,47,0.1)] text-[#ADFF2F]"
                    : "bg-[rgba(251,191,36,0.1)] text-[#FBBF24]"
                }`}
              >
                {item.type}
              </span>
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
    <div className="rounded-xl bg-[#0D1117] border border-[rgba(255,255,255,0.06)] p-4 font-mono text-xs leading-relaxed overflow-hidden">
      <div className="flex items-center gap-1.5 mb-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28CA41]" />
        <span className="ml-2 text-[#4B5563] text-[10px]">~/.claude.json</span>
      </div>
      <pre className="text-[11px] leading-5 overflow-hidden">
        <span className="text-[#8B96A0]">{"{"}</span>{"\n"}
        <span className="text-[#8B96A0]">{"  "}</span>
        <span className="text-[#ADFF2F]">&quot;mcpServers&quot;</span>
        <span className="text-[#8B96A0]">{": {"}</span>{"\n"}
        <span className="text-[#8B96A0]">{"    "}</span>
        <span className="text-[#ADFF2F]">&quot;devmind&quot;</span>
        <span className="text-[#8B96A0]">{": {"}</span>{"\n"}
        <span className="text-[#8B96A0]">{"      "}</span>
        <span className="text-[#FBBF24]">&quot;command&quot;</span>
        <span className="text-[#8B96A0]">{": "}</span>
        <span className="text-[#A3E635]">&quot;npx&quot;</span>
        <span className="text-[#8B96A0]">{","}</span>{"\n"}
        <span className="text-[#8B96A0]">{"      "}</span>
        <span className="text-[#FBBF24]">&quot;args&quot;</span>
        <span className="text-[#8B96A0]">{": ["}</span>{"\n"}
        <span className="text-[#8B96A0]">{"        "}</span>
        <span className="text-[#A3E635]">&quot;devmind-mcp&quot;</span>{"\n"}
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
    <div className="rounded-xl bg-[#0D1117] border border-[rgba(255,255,255,0.06)] p-5 font-mono text-sm leading-relaxed">
      <div className="flex items-center gap-1.5 mb-4">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28CA41]" />
        <span className="ml-2 text-[#4B5563] text-[10px]">terminal</span>
      </div>
      <div className="space-y-2">
        <p>
          <span className="text-[#ADFF2F]">$</span>
          <span className="text-[#E8EDF0]"> npm create devmind@latest</span>
        </p>
        <p className="text-[#4B5563] text-xs">Creating your DevMind workspace&hellip;</p>
        <p className="text-[#8B96A0] text-xs">
          <span className="text-[#28CA41]">✓</span> Workspace created
        </p>
        <p className="text-[#8B96A0] text-xs">
          <span className="text-[#28CA41]">✓</span> Sui contract deployed
        </p>
        <p className="text-[#8B96A0] text-xs">
          <span className="text-[#28CA41]">✓</span> MCP server started
        </p>
        <p className="text-[#8B96A0] text-xs">
          <span className="text-[#28CA41]">✓</span> Claude Code connected
        </p>
        <p className="mt-3 text-[#ADFF2F] text-xs">
          Ready. Your AI remembers everything.
        </p>
      </div>
    </div>
  )
}

const TOP_CARDS = [
  {
    icon: Terminal,
    title: "PR Reviewer Agent",
    subtitle: "Autonomous code review with team memory",
    preview: <PRReviewerPreview />,
  },
  {
    icon: Search,
    title: "Memory Browser",
    subtitle: "Semantic search across your workspace memories",
    preview: <MemoryBrowserPreview />,
  },
  {
    icon: Code2,
    title: "MCP Integration",
    subtitle: "Connect Claude Code in 60 seconds",
    preview: <MCPConfigPreview />,
  },
]

export function AgentDemoSection() {
  return (
    <section
      id="agent-demo"
      className="py-24 px-6 border-t border-[rgba(255,255,255,0.04)]"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <ScrollReveal>
          <div className="mb-16 text-center space-y-5">
            <p className="text-xs font-mono tracking-widest uppercase text-[#ADFF2F]">
              AUTONOMOUS AGENTS
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-[#E8EDF0]">
              Build with DevMind
            </h2>
            {/* Pill row */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {PILL_LINKS.map((pill) => (
                <Link
                  key={pill.label}
                  href={pill.href}
                  className={`inline-flex items-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[#11181C] px-3 py-1.5 text-xs text-[#8B96A0] transition-colors duration-200 hover:border-[rgba(173,255,47,0.3)] hover:text-[#E8EDF0] ${
                    pill.mono ? "font-mono" : ""
                  }`}
                >
                  {pill.label}
                </Link>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Bento grid */}
        <div className="space-y-4">
          {/* Top row — 3 equal cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TOP_CARDS.map(({ icon: Icon, title, subtitle, preview }, index) => (
              <ScrollReveal key={title} delay={index * 90}>
                <div
                  className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#11181C] p-5 flex flex-col gap-4 hover:border-[rgba(255,255,255,0.1)] transition-colors duration-200"
                >
                  <div className="flex-1">{preview}</div>
                  <div className="space-y-1 pt-1">
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

          {/* Bottom row — 2 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Left wide card */}
            <ScrollReveal className="lg:col-span-3">
              <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#11181C] p-6 flex flex-col gap-6 hover:border-[rgba(255,255,255,0.1)] transition-colors duration-200">
                <CLIPreview />
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 shrink-0 text-[#ADFF2F]" />
                    <h3 className="text-base font-semibold text-[#E8EDF0]">
                      Zero to memory in 5 minutes
                    </h3>
                  </div>
                  <p className="text-sm text-[#8B96A0] leading-relaxed pl-6">
                    Ship your first persistent AI memory in one command
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Right column — 2 stacked cards */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {/* Top right card */}
              <ScrollReveal delay={90} className="flex-1">
                <div className="h-full rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#11181C] p-5 flex flex-col justify-between gap-4 hover:border-[rgba(255,255,255,0.1)] transition-colors duration-200">
                  <div className="space-y-2">
                    <BookOpen className="h-5 w-5 text-[#ADFF2F]" />
                    <p className="text-sm text-[#8B96A0] leading-relaxed">
                      Get started quickly with pre-built DevMind workflows and integrations.
                    </p>
                  </div>
                  <Link
                    href="#"
                    className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(173,255,47,0.1)] border border-[rgba(173,255,47,0.2)] px-4 py-2 text-xs font-medium text-[#ADFF2F] transition-colors duration-200 hover:bg-[rgba(173,255,47,0.18)] hover:border-[rgba(173,255,47,0.35)] w-fit"
                  >
                    Explore templates
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </ScrollReveal>

              {/* Bottom right card */}
              <ScrollReveal delay={180} className="flex-1">
                <div className="h-full rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#161D22] p-5 flex flex-col justify-between gap-3 hover:border-[rgba(255,255,255,0.1)] transition-colors duration-200">
                  <Terminal className="h-5 w-5 text-[#ADFF2F]" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#E8EDF0]">
                      MCP Course — DevMind 101
                    </p>
                    <p className="text-xs text-[#8B96A0]">
                      Introduced by the DevMind team
                    </p>
                  </div>
                  <Link
                    href="#"
                    className="inline-flex items-center gap-1.5 text-xs text-[#ADFF2F] hover:text-[#C8FF52] transition-colors duration-200 w-fit"
                  >
                    Start learning
                    <ArrowRight className="h-3 w-3" />
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
