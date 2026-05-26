"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CodePill } from "@/components/ui/code-pill"
import { ScrollReveal } from "@/components/app/scroll-reveal"

export function FooterSection() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.06)] bg-[#070B0E]">
      {/* CTA */}
      <ScrollReveal>
        <div className="py-12 md:py-20 px-4 md:px-6 text-center space-y-6 border-b border-[rgba(255,255,255,0.04)]">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">Ready to give your AI a memory?</h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <CodePill code="npm create devmind" />
            <Button asChild variant="secondary" size="md">
              <Link href="/auth">Open dashboard</Link>
            </Button>
          </div>
        </div>
      </ScrollReveal>

      {/* Links */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="h-6 w-6 rounded-[6px] bg-gradient-to-br from-[#ADFF2F] to-[#ADFF2F] flex items-center justify-center">
            <span className="text-[#070B0E] font-bold font-mono text-[10px]">D</span>
          </div>
          <span className="text-sm font-semibold text-[#E8EDF0]">DevMind</span>
        </div>

        <nav className="flex flex-wrap gap-5">
          {[
            { href: "#", label: "Docs" },
            { href: "https://github.com", label: "GitHub" },
            { href: "#", label: "Demo video" },
          ].map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className="text-sm text-[#4B5563] hover:text-[#8B96A0] transition-colors duration-200"
            >
              {label}
            </Link>
          ))}
        </nav>

        <p className="text-xs text-[#4B5563]">
          Built for the Walrus Hackathon · 2025
        </p>
      </div>
    </footer>
  )
}
