"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Wallet, ChevronDown, LogOut } from "lucide-react"
import { cn, truncateAddress } from "@/lib/utils"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface WalletPillProps {
  address?: string
  connected?: boolean
  onConnect?: () => void
  onDisconnect?: () => void
  className?: string
}

export function WalletPill({
  address,
  connected = false,
  onConnect,
  onDisconnect,
  className,
}: WalletPillProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [confirmOpen, setConfirmOpen] = React.useState(false)

  const handleDisconnectConfirmed = () => {
    onDisconnect?.()
    router.push("/")
  }

  if (!connected || !address) {
    return (
      <button
        onClick={onConnect}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-[rgba(173,255,47,0.25)] bg-[rgba(173,255,47,0.06)] px-3 py-1.5 text-xs font-medium text-[#ADFF2F] transition-all duration-200 hover:border-[rgba(173,255,47,0.4)] hover:bg-[rgba(173,255,47,0.1)] cursor-pointer",
          className
        )}
      >
        <Wallet className="h-3 w-3" />
        Connect Wallet
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-[rgba(173,255,47,0.2)] bg-[rgba(173,255,47,0.06)] px-3 py-1.5 text-xs font-mono text-[#ADFF2F] transition-all duration-200 hover:border-[rgba(173,255,47,0.35)] hover:bg-[rgba(173,255,47,0.1)] cursor-pointer",
          className
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#ADFF2F] shadow-[0_0_6px_rgba(173,255,47,0.8)]" />
        {truncateAddress(address)}
        <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 min-w-[160px] max-w-[220px] rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-[#11181C] p-1 shadow-[0_8px_24px_rgba(0,0,0,0.4)] z-[60]">
          <div className="px-3 py-2 text-xs text-[#8B96A0] font-mono border-b border-[rgba(255,255,255,0.06)] mb-1">
            {truncateAddress(address, 6)}
          </div>
          <button
            onClick={() => { setOpen(false); setConfirmOpen(true) }}
            className="flex w-full items-center gap-2 rounded-[6px] px-3 py-2 text-xs text-[#F87171] hover:bg-[rgba(248,113,113,0.1)] transition-colors duration-150 cursor-pointer"
          >
            <LogOut className="h-3 w-3" />
            Disconnect
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Disconnect wallet?"
        description="You'll be signed out and returned to the home page."
        confirmLabel="Disconnect"
        variant="destructive"
        onConfirm={handleDisconnectConfirmed}
      />
    </div>
  )
}
