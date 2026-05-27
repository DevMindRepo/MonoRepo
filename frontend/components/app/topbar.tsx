"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { Bell, Brain, Bot, Plug, Clock } from "lucide-react"
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

type NotificationType = "memory" | "agent" | "connect"
type NotificationIconName = "brain" | "bot" | "plug" | "clock"

interface Notification {
  id: number
  type: NotificationType
  title: string
  body: string
  time: string
  read: boolean
  icon: NotificationIconName
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 1, type: "memory", title: "Memory approved", body: "pgvector HNSW decision saved to Walrus", time: "2m ago", read: false, icon: "brain" },
  { id: 2, type: "agent", title: "Agent run complete", body: "PR #231 reviewed · 3 memories extracted", time: "1h ago", read: false, icon: "bot" },
  { id: 3, type: "connect", title: "New MCP connection", body: "Claude Code connected to devmind-core", time: "3h ago", read: true, icon: "plug" },
  { id: 4, type: "memory", title: "Memory pending approval", body: "save_memory() called with 1 new decision", time: "1d ago", read: true, icon: "clock" },
]

function NotifIcon({ icon, unread }: { icon: NotificationIconName; unread: boolean }) {
  const cls = "h-3.5 w-3.5"
  const style = unread
    ? { background: "rgba(173,255,47,0.1)", color: "#ADFF2F" }
    : { background: "rgba(255,255,255,0.05)", color: "#4B5563" }
  return (
    <div className="h-7 w-7 shrink-0 flex items-center justify-center rounded-[8px]" style={style}>
      {icon === "brain" && <Brain className={cls} />}
      {icon === "bot" && <Bot className={cls} />}
      {icon === "plug" && <Plug className={cls} />}
      {icon === "clock" && <Clock className={cls} />}
    </div>
  )
}

function NotificationPanel() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS)
  const [mounted, setMounted] = useState(false)
  const buttonRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  const hasUnread = notifications.some((n) => !n.read)

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      const t = e.target as Node
      if (!buttonRef.current?.contains(t) && !panelRef.current?.contains(t)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onMouseDown)
    return () => document.removeEventListener("mousedown", onMouseDown)
  }, [])

  const markAllRead = () => setNotifications((p) => p.map((n) => ({ ...n, read: true })))
  const markRead = (id: number) => setNotifications((p) => p.map((n) => n.id === id ? { ...n, read: true } : n))

  const panel = (
    <div
      ref={panelRef}
      className="fixed top-14 right-4 w-[calc(100vw-2rem)] sm:w-80 max-w-80 rounded-2xl overflow-hidden"
      style={{
        zIndex: 99999,
        background: "rgba(17,25,35,0.97)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.09)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.7)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <span className="text-sm font-semibold text-[#E8EDF0]">Notifications</span>
        <button className="text-xs font-mono text-[#ADFF2F] hover:underline" onClick={markAllRead}>
          Mark all read
        </button>
      </div>

      {/* Items */}
      <ul>
        {notifications.map((n) => (
          <li
            key={n.id}
            className="flex items-start gap-3 py-3 pr-4 cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.03)]"
            style={{
              borderLeft: n.read ? "3px solid transparent" : "3px solid #ADFF2F",
              paddingLeft: "13px",
              background: n.read ? "transparent" : "rgba(173,255,47,0.03)",
            }}
            onClick={() => markRead(n.id)}
          >
            <NotifIcon icon={n.icon} unread={!n.read} />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-medium truncate" style={{ color: n.read ? "#8B96A0" : "#E8EDF0" }}>
                  {n.title}
                </span>
                <span className="text-[10px] font-mono text-[#4B5563] shrink-0">{n.time}</span>
              </div>
              <p className="text-[10px] text-[#4B5563] mt-0.5 leading-relaxed">{n.body}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <button
          onClick={() => { markAllRead(); setOpen(false) }}
          className="w-full py-3 text-xs font-mono text-[#8B96A0] hover:text-[#E8EDF0] hover:bg-[rgba(255,255,255,0.03)] transition-colors cursor-pointer"
        >
          Mark all read & close
        </button>
      </div>
    </div>
  )

  return (
    <div ref={buttonRef} className="relative">
      <Button
        variant="ghost"
        size="icon-sm"
        className="relative"
        style={{ color: open ? "#E8EDF0" : "#8B96A0" }}
        onClick={() => setOpen((p) => !p)}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="h-4 w-4" />
        {hasUnread && (
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#F472B6]" style={{ boxShadow: "0 0 6px #F472B6" }} />
        )}
      </Button>
      {open && mounted && createPortal(panel, document.body)}
    </div>
  )
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
      <div className="flex items-center gap-2 min-w-0">
        <Link href="/dashboard" className="md:hidden flex items-center gap-1.5 mr-1 shrink-0">
          <Image src="/icon-512.png" alt="DevMind" width={24} height={24} className="h-6 w-6 rounded-[6px]" quality={100} />
          <span className="hidden sm:block font-bold text-sm text-[#E8EDF0] tracking-[-0.02em]">DevMind</span>
        </Link>

        <div className="flex items-center gap-2 min-w-0">
          <span
            className="hidden sm:inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-mono text-[#8B96A0]"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            my-workspace
          </span>
          <span className="hidden sm:block text-[#4B5563] text-xs">/</span>
          <span className="text-sm font-medium text-[#E8EDF0] truncate">{pageLabel}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
        <NotificationPanel />
        <WalletPill connected address="0x7f3a9b2c8d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a" />
      </div>
    </header>
  )
}
