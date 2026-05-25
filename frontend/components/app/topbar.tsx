"use client"

import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"
import { useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit"
import { WalletPill } from "@/components/ui/wallet-pill"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/store/auth"
import { logout } from "@/lib/auth"

interface TopbarProps {
  title?: string
}

export function Topbar({ title }: TopbarProps) {
  const router = useRouter()
  const account = useCurrentAccount()
  const { mutate: disconnectWallet } = useDisconnectWallet()
  const workspace = useAuthStore((s) => s.workspace)

  function handleDisconnect() {
    logout()
    disconnectWallet()
    router.replace("/auth")
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-[rgba(255,255,255,0.06)] bg-[#0A1014] px-6">
      <div className="flex items-center gap-3">
        {title && (
          <h1 className="text-sm font-semibold text-[#E8EDF0]">{title}</h1>
        )}
        {workspace && (
          <span className="rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-2.5 py-0.5 text-xs font-mono text-[#8B96A0]">
            {workspace.name}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" className="relative">
          <Bell className="h-4 w-4" />
        </Button>
        <WalletPill
          connected={!!account}
          address={account?.address}
          onDisconnect={handleDisconnect}
        />
      </div>
    </header>
  )
}
