"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CheckCircle, Wifi, Copy, Check, Terminal, Code2, Cpu, Key, Plus, Trash2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { apiTokensApi } from "@/lib/api-endpoints"
import { useAuthStore } from "@/lib/store/auth"
import { ApiError } from "@/lib/api"
import { env } from "@/lib/env"
import { timeAgo } from "@/lib/utils"

const STEPS = ["Install", "Configure", "Verify"]

const glass = {
  background: "rgba(17,25,35,0.88)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.09)",
  boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 4px 20px rgba(0,0,0,0.4)",
} as React.CSSProperties

function buildTools(workspaceId: string, tokenPlaceholder: string) {
  const apiUrl = env.NEXT_PUBLIC_API_URL
  return [
    {
      id: "claude-code",
      label: "Claude Code",
      icon: Terminal,
      file: "~/.claude.json",
      config: `{
  "mcpServers": {
    "devmind": {
      "command": "devmind-mcp",
      "env": {
        "DEVMIND_API_BASE_URL": "${apiUrl}",
        "DEVMIND_API_TOKEN": "${tokenPlaceholder}",
        "DEVMIND_WORKSPACE_ID": "${workspaceId}"
      }
    }
  }
}`,
    },
    {
      id: "cursor",
      label: "Cursor",
      icon: Code2,
      file: ".cursor/mcp.json",
      config: `{
  "mcpServers": {
    "devmind": {
      "command": "npx",
      "args": ["-y", "devmind-mcp-server"],
      "env": {
        "DEVMIND_API_BASE_URL": "${apiUrl}",
        "DEVMIND_API_TOKEN": "${tokenPlaceholder}",
        "DEVMIND_WORKSPACE_ID": "${workspaceId}"
      }
    }
  }
}`,
    },
    {
      id: "custom",
      label: "Custom MCP",
      icon: Cpu,
      file: "Any MCP client",
      config: `// stdio transport
const client = new McpClient({ transport: "stdio" })
await client.connect({
  command: "devmind-mcp",
  env: {
    DEVMIND_API_BASE_URL: "${apiUrl}",
    DEVMIND_API_TOKEN: "${tokenPlaceholder}",
    DEVMIND_WORKSPACE_ID: "${workspaceId}",
  }
})`,
    },
  ]
}

export default function ConnectPage() {
  const workspace = useAuthStore((s) => s.workspace)
  const workspaceId = workspace?.id ?? ""
  const queryClient = useQueryClient()

  const [active, setActive] = React.useState("claude-code")
  const [copiedInstall, setCopiedInstall] = React.useState(false)
  const [copiedConfig, setCopiedConfig] = React.useState(false)
  const [copiedRaw, setCopiedRaw] = React.useState(false)
  const [tokenName, setTokenName] = React.useState("")
  // newly created token (raw) shown ONCE
  const [rawToken, setRawToken] = React.useState<{ id: string; token: string; name: string } | null>(null)
  const [revokeId, setRevokeId] = React.useState<string | null>(null)

  const tokensQuery = useQuery({
    queryKey: ["api-tokens"],
    queryFn: () => apiTokensApi.list(),
  })

  const tokens = tokensQuery.data ?? []
  const verified = tokens.length > 0

  const createMutation = useMutation({
    mutationFn: (name: string) => apiTokensApi.create(name, workspaceId || undefined),
    onSuccess: (data) => {
      setRawToken({ id: data.id, token: data.token, name: data.name })
      setTokenName("")
      queryClient.invalidateQueries({ queryKey: ["api-tokens"] })
      toast.success("Token generated", { description: "Copy it now — it won't be shown again" })
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to create token"),
  })

  const revokeMutation = useMutation({
    mutationFn: (id: string) => apiTokensApi.revoke(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-tokens"] })
      toast.success("Token revoked")
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Revoke failed"),
  })

  const tokenPlaceholder = rawToken?.token ?? "dm_sk_..."
  const tools = buildTools(workspaceId || "ws_...", tokenPlaceholder)
  const tool = tools.find((t) => t.id === active)!

  const handleCopy = (text: string, type: "install" | "config" | "raw") => {
    navigator.clipboard.writeText(text)
    if (type === "install") {
      setCopiedInstall(true)
      setTimeout(() => setCopiedInstall(false), 2000)
    } else if (type === "config") {
      setCopiedConfig(true)
      setTimeout(() => setCopiedConfig(false), 2000)
    } else {
      setCopiedRaw(true)
      setTimeout(() => setCopiedRaw(false), 2000)
    }
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#E8EDF0]">Connect AI</h1>
        <p className="mt-0.5 text-sm text-[#8B96A0]">Add DevMind to your AI tool in under 2 minutes</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left: step progress */}
        <div className="lg:w-52 shrink-0">
          <div className="rounded-2xl p-4 space-y-1" style={glass}>
            {STEPS.map((label, i) => {
              const done = (i === 0) || (i === 1) || (i === 2 && verified)
              const active_step = i === 2 && !verified
              return (
                <div key={label} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                  <div
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-mono font-bold transition-all duration-300"
                    style={
                      done
                        ? { background: "rgba(173,255,47,0.15)", border: "1px solid rgba(173,255,47,0.3)", color: "#ADFF2F" }
                        : active_step
                        ? { border: "1px solid rgba(255,255,255,0.2)", color: "#8B96A0" }
                        : { border: "1px solid rgba(255,255,255,0.08)", color: "#4B5563" }
                    }
                  >
                    {done ? <CheckCircle className="h-3 w-3" /> : i + 1}
                  </div>
                  <span className="text-sm" style={{ color: done || active_step ? "#E8EDF0" : "#4B5563" }}>
                    {label}
                  </span>
                  {i === 2 && verified && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#ADFF2F]" style={{ boxShadow: "0 0 6px #ADFF2F" }} />
                  )}
                </div>
              )
            })}

            <div className="hidden lg:block border-t border-[rgba(255,255,255,0.06)] pt-3 mt-2 space-y-1">
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#4B5563] px-3">MCP Tools</p>
              {["save_memory", "get_memory", "share_context", "save_artifact"].map((t) => (
                <div key={t} className="flex items-center gap-2 px-3 py-1">
                  <span className="h-1 w-1 rounded-full bg-[#ADFF2F] opacity-60" />
                  <span className="text-[11px] font-mono text-[#8B96A0]">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: step content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Step 1: Install */}
          <div className="overflow-hidden rounded-2xl" style={glass}>
            <div className="flex items-center gap-3 border-b border-[rgba(255,255,255,0.06)] px-5 py-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-mono font-bold"
                style={{ background: "rgba(173,255,47,0.12)", border: "1px solid rgba(173,255,47,0.25)", color: "#ADFF2F" }}>
                1
              </span>
              <h2 className="text-sm font-semibold text-[#E8EDF0]">Install the MCP server</h2>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 rounded-[10px] px-4 py-3"
                style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <span className="text-[#4B5563] font-mono text-sm select-none">$</span>
                <code className="flex-1 text-sm font-mono text-[#ADFF2F]">npm install -g devmind-mcp-server</code>
                <button
                  onClick={() => handleCopy("npm install -g devmind-mcp-server", "install")}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] transition-all duration-150"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {copiedInstall ? <Check className="h-3.5 w-3.5 text-[#ADFF2F]" /> : <Copy className="h-3.5 w-3.5 text-[#8B96A0]" />}
                </button>
              </div>
            </div>
          </div>

          {/* API tokens block */}
          <div className="overflow-hidden rounded-2xl" style={glass}>
            <div className="flex items-center gap-3 border-b border-[rgba(255,255,255,0.06)] px-5 py-4">
              <Key className="h-4 w-4 text-[#8B96A0]" />
              <h2 className="text-sm font-semibold text-[#E8EDF0]">API tokens</h2>
            </div>
            <div className="p-5 space-y-4">
              {/* Generate */}
              <div className="flex gap-2">
                <input
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  placeholder="Token name (e.g. claude-code-laptop)"
                  className="flex-1 rounded-[10px] px-3 py-2 text-xs font-mono text-[#E8EDF0] placeholder:text-[#4B5563] focus:outline-none transition-all duration-200"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                />
                <Button
                  variant="primary"
                  size="sm"
                  className="gap-1.5 shrink-0"
                  loading={createMutation.isPending}
                  disabled={!tokenName.trim()}
                  onClick={() => createMutation.mutate(tokenName.trim())}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Generate
                </Button>
              </div>

              {/* Show raw token once */}
              {rawToken && (
                <div
                  className="rounded-[10px] p-3 space-y-2"
                  style={{ background: "rgba(173,255,47,0.06)", border: "1px solid rgba(173,255,47,0.25)" }}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-[#ADFF2F]" />
                    <p className="text-xs text-[#ADFF2F] font-medium">Copy now — this token will not be shown again</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 min-w-0 rounded-[8px] px-2.5 py-2 text-xs font-mono text-[#ADFF2F] truncate"
                      style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(173,255,47,0.18)" }}>
                      {rawToken.token}
                    </code>
                    <button
                      onClick={() => handleCopy(rawToken.token, "raw")}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] transition-all duration-150"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      {copiedRaw ? <Check className="h-3.5 w-3.5 text-[#ADFF2F]" /> : <Copy className="h-3.5 w-3.5 text-[#8B96A0]" />}
                    </button>
                    <button
                      onClick={() => setRawToken(null)}
                      className="text-[10px] font-mono text-[#4B5563] hover:text-[#8B96A0] px-2"
                    >
                      dismiss
                    </button>
                  </div>
                </div>
              )}

              {/* Existing tokens */}
              <div className="space-y-1">
                {tokensQuery.isLoading ? (
                  <p className="text-xs text-[#4B5563]">Loading tokens…</p>
                ) : tokens.length === 0 ? (
                  <p className="text-xs text-[#4B5563]">No tokens yet — generate one above.</p>
                ) : (
                  tokens.map((t) => (
                    <div key={t.id} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[#E8EDF0] truncate">{t.name}</p>
                        <p className="text-[10px] font-mono text-[#4B5563]">
                          {t.prefix}··· · {t.lastUsedAt ? `used ${timeAgo(t.lastUsedAt)}` : "never used"}
                        </p>
                      </div>
                      <button
                        onClick={() => setRevokeId(t.id)}
                        disabled={revokeMutation.isPending}
                        className="flex h-7 w-7 items-center justify-center rounded-[8px] text-[#4B5563] hover:text-[#F87171] hover:bg-[rgba(248,113,113,0.1)] transition-all duration-150"
                        title="Revoke"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="overflow-hidden rounded-2xl" style={glass}>
            <div className="flex items-center gap-3 border-b border-[rgba(255,255,255,0.06)] px-5 py-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-mono font-bold"
                style={{ background: "rgba(173,255,47,0.12)", border: "1px solid rgba(173,255,47,0.25)", color: "#ADFF2F" }}>
                2
              </span>
              <h2 className="text-sm font-semibold text-[#E8EDF0]">Add to your AI tool config</h2>
            </div>
            <div className="p-5 space-y-4">
              {/* Tool selector */}
              <div className="flex flex-wrap gap-2">
                {tools.map((t) => {
                  const Icon = t.icon
                  const isActive = active === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActive(t.id)}
                      className="flex flex-1 min-w-[80px] items-center justify-center gap-2 rounded-[10px] px-3 py-2.5 text-xs font-medium transition-all duration-200 cursor-pointer"
                      style={isActive
                        ? { background: "rgba(173,255,47,0.1)", border: "1px solid rgba(173,255,47,0.25)", color: "#ADFF2F" }
                        : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#8B96A0" }
                      }
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span>{t.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Code block */}
              <div className="overflow-hidden rounded-[10px]" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] px-4 py-2.5">
                  <span className="text-[10px] font-mono text-[#4B5563]">{tool.file}</span>
                  <button
                    onClick={() => handleCopy(tool.config, "config")}
                    className="flex items-center gap-1.5 rounded-[6px] px-2 py-1 text-[10px] font-mono transition-all duration-150"
                    style={{ background: copiedConfig ? "rgba(173,255,47,0.1)" : "rgba(255,255,255,0.05)", color: copiedConfig ? "#ADFF2F" : "#8B96A0", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    {copiedConfig ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copiedConfig ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono leading-relaxed overflow-x-auto" style={{ color: "#8B96A0" }}>
                  <code>{tool.config}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="overflow-hidden rounded-2xl transition-all duration-500" style={verified
            ? { ...glass, background: "rgba(173,255,47,0.06)", border: "1px solid rgba(173,255,47,0.2)" }
            : glass
          }>
            <div className="flex items-center gap-3 border-b border-[rgba(255,255,255,0.06)] px-5 py-4"
              style={{ borderColor: verified ? "rgba(173,255,47,0.1)" : undefined }}>
              <span className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-mono font-bold"
                style={verified
                  ? { background: "rgba(173,255,47,0.15)", border: "1px solid rgba(173,255,47,0.3)", color: "#ADFF2F" }
                  : { background: "rgba(173,255,47,0.12)", border: "1px solid rgba(173,255,47,0.25)", color: "#ADFF2F" }
                }>
                3
              </span>
              <h2 className="text-sm font-semibold text-[#E8EDF0]">Verify connection</h2>
              {verified && (
                <span className="ml-auto flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-mono text-[#ADFF2F]"
                  style={{ background: "rgba(173,255,47,0.1)", border: "1px solid rgba(173,255,47,0.2)" }}>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ADFF2F]" style={{ boxShadow: "0 0 6px #ADFF2F" }} />
                  Live
                </span>
              )}
            </div>
            <div className="flex items-start gap-4 p-5">
              {verified ? (
                <>
                  <CheckCircle className="h-5 w-5 shrink-0 text-[#ADFF2F]" />
                  <div>
                    <p className="font-medium text-[#ADFF2F]">Token issued</p>
                    <div className="mt-1.5" style={{ background: "rgba(173,255,47,0.06)", border: "1px solid rgba(173,255,47,0.2)", borderRadius: 10, padding: "12px 16px" }}>
                      <p className="text-sm text-[#ADFF2F]">{tokens.length} active token{tokens.length === 1 ? "" : "s"} · workspace {workspace?.name ?? workspaceId.slice(0, 8)} · 4 tools registered</p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {["save_memory", "get_memory", "share_context", "save_artifact"].map((t) => (
                        <span key={t} className="text-[10px] font-mono text-[#ADFF2F] rounded-md px-2 py-0.5"
                          style={{ background: "rgba(173,255,47,0.08)", border: "1px solid rgba(173,255,47,0.15)" }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Wifi className="h-5 w-5 shrink-0 text-[#8B96A0] animate-pulse" />
                  <div>
                    <p className="font-medium text-[#8B96A0]">Waiting for first token…</p>
                    <p className="mt-0.5 text-sm text-[#4B5563]">Generate a token above, then start your AI tool with the config to connect.</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Revoke confirm */}
      <ConfirmDialog
        open={revokeId !== null}
        onOpenChange={(open) => !open && setRevokeId(null)}
        title="Revoke this token?"
        description="Any AI tool using this token will lose access immediately."
        confirmLabel="Revoke"
        variant="destructive"
        onConfirm={() => {
          if (revokeId) revokeMutation.mutate(revokeId)
          setRevokeId(null)
        }}
      />
    </div>
  )
}
