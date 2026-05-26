"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Brain,
  CheckCircle,
  Clock,
  Package,
  Settings,
  Plug,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/memories", icon: Brain, label: "Memories" },
  { href: "/approval-queue", icon: CheckCircle, label: "Approval Queue", badge: true },
  { href: "/agent-timeline", icon: Clock, label: "Agent Timeline" },
  { href: "/artifacts", icon: Package, label: "Artifacts" },
  { href: "/connect", icon: Plug, label: "Connect AI" },
  { href: "/settings", icon: Settings, label: "Settings" },
]

const MOBILE_NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/memories", icon: Brain, label: "Memories" },
  { href: "/approval-queue", icon: CheckCircle, label: "Approval", badge: true },
  { href: "/agent-timeline", icon: Clock, label: "Timeline" },
  { href: "/artifacts", icon: Package, label: "Artifacts" },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "relative hidden md:flex flex-col border-r border-[rgba(255,255,255,0.06)] bg-[#0A1014] transition-all duration-300",
          collapsed ? "w-16" : "w-56"
        )}
      >
        {/* Logo */}
        <div className={cn("flex items-center gap-2.5 px-4 py-5 border-b border-[rgba(255,255,255,0.06)]", collapsed && "justify-center px-0")}>
          <div className="shrink-0 h-7 w-7 rounded-[8px] bg-gradient-to-br from-[#ADFF2F] to-[#ADFF2F] flex items-center justify-center">
            <span className="text-[#070B0E] font-bold font-mono text-xs">D</span>
          </div>
          {!collapsed && (
            <span className="font-semibold text-[#E8EDF0] tracking-tight text-sm">DevMind</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, icon: Icon, label, badge }) => {
            const active = pathname === href || pathname.startsWith(href + "/")
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-[8px] px-3 py-2 text-sm transition-all duration-200",
                  collapsed && "justify-center px-0 py-2.5",
                  active
                    ? "bg-[rgba(173,255,47,0.1)] text-[#ADFF2F]"
                    : "text-[#8B96A0] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#E8EDF0]"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && (
                  <span className="flex-1">{label}</span>
                )}
                {!collapsed && badge && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(244,114,182,0.2)] text-[10px] font-mono text-[#F472B6]">
                    3
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "absolute -right-3 top-14 flex h-6 w-6 items-center justify-center rounded-full border border-[rgba(255,255,255,0.1)] bg-[#0A1014] text-[#8B96A0] hover:text-[#E8EDF0] transition-colors duration-200 cursor-pointer z-10"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-[rgba(255,255,255,0.06)] bg-[#0A1014]/95 backdrop-blur-md px-1 pb-safe-bottom">
        {MOBILE_NAV_ITEMS.map(({ href, icon: Icon, label, badge }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-col items-center gap-1 px-2 py-2.5 rounded-[8px] transition-all duration-200 flex-1",
                active ? "text-[#ADFF2F]" : "text-[#8B96A0]"
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {badge && (
                  <span className="absolute -top-1 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#F472B6] text-[8px] font-bold text-white leading-none">
                    3
                  </span>
                )}
              </div>
              <span className="text-[9px] font-medium tracking-tight leading-none">{label}</span>
              {active && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full bg-[#ADFF2F]" />
              )}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
