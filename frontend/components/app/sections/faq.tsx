"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollReveal } from "@/components/app/scroll-reveal"

const FAQS = [
  {
    q: "Do I have to use a crypto wallet?",
    a: "Sui wallet is the primary identity method. It's required to create or join a workspace. An email fallback is on the roadmap for Phase 2.",
  },
  {
    q: "What if a memory contains API keys or secrets?",
    a: "The approval queue highlights potential secrets with regex patterns — API keys, JWT tokens, passwords. You review before anything is stored. There's no hard block, but the highlights make it hard to miss.",
  },
  {
    q: "Is this only for Claude Code?",
    a: "No. Any MCP-compatible AI tool works — Claude Code, Cursor (via Continue), or your own client. The memory is shared across all of them.",
  },
  {
    q: "What happens to my memory if DevMind shuts down?",
    a: "You own the Walrus blob IDs. As long as Walrus testnet (or mainnet) runs, your encrypted blobs exist. Phase 2 will add direct blob recovery tooling.",
  },
  {
    q: "How is this different from just saving notes in a file?",
    a: "Semantic search — you can ask 'what did we decide about auth' and get the relevant memory, not hunt through files. Plus it's shared across all AI tools your team uses, automatically.",
  },
  {
    q: "Can I use it for private memories only I can see?",
    a: "Yes. Each memory has a privacy level: private (only you), team (workspace members), or public. Private memories are encrypted the same way but ACL-restricted to your user.",
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="border-b border-[rgba(255,255,255,0.06)] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left transition-colors duration-200 hover:text-[#E8EDF0] cursor-pointer"
      >
        <span className={cn("text-sm font-medium transition-colors duration-200", open ? "text-[#E8EDF0]" : "text-[#8B96A0]")}>
          {q}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-[#ADFF2F] transition-transform duration-200", open && "rotate-180")}
        />
      </button>
      {open && (
        <p className="pb-4 text-sm text-[#8B96A0] leading-relaxed animate-fade-up">
          {a}
        </p>
      )}
    </div>
  )
}

export function FaqSection() {
  return (
    <section id="faq" className="py-16 md:py-24 px-4 md:px-6 border-t border-[rgba(255,255,255,0.04)]">
      <div className="mx-auto max-w-3xl">
        <ScrollReveal>
          <div className="text-center mb-12 space-y-3">
            <p className="text-[13px] font-mono text-[#ADFF2F] uppercase tracking-[0.25em]">FAQ</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">Common questions.</h2>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={90}>
          <div className="rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-[#11181C] px-4 md:px-6">
            {FAQS.map((faq) => (
              <FaqItem key={faq.q} {...faq} />
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
