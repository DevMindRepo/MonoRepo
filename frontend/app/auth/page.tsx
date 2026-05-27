"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useConnectWallet, useCurrentAccount, useWallets } from "@mysten/dapp-kit"
import { Wallet, ArrowRight, Loader2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/store/auth"
import { cn } from "@/lib/utils"

export default function AuthPage() {
  const router = useRouter()
  const account = useCurrentAccount()
  const wallets = useWallets()
  const { mutate: connectWallet, isPending } = useConnectWallet()
  const { token, setSession } = useAuthStore()
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null)

  // If wallet connected and session set, go to dashboard
  useEffect(() => {
    if (account && token) {
      router.push("/dashboard")
    }
  }, [account, token, router])

  // When wallet connects, set auth session in store
  useEffect(() => {
    if (account && !token) {
      setSession(`wallet_${account.address}`, {
        id: account.address,
        suiAddress: account.address,
        displayName: null,
      })
      router.push("/onboarding")
    }
  }, [account, token, setSession, router])

  const handleConnect = (walletName: string) => {
    const wallet = wallets.find((w) => w.name === walletName)
    if (!wallet) return
    setConnectingWallet(walletName)
    connectWallet({ wallet }, { onError: () => setConnectingWallet(null) })
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6" style={{ background: "#070B0E" }}>
      {/* Premium animated background */}
      <style>{`
        @keyframes _authA { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,-30px) scale(1.08)} }
        @keyframes _authB { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-30px,36px) scale(1.06)} }
        ._auth-a { animation:_authA 26s ease-in-out infinite; }
        ._auth-b { animation:_authB 32s ease-in-out infinite; }
      `}</style>
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="_auth-a absolute"
          style={{
            top: "-20%", right: "-10%", width: "60vw", height: "60vw", borderRadius: "50%",
            background: "radial-gradient(circle at center, rgba(140,170,255,0.22) 0%, transparent 60%)",
          }}
        />
        <div
          className="_auth-b absolute"
          style={{
            bottom: "-25%", left: "-10%", width: "55vw", height: "55vw", borderRadius: "50%",
            background: "radial-gradient(circle at center, rgba(173,255,47,0.10) 0%, transparent 60%)",
          }}
        />
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 140% 100% at 50% 50%, transparent 35%, rgba(3,6,11,0.7) 100%)",
        }}/>
      </div>
      <div className="relative z-10 w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Image src="/icon-512.png" alt="DevMind" width={56} height={56} className="h-14 w-14 rounded-[16px]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#E8EDF0]">Welcome to DevMind</h1>
          <p className="text-sm text-[#8B96A0]">Sign in with your Sui wallet to continue</p>
        </div>

        {/* Card */}
        <div
          className="rounded-[20px] p-6 space-y-4"
          style={{
            background: "rgba(17,25,35,0.78)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          {wallets.length > 0 ? (
            <div className="space-y-2">
              {wallets.map((wallet) => {
                const isConnecting = connectingWallet === wallet.name && isPending
                return (
                  <button
                    key={wallet.name}
                    onClick={() => handleConnect(wallet.name)}
                    disabled={isPending}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-[12px] border px-4 py-3 text-sm font-medium transition-all duration-200",
                      "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[#E8EDF0]",
                      "hover:border-[rgba(173,255,47,0.3)] hover:bg-[rgba(173,255,47,0.04)] hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {wallet.icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={wallet.icon} alt={wallet.name} className="h-5 w-5 rounded-md" />
                    ) : (
                      <Wallet className="h-5 w-5 text-[#ADFF2F]" />
                    )}
                    <span className="flex-1 text-left">{wallet.name}</span>
                    {isConnecting ? (
                      <Loader2 className="h-4 w-4 animate-spin text-[#ADFF2F]" />
                    ) : (
                      <ArrowRight className="h-4 w-4 text-[#4B5563]" />
                    )}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-[12px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-4 text-center space-y-2">
                <Wallet className="h-8 w-8 text-[#4B5563] mx-auto" />
                <p className="text-sm text-[#8B96A0]">No Sui wallet detected</p>
                <p className="text-xs text-[#4B5563]">Install a Sui wallet extension to continue</p>
              </div>
              <Button asChild variant="primary" size="lg" className="w-full gap-2">
                <a href="https://suiwallet.com" target="_blank" rel="noreferrer">
                  <Download className="h-4 w-4" />
                  Install Sui Wallet
                </a>
              </Button>
            </div>
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
              className="w-full rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-3 py-2.5 text-sm text-[#4B5563] placeholder:text-[#4B5563] cursor-not-allowed transition-colors duration-150"
            />
            <Button variant="outline" size="lg" className="w-full opacity-40" disabled>
              Continue with email
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-[#4B5563]">
          Your memory is encrypted with Seal before it leaves your browser.{" "}
          <Link href="#" className="text-[#ADFF2F] hover:underline">Learn more</Link>
        </p>
      </div>
    </div>
  )
}
