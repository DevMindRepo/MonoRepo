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

const NAV_GROUPS = [
  {
    label: "Workspace",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
      { href: "/memories", icon: Brain, label: "Memories" },
      { href: "/approval-queue", icon: CheckCircle, label: "Approval Queue", badge: true },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/agent-timeline", icon: Clock, label: "Agent Timeline" },
      { href: "/artifacts", icon: Package, label: "Artifacts" },
      { href: "/connect", icon: Plug, label: "Connect AI" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/settings", icon: Settings, label: "Settings" },
    ],
  },
]

const MOBILE_NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/memories", icon: Brain, label: "Memories" },
  { href: "/approval-queue", icon: CheckCircle, label: "Approval", badge: true },
  { href: "/agent-timeline", icon: Clock, label: "Timeline" },
  { href: "/artifacts", icon: Package, label: "Artifacts" },
]

const sidebarGlass = {
  background: "rgba(8,13,17,0.85)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderRight: "1px solid rgba(255,255,255,0.07)",
} as React.CSSProperties

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "relative hidden md:flex flex-col transition-all duration-300 shrink-0",
          collapsed ? "w-[60px]" : "w-56"
        )}
        style={sidebarGlass}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-center gap-2.5 px-4 py-[18px] border-b border-[rgba(255,255,255,0.06)]",
            collapsed && "justify-center px-0"
          )}
        >
          <div className="shrink-0 h-7 w-7 rounded-[8px] bg-[#ADFF2F] flex items-center justify-center">
            <span className="text-[#070B0E] font-bold font-mono text-xs">D</span>
          </div>
          {!collapsed && (
            <span className="font-semibold text-[#E8EDF0] tracking-tight text-sm">DevMind</span>
          )}
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto py-3">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-1">
              {!collapsed && (
                <p className="px-4 pb-1 pt-2 text-[10px] font-mono uppercase tracking-[0.18em] text-[#2E3A42]">
                  {group.label}
                </p>
              )}
              <div className="px-2 space-y-0.5">
                {group.items.map(({ href, icon: Icon, label, badge }) => {
                  const active = pathname === href || pathname.startsWith(href + "/")
                  return (
                    <Link
                      key={href}
                      href={href}
                      title={collapsed ? label : undefined}
                      className={cn(
                        "relative flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-sm transition-all duration-200",
                        collapsed && "justify-center px-0 py-2.5",
                        active
                          ? "text-[#ADFF2F]"
                          : "text-[#8B96A0] hover:text-[#E8EDF0]"
                      )}
                      style={
                        active
                          ? {
                              background: "rgba(173,255,47,0.08)",
                              boxShadow: "0 0 0 1px rgba(173,255,47,0.12) inset",
                            }
                          : undefined
                      }
                      onMouseEnter={(e) => {
                        if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"
                      }}
                      onMouseLeave={(e) => {
                        if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"
                      }}
                    >
                      {active && (
                        <span
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-[#ADFF2F]"
                          style={{ boxShadow: "0 0 8px #ADFF2F" }}
                        />
                      )}
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="flex-1 text-sm">{label}</span>}
                      {!collapsed && badge && (
                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-mono text-[#F472B6]"
                          style={{ background: "rgba(244,114,182,0.15)", border: "1px solid rgba(244,114,182,0.2)" }}>
                          3
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-14 flex h-6 w-6 items-center justify-center rounded-full text-[#8B96A0] hover:text-[#E8EDF0] transition-colors duration-200 cursor-pointer z-10"
          style={{ background: "rgba(10,16,20,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-1 pb-safe-bottom"
        style={{
          background: "rgba(8,13,17,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {MOBILE_NAV_ITEMS.map(({ href, icon: Icon, label, badge }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-col items-center gap-1 px-2 py-2.5 rounded-[8px] flex-1 transition-all duration-200",
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
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full bg-[#ADFF2F]"
                  style={{ boxShadow: "0 0 6px #ADFF2F" }} />
              )}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
