"use client"

import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit"
import { Toaster } from "sonner"
import "@mysten/dapp-kit/dist/index.css"
import { env } from "@/lib/env"

const networks = {
  testnet: { url: "https://fullnode.testnet.sui.io:443" },
  mainnet: { url: "https://fullnode.mainnet.sui.io:443" },
  devnet: { url: "https://fullnode.devnet.sui.io:443" },
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork={env.NEXT_PUBLIC_SUI_NETWORK}>
        <WalletProvider autoConnect>
          {children}
          <Toaster
            theme="dark"
            position="bottom-right"
            richColors
            toastOptions={{
              style: {
                background: "rgba(17,25,35,0.97)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.09)",
                color: "#E8EDF0",
                boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 8px 32px rgba(0,0,0,0.5)",
                fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                fontSize: "13px",
              },
              classNames: {
                success: "!text-[#E8EDF0]",
                error: "!text-[#E8EDF0]",
              },
            }}
          />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  )
}
