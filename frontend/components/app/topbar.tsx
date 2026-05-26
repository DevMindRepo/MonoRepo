"use client"

import Link from "next/link"
import { Bell } from "lucide-react"
import { WalletPill } from "@/components/ui/wallet-pill"
import { Button } from "@/components/ui/button"

interface TopbarProps {
  title?: string
}

export function Topbar({ title }: TopbarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[rgba(255,255,255,0.06)] bg-[#0A1014] px-4 md:px-6">
      <div className="flex items-center gap-3">
        {/* Logo visible only on mobile (sidebar is hidden on mobile) */}
        <Link href="/dashboard" className="md:hidden flex items-center gap-2 mr-1">
          <div className="h-6 w-6 rounded-[6px] bg-gradient-to-br from-[#ADFF2F] to-[#ADFF2F] flex items-center justify-center">
            <span className="text-[#070B0E] font-bold font-mono text-[10px]">D</span>
          </div>
        </Link>
        {title && (
          <h1 className="text-sm font-semibold text-[#E8EDF0]">{title}</h1>
        )}
        <span className="hidden sm:inline-flex rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-2.5 py-0.5 text-xs font-mono text-[#8B96A0]">
          my-workspace
        </span>
      </div>

      <div className="flex items-center gap-1.5 md:gap-2">
        <Button variant="ghost" size="icon-sm" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-[#F472B6]" />
        </Button>
        <WalletPill
          connected
          address="0x7f3a9b2c8d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a"
        />
      </div>
    </header>
  )
}
