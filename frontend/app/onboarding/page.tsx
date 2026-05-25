"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Check, ExternalLink, Loader2 } from "lucide-react"
import { cn, truncateAddress } from "@/lib/utils"
import { workspacesApi } from "@/lib/api-endpoints"
import { useAuthStore } from "@/lib/store/auth"
import { env } from "@/lib/env"
import { ApiError } from "@/lib/api"

const STEPS = ["Connect wallet", "Create workspace", "Continue"]

export default function OnboardingPage() {
  const router = useRouter()
  const account = useCurrentAccount()
  const { token, workspace, setWorkspace, hasHydrated } = useAuthStore()

  const [step, setStep] = React.useState(0)
  const [name, setName] = React.useState("")
  const [creating, setCreating] = React.useState(false)
  const [createdTxDigest, setCreatedTxDigest] = React.useState<string | null>(null)
  const [createdSuiObjectId, setCreatedSuiObjectId] = React.useState<string | null>(null)

  // Bounce if not authenticated yet.
  React.useEffect(() => {
    if (!hasHydrated) return
    if (!token || !account) router.replace("/auth")
  }, [hasHydrated, token, account, router])

  // Already have a workspace? Skip to dashboard.
  React.useEffect(() => {
    if (workspace) router.replace("/dashboard")
  }, [workspace, router])

  // Auto-advance step 0 -> 1 once wallet + token are present.
  React.useEffect(() => {
    if (token && account && step === 0) setStep(1)
  }, [token, account, step])

  async function handleCreateWorkspace() {
    if (!name.trim()) return
    setCreating(true)
    try {
      const ws = await workspacesApi.create(name.trim())
      setCreatedTxDigest(ws.txDigest ?? null)
      setCreatedSuiObjectId(ws.suiObjectId)
      setWorkspace({ id: ws.id, name: ws.name, suiObjectId: ws.suiObjectId })
      toast.success(`Workspace "${ws.name}" deployed on-chain`)
      setStep(2)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Failed to create workspace"
      toast.error(message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070B0E] flex items-center justify-center px-6">
      <div className="w-full max-w-lg space-y-8">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-[8px] bg-gradient-to-br from-[#ADFF2F] to-[#ADFF2F] flex items-center justify-center">
            <span className="text-[#070B0E] font-bold font-mono text-xs">D</span>
          </div>
          <span className="font-semibold text-[#E8EDF0]">DevMind</span>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-3">
          {STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-mono transition-all duration-300",
                    i < step ? "bg-[#ADFF2F] text-[#070B0E]" : i === step ? "border-2 border-[#ADFF2F] text-[#ADFF2F]" : "border border-[rgba(255,255,255,0.1)] text-[#4B5563]"
                  )}
                >
                  {i < step ? <Check className="h-3 w-3" /> : i + 1}
                </div>
                <span className={cn("text-xs hidden sm:block", i === step ? "text-[#E8EDF0]" : "text-[#4B5563]")}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn("flex-1 h-px", i < step ? "bg-[rgba(173,255,47,0.4)]" : "bg-[rgba(255,255,255,0.06)]")} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step content */}
        <div className="rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-[#11181C] p-6 space-y-5">
          {step === 0 && (
            <>
              <h2 className="text-lg font-semibold text-[#E8EDF0]">Connect your Sui wallet</h2>
              <p className="text-sm text-[#8B96A0]">Redirecting you to login…</p>
              <Loader2 className="h-5 w-5 animate-spin text-[#ADFF2F] mx-auto" />
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="text-lg font-semibold text-[#E8EDF0]">Create your workspace</h2>
              <p className="text-sm text-[#8B96A0]">A Sui Move smart contract will be deployed to register your workspace on Sui {env.NEXT_PUBLIC_SUI_NETWORK}.</p>

              {account && (
                <div className="rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3 flex items-center justify-between text-xs">
                  <span className="text-[#4B5563]">Owner</span>
                  <span className="font-mono text-[#ADFF2F]">{truncateAddress(account.address, 6)}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-mono text-[#4B5563] uppercase tracking-wider block mb-1.5">Workspace name</label>
                <input
                  placeholder="my-team"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={creating}
                  className="w-full rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[#161D22] px-3 py-2.5 text-sm text-[#E8EDF0] placeholder:text-[#4B5563] focus:outline-none focus:border-[rgba(173,255,47,0.4)] transition-colors duration-200 disabled:opacity-50"
                />
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full gap-2"
                onClick={handleCreateWorkspace}
                disabled={!name.trim() || creating}
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deploying on-chain…
                  </>
                ) : (
                  "Deploy workspace contract"
                )}
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-lg font-semibold text-[#E8EDF0]">Workspace created</h2>
              <p className="text-sm text-[#8B96A0]">Your workspace is anchored on Sui {env.NEXT_PUBLIC_SUI_NETWORK} and ready to receive memories.</p>

              {createdSuiObjectId && (
                <div className="rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#4B5563]">Sui object</span>
                    <a
                      href={`${env.NEXT_PUBLIC_SUI_EXPLORER}/object/${createdSuiObjectId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#ADFF2F] flex items-center gap-1 hover:underline"
                    >
                      {truncateAddress(createdSuiObjectId, 6)}
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                  {createdTxDigest && (
                    <div className="flex justify-between">
                      <span className="text-[#4B5563]">Tx digest</span>
                      <a
                        href={`${env.NEXT_PUBLIC_SUI_EXPLORER}/tx/${createdTxDigest}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#8B96A0] flex items-center gap-1 hover:underline"
                      >
                        {truncateAddress(createdTxDigest, 6)}
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => router.replace("/dashboard")}
              >
                Open dashboard →
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
