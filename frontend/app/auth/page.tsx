"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ConnectModal, useCurrentAccount, useSignPersonalMessage, useDisconnectWallet } from "@mysten/dapp-kit"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Wallet, ArrowRight, Loader2 } from "lucide-react"
import { signAndLogin } from "@/lib/auth"
import { workspacesApi } from "@/lib/api-endpoints"
import { useAuthStore } from "@/lib/store/auth"
import { truncateAddress } from "@/lib/utils"
import { ApiError } from "@/lib/api"

export default function AuthPage() {
  const router = useRouter()
  const account = useCurrentAccount()
  const { mutateAsync: signMessage } = useSignPersonalMessage()
  const { mutate: disconnect } = useDisconnectWallet()
  const { hasHydrated, token, setWorkspace } = useAuthStore()
  const [open, setOpen] = React.useState(false)
  const [loggingIn, setLoggingIn] = React.useState(false)

  // If already logged in, skip to dashboard / onboarding.
  React.useEffect(() => {
    if (!hasHydrated || !token) return
    void (async () => {
      try {
        const workspaces = await workspacesApi.list()
        if (workspaces.length > 0) {
          const ws = workspaces[0]
          setWorkspace({ id: ws.id, name: ws.name, suiObjectId: ws.suiObjectId })
          router.replace("/dashboard")
        } else {
          router.replace("/onboarding")
        }
      } catch {
        // Token invalid — clear handled by axios interceptor
      }
    })()
  }, [hasHydrated, token, router, setWorkspace])

  // Once a wallet account is available, run the login flow once.
  React.useEffect(() => {
    if (!account || token || loggingIn) return
    void handleLogin()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])

  async function handleLogin() {
    if (!account) return
    setLoggingIn(true)
    try {
      await signAndLogin({
        suiAddress: account.address,
        signPersonalMessage: async ({ message }) =>
          signMessage({ message }) as Promise<{ signature: string }>,
      })

      const workspaces = await workspacesApi.list()
      if (workspaces.length > 0) {
        const ws = workspaces[0]
        setWorkspace({ id: ws.id, name: ws.name, suiObjectId: ws.suiObjectId })
        toast.success(`Welcome back to ${ws.name}`)
        router.replace("/dashboard")
      } else {
        toast.success("Wallet connected — let's set up your workspace")
        router.replace("/onboarding")
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Login failed"
      toast.error(message)
      disconnect()
    } finally {
      setLoggingIn(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070B0E] flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-[14px] bg-gradient-to-br from-[#ADFF2F] to-[#ADFF2F] flex items-center justify-center">
            <span className="text-[#070B0E] font-bold font-mono text-xl">D</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#E8EDF0]">Welcome to DevMind</h1>
          <p className="text-sm text-[#8B96A0]">Sign in with your Sui wallet to continue</p>
        </div>

        {/* Card */}
        <div className="rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-[#11181C] p-6 space-y-4">
          {account ? (
            <div className="space-y-3">
              <div className="rounded-[12px] border border-[rgba(173,255,47,0.15)] bg-[rgba(173,255,47,0.04)] p-3 font-mono text-xs text-[#ADFF2F] text-center">
                {truncateAddress(account.address, 6)}
              </div>
              <Button
                variant="primary"
                size="lg"
                className="w-full gap-3"
                onClick={handleLogin}
                disabled={loggingIn}
              >
                {loggingIn ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing challenge…
                  </>
                ) : (
                  <>
                    Sign &amp; continue
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
              <button
                onClick={() => disconnect()}
                className="w-full text-xs text-[#8B96A0] hover:text-[#E8EDF0] transition-colors duration-150"
              >
                Use a different wallet
              </button>
            </div>
          ) : (
            <Button
              variant="primary"
              size="lg"
              className="w-full gap-3"
              onClick={() => setOpen(true)}
            >
              <Wallet className="h-5 w-5" />
              Connect Sui Wallet
            </Button>
          )}

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
            <span className="text-xs text-[#4B5563]">or</span>
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
          </div>

          <div className="space-y-2">
            <input
              type="email"
              placeholder="Email (coming soon)"
              disabled
              className="w-full rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-3 py-2.5 text-sm text-[#4B5563] placeholder:text-[#4B5563] cursor-not-allowed"
            />
            <Button variant="outline" size="lg" className="w-full opacity-40" disabled>
              Continue with email
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-[#4B5563]">
          Your memory is encrypted with Seal before it leaves your browser.
        </p>
      </div>

      <ConnectModal trigger={<span />} open={open} onOpenChange={setOpen} />
    </div>
  )
}
