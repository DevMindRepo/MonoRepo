"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell } from "lucide-react"
import { WalletPill } from "@/components/ui/wallet-pill"
import { Button } from "@/components/ui/button"

const ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "Overview",
  "/memories": "Memories",
  "/approval-queue": "Approval Queue",
  "/agent-timeline": "Agent Timeline",
  "/artifacts": "Artifacts",
  "/connect": "Connect AI",
  "/settings": "Settings",
}

export function Topbar() {
  const pathname = usePathname()
  const pageLabel = ROUTE_LABELS[pathname] ?? "Overview"

  return (
    <header
      className="flex h-14 shrink-0 items-center justify-between px-4 md:px-5"
      style={{
        background: "rgba(8,13,17,0.72)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset",
      }}
    >
      <div className="flex items-center gap-2.5">
        {/* Logo — mobile only */}
        <Link href="/dashboard" className="md:hidden flex items-center gap-2 mr-1">
          <div className="h-6 w-6 rounded-[6px] bg-[#ADFF2F] flex items-center justify-center">
            <span className="text-[#070B0E] font-bold font-mono text-[10px]">D</span>
          </div>
        </Link>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <span
            className="hidden sm:inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-mono text-[#8B96A0]"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            my-workspace
          </span>
          <span className="hidden sm:block text-[#4B5563] text-xs">/</span>
          <span className="text-sm font-medium text-[#E8EDF0]">{pageLabel}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 md:gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative"
          style={{ color: "#8B96A0" }}
        >
          <Bell className="h-4 w-4" />
          <span
            className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#F472B6]"
            style={{ boxShadow: "0 0 6px #F472B6" }}
          />
        </Button>
        <WalletPill
          connected
          address="0x7f3a9b2c8d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a"
        />
      </div>
    </header>
  )
}
