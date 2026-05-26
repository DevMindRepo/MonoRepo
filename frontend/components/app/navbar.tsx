"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#architecture", label: "Architecture" },
  { href: "#faq", label: "FAQ" },
]

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  React.useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  // Close mobile menu on scroll
  React.useEffect(() => {
    if (scrolled) setMobileOpen(false)
  }, [scrolled])

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled || mobileOpen
            ? "bg-[rgba(7,11,14,0.95)] backdrop-blur-md border-b border-[rgba(255,255,255,0.06)]"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto max-w-7xl px-5 md:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group" onClick={() => setMobileOpen(false)}>
            <div className="h-7 w-7 rounded-[8px] bg-gradient-to-br from-[#ADFF2F] to-[#ADFF2F] flex items-center justify-center">
              <span className="text-[#070B0E] font-bold font-mono text-xs">D</span>
            </div>
            <span className="font-semibold text-[#E8EDF0] tracking-tight">DevMind</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 text-sm text-[#8B96A0] hover:text-[#E8EDF0] rounded-[8px] hover:bg-[rgba(255,255,255,0.05)] transition-all duration-200"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <Link
              href="https://github.com"
              className="hidden md:flex text-sm text-[#8B96A0] hover:text-[#E8EDF0] transition-colors duration-200"
              target="_blank"
            >
              GitHub
            </Link>
            <Button asChild variant="ghost" size="sm" className="hidden md:flex">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild variant="primary" size="sm">
              <Link href="/auth" onClick={() => setMobileOpen(false)}>Get started</Link>
            </Button>
            {/* Hamburger — mobile only */}
            <button
              className="md:hidden flex h-8 w-8 items-center justify-center rounded-[8px] text-[#8B96A0] hover:text-[#E8EDF0] hover:bg-[rgba(255,255,255,0.06)] transition-all duration-200"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-out",
            mobileOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <nav className="px-5 pt-1 pb-4 space-y-0.5 border-t border-[rgba(255,255,255,0.06)]">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center px-3 py-2.5 text-sm text-[#8B96A0] hover:text-[#E8EDF0] rounded-[8px] hover:bg-[rgba(255,255,255,0.05)] transition-all duration-200"
              >
                {label}
              </Link>
            ))}
            <div className="pt-2 border-t border-[rgba(255,255,255,0.06)] mt-2">
              <Link
                href="https://github.com"
                target="_blank"
                className="flex items-center px-3 py-2.5 text-sm text-[#8B96A0] hover:text-[#E8EDF0] rounded-[8px] hover:bg-[rgba(255,255,255,0.05)] transition-all duration-200"
              >
                GitHub
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Overlay when mobile menu open */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-[rgba(0,0,0,0.4)]"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  )
}
