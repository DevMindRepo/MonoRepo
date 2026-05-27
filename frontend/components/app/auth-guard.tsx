"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store/auth"

interface AuthGuardProps {
  children: React.ReactNode
  /** Where to send users who are not authenticated. */
  redirectTo?: string
  /** Require an active workspace too (default: false). */
  requireWorkspace?: boolean
}

/**
 * Client-side guard for dashboard routes.
 * - Waits for zustand hydration to avoid false redirects on page reload
 * - Redirects to /auth if no token
 * - Optionally redirects to /onboarding if no workspace selected
 */
export function AuthGuard({
  children,
  redirectTo = "/auth",
  requireWorkspace = false,
}: AuthGuardProps) {
  const router = useRouter()
  const { token, workspace, hasHydrated } = useAuthStore()

  React.useEffect(() => {
    if (!hasHydrated) return
    if (!token) {
      router.replace(redirectTo)
      return
    }
    if (requireWorkspace && !workspace) {
      router.replace("/onboarding")
    }
  }, [hasHydrated, token, workspace, requireWorkspace, redirectTo, router])

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#070B0E" }}>
        <div className="relative">
          <div className="h-9 w-9 rounded-full border-2 border-[rgba(173,255,47,0.18)] border-t-[#ADFF2F] animate-spin" />
          <div className="absolute inset-0 rounded-full" style={{ boxShadow: "0 0 20px rgba(173,255,47,0.25)" }} />
        </div>
        <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#4B5563]">Loading workspace</span>
      </div>
    )
  }

  if (!token) return null
  if (requireWorkspace && !workspace) return null

  return <>{children}</>
}
