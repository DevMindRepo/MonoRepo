"use client"

import * as React from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { CodePill } from "@/components/ui/code-pill"
import { Button } from "@/components/ui/button"
import { CheckCircle, Copy, Eye, EyeOff, KeyRound, Loader2, Trash2 } from "lucide-react"
import { apiTokensApi } from "@/lib/api-endpoints"
import { useAuthStore } from "@/lib/store/auth"
import { env } from "@/lib/env"
import { ApiError } from "@/lib/api"
import { timeAgo } from "@/lib/utils"

interface ToolConfig {
  id: string
  label: string
  file: string
  build: (params: { apiUrl: string; token: string; workspaceId: string }) => string
}

const TOOLS: ToolConfig[] = [
  {
    id: "claude-code",
    label: "Claude Code",
    file: "~/.claude.json",
    build: ({ apiUrl, token, workspaceId }) => `{
  "mcpServers": {
    "devmind": {
      "command": "node",
      "args": ["E:/devmind/mcp-server/dist/index.js"],
      "env": {
        "DEVMIND_API_BASE_URL": "${apiUrl}",
        "DEVMIND_API_TOKEN": "${token}",
        "DEVMIND_WORKSPACE_ID": "${workspaceId}"
      }
    }
  }
}`,
  },
  {
    id: "cursor",
    label: "Cursor",
    file: ".cursor/mcp.json",
    build: ({ apiUrl, token, workspaceId }) => `{
  "mcpServers": {
    "devmind": {
      "command": "node",
      "args": ["E:/devmind/mcp-server/dist/index.js"],
      "env": {
        "DEVMIND_API_BASE_URL": "${apiUrl}",
        "DEVMIND_API_TOKEN": "${token}",
        "DEVMIND_WORKSPACE_ID": "${workspaceId}"
      }
    }
  }
}`,
  },
  {
    id: "custom",
    label: "Custom MCP client",
    file: "Any MCP client",
    build: ({ apiUrl, token, workspaceId }) => `// stdio transport
const client = new McpClient({ transport: "stdio" })
await client.connect({
  command: "node",
  args: ["E:/devmind/mcp-server/dist/index.js"],
  env: {
    DEVMIND_API_BASE_URL: "${apiUrl}",
    DEVMIND_API_TOKEN: "${token}",
    DEVMIND_WORKSPACE_ID: "${workspaceId}",
  }
})`,
  },
]

export default function ConnectPage() {
  const workspace = useAuthStore((s) => s.workspace)
  const [active, setActive] = React.useState("claude-code")
  const [tokenName, setTokenName] = React.useState("My laptop")
  const [generatedToken, setGeneratedToken] = React.useState<string | null>(null)
  const [showToken, setShowToken] = React.useState(false)

  const tokensQuery = useQuery({
    queryKey: ["api-tokens"],
    queryFn: () => apiTokensApi.list(),
  })

  const createMutation = useMutation({
    mutationFn: () => apiTokensApi.create(tokenName.trim(), workspace?.id),
    onSuccess: (data) => {
      setGeneratedToken(data.token)
      setShowToken(true)
      tokensQuery.refetch()
      toast.success("API token created — copy it now")
    },
    onError: (err) => {
      const message = err instanceof ApiError ? err.message : "Failed to create token"
      toast.error(message)
    },
  })

  const revokeMutation = useMutation({
    mutationFn: (id: string) => apiTokensApi.revoke(id),
    onSuccess: () => {
      tokensQuery.refetch()
      toast.success("Token revoked")
    },
  })

  const tool = TOOLS.find((t) => t.id === active)!
  const config = tool.build({
    apiUrl: env.NEXT_PUBLIC_API_URL,
    token: generatedToken ?? "dm_sk_...",
    workspaceId: workspace?.id ?? "<workspace-id>",
  })

  function copyConfig() {
    navigator.clipboard.writeText(config)
    toast.success("Config copied to clipboard")
  }

  function copyToken() {
    if (!generatedToken) return
    navigator.clipboard.writeText(generatedToken)
    toast.success("Token copied to clipboard")
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-[#E8EDF0]">Connect your AI</h1>
        <p className="text-sm text-[#8B96A0] mt-0.5">
          Generate an API token and add DevMind to your AI tool
        </p>
      </div>

      {/* Step 1 — Build MCP */}
      <div className="rounded-[14px] border border-[rgba(255,255,255,0.06)] bg-[#11181C] p-5 space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(173,255,47,0.15)] text-xs font-mono font-bold text-[#ADFF2F]">
            1
          </span>
          <h2 className="text-sm font-semibold text-[#E8EDF0]">Build the MCP server</h2>
        </div>
        <CodePill code="cd mcp-server && pnpm install && pnpm build" className="w-full" />
        <p className="text-xs text-[#4B5563]">
          Outputs to <span className="font-mono text-[#8B96A0]">mcp-server/dist/index.js</span>. Skip if already built.
        </p>
      </div>

      {/* Step 2 — Generate token */}
      <div className="rounded-[14px] border border-[rgba(255,255,255,0.06)] bg-[#11181C] p-5 space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(173,255,47,0.15)] text-xs font-mono font-bold text-[#ADFF2F]">
            2
          </span>
          <h2 className="text-sm font-semibold text-[#E8EDF0]">Generate API token</h2>
        </div>

        {!generatedToken && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                placeholder="Token name (e.g. My laptop)"
                disabled={createMutation.isPending}
                className="flex-1 rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[#161D22] px-3 py-2 text-sm text-[#E8EDF0] placeholder:text-[#4B5563] focus:outline-none focus:border-[rgba(173,255,47,0.4)] transition-colors duration-200 disabled:opacity-50"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() => createMutation.mutate()}
                disabled={!tokenName.trim() || createMutation.isPending}
                className="gap-1.5"
              >
                {createMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}
                Generate
              </Button>
            </div>
            <p className="text-xs text-[#4B5563]">
              Tokens never expire (until you revoke them) and authenticate the MCP server to DevMind.
            </p>
          </div>
        )}

        {generatedToken && (
          <div className="space-y-3">
            <div className="rounded-[10px] border border-[rgba(173,255,47,0.25)] bg-[rgba(173,255,47,0.04)] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#ADFF2F] uppercase tracking-wider">Your new token (save it now)</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => setShowToken((v) => !v)}>
                    {showToken ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={copyToken}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <p className="font-mono text-xs text-[#ADFF2F] break-all">
                {showToken ? generatedToken : generatedToken.slice(0, 12) + "•".repeat(40)}
              </p>
            </div>
            <button
              onClick={() => {
                setGeneratedToken(null)
                setShowToken(false)
                setTokenName("")
              }}
              className="text-xs font-mono text-[#8B96A0] hover:text-[#E8EDF0] transition-colors duration-150"
            >
              ← Generate another token
            </button>
          </div>
        )}

        {/* Existing tokens */}
        {tokensQuery.data && tokensQuery.data.length > 0 && (
          <div className="pt-3 border-t border-[rgba(255,255,255,0.06)] space-y-2">
            <p className="text-[10px] font-mono text-[#4B5563] uppercase tracking-wider">Existing tokens</p>
            {tokensQuery.data.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0 flex-1">
                  <p className="text-[#E8EDF0] truncate">{t.name}</p>
                  <p className="font-mono text-[10px] text-[#4B5563]">
                    {t.prefix}•••• · {t.lastUsedAt ? `last used ${timeAgo(t.lastUsedAt)}` : "never used"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => revokeMutation.mutate(t.id)}
                  disabled={revokeMutation.isPending}
                  className="text-[#F87171] hover:bg-[rgba(248,113,113,0.1)]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Step 3 — Add config */}
      <div className="rounded-[14px] border border-[rgba(255,255,255,0.06)] bg-[#11181C] p-5 space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(173,255,47,0.15)] text-xs font-mono font-bold text-[#ADFF2F]">
            3
          </span>
          <h2 className="text-sm font-semibold text-[#E8EDF0]">Add to your AI tool config</h2>
        </div>

        <div className="flex gap-1 bg-[rgba(255,255,255,0.04)] rounded-[10px] p-1">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`flex-1 rounded-[8px] px-3 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer ${
                active === t.id
                  ? "bg-[#11181C] text-[#E8EDF0] shadow-sm"
                  : "text-[#8B96A0] hover:text-[#E8EDF0]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div>
          <p className="text-xs font-mono text-[#4B5563] mb-2">{tool.file}</p>
          <div className="rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[#0D1317] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[rgba(255,255,255,0.06)]">
              <span className="text-[10px] font-mono text-[#4B5563]">{tool.file}</span>
            </div>
            <pre className="p-4 text-xs font-mono text-[#8B96A0] leading-relaxed overflow-x-auto">
              <code>{config}</code>
            </pre>
          </div>
          <button
            onClick={copyConfig}
            className="mt-2 text-xs font-mono text-[#ADFF2F] hover:underline cursor-pointer transition-all duration-150 inline-flex items-center gap-1"
          >
            <Copy className="h-3 w-3" />
            Copy config
          </button>
          {!generatedToken && (
            <p className="text-xs text-[#F472B6] mt-2">
              Generate a token in step 2 first — config above shows a placeholder.
            </p>
          )}
        </div>
      </div>

      {/* Verification */}
      <div className="rounded-[14px] border border-[rgba(255,255,255,0.06)] bg-[#11181C] p-5 space-y-3">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-[#ADFF2F]" />
          <div>
            <p className="text-sm text-[#E8EDF0] font-medium">You're ready</p>
            <p className="text-xs text-[#8B96A0]">
              Restart your AI tool. Test by asking it to <span className="font-mono text-[#ADFF2F]">save a memory</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
