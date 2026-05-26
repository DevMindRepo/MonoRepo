"use client"

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
                      "hover:border-[rgba(173,255,47,0.3)] hover:bg-[rgba(173,255,47,0.04)]",
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
              <div className="rounded-[12px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4 text-center space-y-2">
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
              className="w-full rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-3 py-2.5 text-sm text-[#4B5563] placeholder:text-[#4B5563] cursor-not-allowed"
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
