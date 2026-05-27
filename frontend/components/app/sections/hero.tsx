"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CodePill } from "@/components/ui/code-pill"
import { Play } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Lime accent glow — sits on top of the page-level shader */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] rounded-full bg-[radial-gradient(circle,rgba(173,255,47,0.05)_0%,transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(173,255,47,0.03)_0%,transparent_50%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 md:px-6 py-12 md:py-16 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center w-full">
        {/* Left — text */}
        <div className="space-y-6 md:space-y-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
            Your AI finally{" "}
            <span className="gradient-text-mint">remembers.</span>
          </h1>

          <p className="text-base md:text-lg text-[#8B96A0] leading-relaxed max-w-md">
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

          <div className="flex flex-wrap items-center gap-2">
            {[
              { logo: "/ecosystem-seal.png", label: "Encrypted with Seal" },
              { logo: "/ecosystem-walrus.png", label: "Stored on Walrus" },
              { logo: "/ecosystem-sui.png", label: "Anchored on Sui" },
            ].map(({ logo, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-[#C8D0D8] transition-colors duration-200 hover:text-[#E8EDF0]"
                style={{
                  background: "rgba(17,25,35,0.7)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <Image src={logo} alt={label} width={16} height={16} className="h-4 w-4 rounded-full object-cover" />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Right — solar system */}
        <div className="relative flex items-center justify-center order-first lg:order-last">
          <div className="relative h-[320px] w-[320px] sm:h-[440px] sm:w-[440px] lg:h-[620px] lg:w-[620px]">
            <Image
              src="/solar-system-new.png"
              alt="DevMind memory network"
              fill
              className="object-contain"
              style={{ filter: "drop-shadow(0 0 40px rgba(173,255,47,0.5)) drop-shadow(0 0 100px rgba(173,255,47,0.2))" }}
              priority
            />
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
