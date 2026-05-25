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
      <div className="min-h-screen flex items-center justify-center bg-[#070B0E]">
        <div className="h-6 w-6 rounded-full border-2 border-[rgba(173,255,47,0.3)] border-t-[#ADFF2F] animate-spin" />
      </div>
    )
  }

  if (!token) return null
  if (requireWorkspace && !workspace) return null

  return <>{children}</>
}
