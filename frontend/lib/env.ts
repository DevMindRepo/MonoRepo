import { z } from "zod"

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:3001"),
  NEXT_PUBLIC_SUI_NETWORK: z.enum(["testnet", "mainnet", "devnet"]).default("testnet"),
  NEXT_PUBLIC_SUI_EXPLORER: z.string().url().default("https://suiscan.xyz/testnet"),
  NEXT_PUBLIC_WALRUS_AGGREGATOR: z
    .string()
    .url()
    .default("https://aggregator.walrus-testnet.walrus.space"),
})

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SUI_NETWORK: process.env.NEXT_PUBLIC_SUI_NETWORK,
  NEXT_PUBLIC_SUI_EXPLORER: process.env.NEXT_PUBLIC_SUI_EXPLORER,
  NEXT_PUBLIC_WALRUS_AGGREGATOR: process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR,
})

if (!parsed.success) {
  console.error("Invalid env vars:", parsed.error.flatten().fieldErrors)
  throw new Error("Invalid public env vars")
}

export const env = parsed.data
