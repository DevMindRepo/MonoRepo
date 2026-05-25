"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[rgba(7,11,14,0.85)] backdrop-blur-md border-b border-[rgba(255,255,255,0.06)]"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-7 w-7 rounded-[8px] bg-gradient-to-br from-[#ADFF2F] to-[#ADFF2F] flex items-center justify-center">
            <span className="text-[#070B0E] font-bold font-mono text-xs">D</span>
          </div>
          <span className="font-semibold text-[#E8EDF0] tracking-tight">DevMind</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {[
            { href: "#how-it-works", label: "How it works" },
            { href: "#features", label: "Features" },
            { href: "#architecture", label: "Architecture" },
            { href: "#faq", label: "FAQ" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-1.5 text-sm text-[#8B96A0] hover:text-[#E8EDF0] rounded-[8px] hover:bg-[rgba(255,255,255,0.05)] transition-all duration-200"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="https://github.com"
            className="hidden md:flex text-sm text-[#8B96A0] hover:text-[#E8EDF0] transition-colors duration-200"
            target="_blank"
          >
            GitHub
          </Link>
          <Button asChild variant="primary" size="sm">
            <Link href="/auth">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
