"use client"
import Image from "next/image"
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
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">Ready to give your AI a memory?</h2>
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
        <div className="flex items-center gap-1.5">
          <Image src="/icon-512.png" alt="DevMind" width={24} height={24} className="h-6 w-6 rounded-[6px]" quality={100} />
          <span className="text-sm font-bold text-[#E8EDF0] tracking-[-0.02em]">DevMind</span>
        </div>

        <nav className="flex flex-wrap gap-5">
          {[
            { href: "#", label: "Docs" },
            { href: "https://github.com/DevMindRepo/MonoRepo", label: "GitHub" },
            { href: "#", label: "Demo video" },
          ].map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className="text-sm text-[#8B96A0] hover:text-[#E8EDF0] transition-colors duration-200"
            >
              {label}
            </Link>
          ))}
        </nav>

      </div>
    </footer>
  )
}
