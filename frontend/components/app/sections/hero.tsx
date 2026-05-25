"use client"

import Link from "next/link"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { CodePill } from "@/components/ui/code-pill"
import { Play } from "lucide-react"

const MemoryCore = dynamic(
  () => import("@/components/app/memory-core").then((m) => m.MemoryCore),
  { ssr: false }
)

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Lime accent glow — sits on top of the page-level shader */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] rounded-full bg-[radial-gradient(circle,rgba(173,255,47,0.05)_0%,transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(173,255,47,0.03)_0%,transparent_50%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-16 grid lg:grid-cols-2 gap-16 items-center w-full">
        {/* Left — text */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(173,255,47,0.2)] bg-[rgba(173,255,47,0.06)] px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ADFF2F] animate-pulse" />
            <span className="text-xs font-mono text-[#ADFF2F]">Walrus Hackathon 2025</span>
          </div>

          <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
            Your AI finally{" "}
            <span className="gradient-text-mint">remembers.</span>
          </h1>

          <p className="text-lg text-[#8B96A0] leading-relaxed max-w-md">
            Persistent memory for Claude Code, Cursor, and Copilot. Your team&apos;s decisions,
            patterns, and context — recalled across sessions, across tools, across teammates.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <CodePill code="npm create devmind" label="Quick start" />
            <Button asChild variant="secondary" size="md" className="gap-2">
              <Link href="#">
                <Play className="h-3.5 w-3.5" />
                Watch demo
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#4B5563]">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#ADFF2F]" />
              Encrypted with Seal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#ADFF2F]" />
              Stored on Walrus
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#ADFF2F]" />
              Anchored on Sui
            </span>
          </div>
        </div>

        {/* Right — solar system */}
        <div className="relative flex items-center justify-center">
          <div className="h-[540px] w-[540px] max-w-full">
            <MemoryCore />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
        <div className="h-8 w-5 rounded-full border border-[rgba(255,255,255,0.3)] flex items-start justify-center pt-1.5">
          <div className="h-1.5 w-1 rounded-full bg-white animate-bounce" />
        </div>
      </div>
    </section>
  )
}
