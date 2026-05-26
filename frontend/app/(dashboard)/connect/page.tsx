"use client"

import * as React from "react"
import { CodePill } from "@/components/ui/code-pill"
import { CheckCircle, Circle, Wifi } from "lucide-react"

const TOOLS = [
  {
    id: "claude-code",
    label: "Claude Code",
    file: "~/.claude.json",
    config: `{
  "mcpServers": {
    "devmind": {
      "command": "devmind",
      "env": {
        "DEVMIND_WORKSPACE": "ws_abc123xyz",
        "DEVMIND_API_KEY": "dm_sk_..."
      }
    }
  }
}`,
  },
  {
    id: "cursor",
    label: "Cursor",
    file: ".cursor/mcp.json",
    config: `{
  "mcpServers": {
    "devmind": {
      "command": "npx",
      "args": ["-y", "devmind-mcp"],
      "env": {
        "DEVMIND_WORKSPACE": "ws_abc123xyz",
        "DEVMIND_API_KEY": "dm_sk_..."
      }
    }
  }
}`,
  },
  {
    id: "custom",
    label: "Custom MCP client",
    file: "Any MCP client",
    config: `// stdio transport
const client = new McpClient({ transport: "stdio" })
await client.connect({
  command: "devmind",
  env: {
    DEVMIND_WORKSPACE: "ws_abc123xyz",
    DEVMIND_API_KEY: "dm_sk_...",
  }
})`,
  },
]

export default function ConnectPage() {
  const [active, setActive] = React.useState("claude-code")
  const [verified, setVerified] = React.useState(false)

  React.useEffect(() => {
    const t = setTimeout(() => setVerified(true), 3000)
    return () => clearTimeout(t)
  }, [])

  const tool = TOOLS.find((t) => t.id === active)!

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-[#E8EDF0]">Connect your AI</h1>
        <p className="text-sm text-[#8B96A0] mt-0.5">
          Add DevMind to your AI tool in under 2 minutes
        </p>
      </div>

      {/* Step 1 */}
      <div className="rounded-[14px] border border-[rgba(255,255,255,0.06)] bg-[#11181C] p-5 space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(173,255,47,0.15)] text-xs font-mono font-bold text-[#ADFF2F]">1</span>
          <h2 className="text-sm font-semibold text-[#E8EDF0]">Install the MCP server</h2>
        </div>
        <CodePill code="npm install -g devmind" className="w-full" />
      </div>

      {/* Step 2 */}
      <div className="rounded-[14px] border border-[rgba(255,255,255,0.06)] bg-[#11181C] p-5 space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(173,255,47,0.15)] text-xs font-mono font-bold text-[#ADFF2F]">2</span>
          <h2 className="text-sm font-semibold text-[#E8EDF0]">Add to your AI tool config</h2>
        </div>

        {/* Tool tabs */}
        <div className="flex flex-wrap gap-1 bg-[rgba(255,255,255,0.04)] rounded-[10px] p-1">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`flex-1 min-w-[80px] rounded-[8px] px-3 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer ${
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
              <CodePill code={tool.config} className="hidden" />
            </div>
            <pre className="p-4 text-xs font-mono text-[#8B96A0] leading-relaxed overflow-x-auto">
              <code>{tool.config}</code>
            </pre>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(tool.config)}
            className="mt-2 text-xs font-mono text-[#ADFF2F] hover:underline cursor-pointer transition-all duration-150"
          >
            Copy config →
          </button>
        </div>
      </div>

      {/* Step 3 — verification */}
      <div className={`rounded-[14px] border p-5 space-y-3 transition-all duration-500 ${verified ? "border-[rgba(173,255,47,0.25)] bg-[rgba(173,255,47,0.04)]" : "border-[rgba(255,255,255,0.06)] bg-[#11181C]"}`}>
        <div className="flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(173,255,47,0.15)] text-xs font-mono font-bold text-[#ADFF2F]">3</span>
          <h2 className="text-sm font-semibold text-[#E8EDF0]">Verify connection</h2>
        </div>
        <div className="flex items-center gap-3">
          {verified ? (
            <>
              <CheckCircle className="h-5 w-5 text-[#ADFF2F]" />
              <div>
                <p className="text-sm text-[#ADFF2F] font-medium">Connected successfully</p>
                <p className="text-xs text-[#8B96A0]">Claude Code connected · workspace devmind-core · 4 tools registered</p>
              </div>
            </>
          ) : (
            <>
              <Wifi className="h-5 w-5 text-[#8B96A0] animate-pulse" />
              <div>
                <p className="text-sm text-[#8B96A0]">Waiting for first connection…</p>
                <p className="text-xs text-[#4B5563]">Start your AI tool after adding the config. We&apos;ll detect when it first connects.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
