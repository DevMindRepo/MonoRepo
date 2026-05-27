"use client"

import * as React from "react"
import Image from "next/image"
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
              <div className="rounded-[12px] border border-[rgba(173,255,47,0.15)] bg-[rgba(173,255,47,0.04)] p-4 font-mono text-xs text-[#ADFF2F] break-all">
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
              <h2 className="text-xl font-bold tracking-tight text-[#E8EDF0]">Create your workspace</h2>
              <p className="text-sm text-[#8B96A0]">A Sui Move smart contract will be deployed to register your workspace on Sui Testnet.</p>
              <div>
                <label className="text-xs font-mono text-[#4B5563] uppercase tracking-wider block mb-1.5">Workspace name</label>
                <input
                  placeholder="my-team"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] backdrop-blur-sm px-3 py-2.5 text-sm text-[#E8EDF0] placeholder:text-[#4B5563] focus:outline-none focus:border-[rgba(173,255,47,0.4)] transition-colors duration-200"
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
              <h2 className="text-xl font-bold tracking-tight text-[#E8EDF0]">Connect your AI tool</h2>
              <p className="text-sm text-[#8B96A0]">Add DevMind to Claude Code in one step:</p>
              <div className="space-y-2">
                <CodePill code="npm install -g devmind" className="w-full" />
                <p className="text-xs text-[#4B5563] font-mono pl-1">then add to ~/.claude.json:</p>
                <CodePill code={`"devmind": { "command": "devmind", "env": { "DEVMIND_WORKSPACE": "ws_${name.replace(/[^a-z0-9]/gi,'').toLowerCase()}_abc", "DEVMIND_API_KEY": "dm_sk_••••••••••" } }`} className="w-full" />
              </div>
              <Button variant="primary" size="lg" className="w-full" onClick={() => { setStep(3); setTimeout(() => router.push("/dashboard"), 500) }}>
                Open dashboard →
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
