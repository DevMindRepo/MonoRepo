"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CodePill } from "@/components/ui/code-pill"
import { Check, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/store/auth"

const STEPS = ["Connect wallet", "Create workspace", "Connect AI tool"]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = React.useState(0)
  const [name, setName] = React.useState("")
  const { setWorkspace } = useAuthStore()

  const handleDeploy = () => {
    const wsId = `ws_${name.replace(/[^a-z0-9]/gi, "").toLowerCase()}_abc`
    setWorkspace({ id: wsId, name, suiObjectId: "0x9a8b…1a0b" })
    router.push("/dashboard")
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
              <p className="text-sm text-[#8B96A0]">Your workspace identity is anchored to your Sui address. No custody — you own the keys.</p>
              <div className="rounded-[12px] border border-[rgba(173,255,47,0.15)] bg-[rgba(173,255,47,0.04)] p-4 font-mono text-xs text-[#ADFF2F]">
                0x7f3a9b2c8d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a
              </div>
              <div className="flex items-center gap-2 text-xs text-[#8B96A0]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ADFF2F]" />
                Sui Testnet · Balance: 10.5 SUI
              </div>
              <Button variant="primary" size="lg" className="w-full" onClick={() => setStep(1)}>
                Continue
              </Button>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="text-lg font-semibold text-[#E8EDF0]">Create your workspace</h2>
              <p className="text-sm text-[#8B96A0]">A Sui Move smart contract will be deployed to register your workspace on Sui Testnet.</p>
              <div>
                <label className="text-xs font-mono text-[#4B5563] uppercase tracking-wider block mb-1.5">Workspace name</label>
                <input
                  placeholder="my-team"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[#161D22] px-3 py-2.5 text-sm text-[#E8EDF0] placeholder:text-[#4B5563] focus:outline-none focus:border-[rgba(173,255,47,0.4)] transition-colors duration-200"
                />
              </div>
              {name && (
                <div className="rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between gap-2 flex-wrap">
                    <span className="text-[#4B5563] shrink-0">Workspace ID</span>
                    <span className="text-[#ADFF2F] truncate min-w-0">ws_{name.replace(/[^a-z0-9]/gi, '').toLowerCase()}_abc</span>
                  </div>
                  <div className="flex justify-between gap-2 flex-wrap">
                    <span className="text-[#4B5563] shrink-0">Sui object</span>
                    <span className="text-[#8B96A0] flex items-center gap-1 min-w-0">0x9a8b…1a0b <ExternalLink className="h-2.5 w-2.5 shrink-0" /></span>
                  </div>
                </div>
              )}
              <Button variant="primary" size="lg" className="w-full" onClick={handleDeploy} disabled={!name}>
                Deploy workspace contract
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-lg font-semibold text-[#E8EDF0]">Connect your AI tool</h2>
              <p className="text-sm text-[#8B96A0]">Add DevMind to Claude Code in one step:</p>
              <div className="space-y-2">
                <CodePill code="npm install -g devmind" className="w-full" />
                <p className="text-xs text-[#4B5563] font-mono pl-1">then add to ~/.claude.json:</p>
                <CodePill code={`"devmind": { "command": "devmind", "env": { "DEVMIND_WORKSPACE": "ws_${name.replace(/[^a-z0-9]/gi,'').toLowerCase()}_abc" } }`} className="w-full" />
              </div>
              <Button asChild variant="primary" size="lg" className="w-full">
                <Link href="/dashboard">Open dashboard →</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
