"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  ConnectModal,
  useCurrentAccount,
  useSignPersonalMessage,
  useSuiClient,
} from "@mysten/dapp-kit"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { CodePill } from "@/components/ui/code-pill"
import { Check, ExternalLink, Loader2 } from "lucide-react"
import { cn, truncateAddress } from "@/lib/utils"
import { useAuthStore } from "@/lib/store/auth"
import { workspacesApi } from "@/lib/api-endpoints"
import { signAndLogin } from "@/lib/auth"
import { ApiError } from "@/lib/api"
import { env } from "@/lib/env"

const STEPS = ["Connect wallet", "Create workspace", "Connect AI tool"]

export default function OnboardingPage() {
  const router = useRouter()
  const { setWorkspace } = useAuthStore()
  const token = useAuthStore((s) => s.token)
  const workspace = useAuthStore((s) => s.workspace)
  const user = useAuthStore((s) => s.user)
  const hasHydrated = useAuthStore((s) => s.hasHydrated)

  const account = useCurrentAccount()
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage()
  const suiClient = useSuiClient()

  const [name, setName] = React.useState("")
  const [balance, setBalance] = React.useState<number | null>(null)
  const [connectOpen, setConnectOpen] = React.useState(false)
  const [signing, setSigning] = React.useState(false)
  const [deploying, setDeploying] = React.useState(false)
  const [newWorkspace, setNewWorkspace] = React.useState<{
    id: string
    suiObjectId: string | null
    txDigest?: string
  } | null>(null)

  // Derive current step
  const step = !token ? 0 : !workspace ? 1 : 2

  // If signed in but no workspace in store, check if user already has workspaces
  // server-side (e.g. created on a previous session). If so, pick the first and skip
  // onboarding entirely — they don't need to deploy a brand new contract.
  React.useEffect(() => {
    if (!hasHydrated) return
    if (!token || workspace) return // need token, and only run when workspace is missing

    let cancelled = false
    workspacesApi
      .list()
      .then((workspaces) => {
        if (cancelled) return
        if (workspaces.length > 0) {
          const ws = workspaces[0]
          setWorkspace({
            id: ws.id,
            name: ws.name,
            suiObjectId: ws.suiObjectId ?? null,
          })
          router.push("/dashboard")
        }
      })
      .catch(() => {
        // Silent — user can still create a new workspace via the form below
      })

    return () => {
      cancelled = true
    }
  }, [hasHydrated, token, workspace, setWorkspace, router])

  // Fetch balance when wallet connects
  React.useEffect(() => {
    if (!account?.address) {
      setBalance(null)
      return
    }
    suiClient
      .getBalance({ owner: account.address, coinType: "0x2::sui::SUI" })
      .then((b) => {
        const mist = BigInt(b.totalBalance)
        const sui = Number(mist) / 1_000_000_000
        setBalance(sui)
      })
      .catch(() => setBalance(null))
  }, [account?.address, suiClient])

  const handleSignIn = async () => {
    if (!account?.address) {
      setConnectOpen(true)
      return
    }
    setSigning(true)
    try {
      await signAndLogin({
        suiAddress: account.address,
        signPersonalMessage: async ({ message }) => {
          const result = await signPersonalMessage({ message })
          return { signature: result.signature }
        },
      })
      toast.success("Signed in — let's create a workspace")
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Sign-in failed"
      toast.error(msg)
    } finally {
      setSigning(false)
    }
  }

  const handleDeploy = async () => {
    if (!name.trim()) return
    setDeploying(true)
    try {
      const ws = await workspacesApi.create(name.trim())
      setWorkspace({
        id: ws.id,
        name: ws.name,
        suiObjectId: ws.suiObjectId ?? null,
      })
      setNewWorkspace({ id: ws.id, suiObjectId: ws.suiObjectId ?? null, txDigest: ws.txDigest })
      toast.success("Workspace deployed on Sui Testnet")
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Deploy failed"
      toast.error(msg)
    } finally {
      setDeploying(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6" style={{ background: "#070B0E" }}>
      {/* Premium animated background */}
      <style>{`
        @keyframes _onbA { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,-30px) scale(1.08)} }
        @keyframes _onbB { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-30px,36px) scale(1.06)} }
        ._onb-a { animation:_onbA 26s ease-in-out infinite; }
        ._onb-b { animation:_onbB 32s ease-in-out infinite; }
      `}</style>
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="_onb-a absolute"
          style={{
            top: "-20%", right: "-10%", width: "60vw", height: "60vw", borderRadius: "50%",
            background: "radial-gradient(circle at center, rgba(140,170,255,0.22) 0%, transparent 60%)",
          }}
        />
        <div
          className="_onb-b absolute"
          style={{
            bottom: "-25%", left: "-10%", width: "55vw", height: "55vw", borderRadius: "50%",
            background: "radial-gradient(circle at center, rgba(173,255,47,0.10) 0%, transparent 60%)",
          }}
        />
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 140% 100% at 50% 50%, transparent 35%, rgba(3,6,11,0.7) 100%)",
        }}/>
      </div>
      <div className="relative z-10 w-full max-w-lg space-y-8">
        {/* Logo */}
        <div className="flex items-center gap-1.5">
          <Image src="/icon-512.png" alt="DevMind" width={28} height={28} className="h-7 w-7 rounded-[8px]" quality={100} />
          <span className="font-bold text-sm text-[#E8EDF0] tracking-[-0.02em]">DevMind</span>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-3">
          {STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-mono transition-all duration-300",
                    i < step ? "bg-[#ADFF2F] text-[#070B0E]" : i === step ? "border-2 border-[#ADFF2F] text-[#ADFF2F] shadow-[0_0_12px_rgba(173,255,47,0.3)]" : "border border-[rgba(255,255,255,0.1)] text-[#4B5563]"
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
        <div
          className="rounded-[20px] p-6 space-y-5"
          style={{
            background: "rgba(17,25,35,0.78)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          {step === 0 && (
            <>
              <h2 className="text-xl font-bold tracking-tight text-[#E8EDF0]">Connect your Sui wallet</h2>
              <p className="text-sm text-[#8B96A0]">Your workspace identity is anchored to your Sui address. No custody — you own the keys.</p>

              {account ? (
                <>
                  <div className="rounded-[12px] border border-[rgba(173,255,47,0.15)] bg-[rgba(173,255,47,0.04)] p-4 font-mono text-xs text-[#ADFF2F] break-all">
                    {account.address}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#8B96A0]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#ADFF2F]" />
                    Sui Testnet · Balance: {balance === null ? "…" : `${balance.toFixed(2)} SUI`}
                  </div>
                  <Button variant="primary" size="lg" className="w-full" onClick={handleSignIn} disabled={signing}>
                    {signing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing challenge…
                      </>
                    ) : (
                      "Sign & continue"
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <div className="rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-4 text-xs text-[#8B96A0]">
                    No wallet connected yet. Click below to pick a wallet extension.
                  </div>
                  <ConnectModal
                    trigger={
                      <Button variant="primary" size="lg" className="w-full">
                        Connect wallet
                      </Button>
                    }
                    open={connectOpen}
                    onOpenChange={setConnectOpen}
                  />
                </>
              )}
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="text-xl font-bold tracking-tight text-[#E8EDF0]">Create your workspace</h2>
              <p className="text-sm text-[#8B96A0]">A Sui Move smart contract will be deployed to register your workspace on Sui Testnet.</p>
              <p className="text-[11px] text-[#4B5563] font-mono">Signed in as {user?.suiAddress ? truncateAddress(user.suiAddress, 6) : "—"}</p>
              <div>
                <label className="text-xs font-mono text-[#4B5563] uppercase tracking-wider block mb-1.5">Workspace name</label>
                <input
                  placeholder="my-team"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={deploying}
                  className="w-full rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] backdrop-blur-sm px-3 py-2.5 text-sm text-[#E8EDF0] placeholder:text-[#4B5563] focus:outline-none focus:border-[rgba(173,255,47,0.4)] transition-colors duration-200 disabled:opacity-50"
                />
              </div>
              <Button variant="primary" size="lg" className="w-full" onClick={handleDeploy} disabled={!name.trim() || deploying}>
                {deploying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deploying contract…
                  </>
                ) : (
                  "Deploy workspace contract"
                )}
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl font-bold tracking-tight text-[#E8EDF0]">Workspace deployed</h2>
              <p className="text-sm text-[#8B96A0]">Add DevMind to your AI tool (one-time, via the Connect AI page).</p>
              {newWorkspace && (
                <div className="rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between gap-2 flex-wrap">
                    <span className="text-[#4B5563] shrink-0">Workspace ID</span>
                    <span className="text-[#ADFF2F] truncate min-w-0">{newWorkspace.id}</span>
                  </div>
                  {newWorkspace.suiObjectId && (
                    <div className="flex justify-between gap-2 flex-wrap">
                      <span className="text-[#4B5563] shrink-0">Sui object</span>
                      <a
                        href={`${env.NEXT_PUBLIC_SUI_EXPLORER}/object/${newWorkspace.suiObjectId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#8B96A0] hover:text-[#E8EDF0] flex items-center gap-1 min-w-0"
                      >
                        {truncateAddress(newWorkspace.suiObjectId, 6)}
                        <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                      </a>
                    </div>
                  )}
                  {newWorkspace.txDigest && (
                    <div className="flex justify-between gap-2 flex-wrap">
                      <span className="text-[#4B5563] shrink-0">Tx digest</span>
                      <a
                        href={`${env.NEXT_PUBLIC_SUI_EXPLORER}/tx/${newWorkspace.txDigest}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#8B96A0] hover:text-[#E8EDF0] flex items-center gap-1 min-w-0"
                      >
                        {truncateAddress(newWorkspace.txDigest, 6)}
                        <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                      </a>
                    </div>
                  )}
                </div>
              )}
              <div className="space-y-2">
                <p className="text-xs text-[#4B5563] font-mono">You can generate an API token + paste the MCP config from the /connect page.</p>
                <CodePill code="cd mcp-server && pnpm install && pnpm build" className="w-full" />
              </div>
              <Button variant="primary" size="lg" className="w-full" onClick={() => router.push("/dashboard")}>
                Open dashboard →
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
