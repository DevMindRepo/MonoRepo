"use client"

import * as React from "react"
import { CheckCircle, Wifi, Copy, Check, Terminal, Code2, Cpu } from "lucide-react"

const TOOLS = [
  {
    id: "claude-code",
    label: "Claude Code",
    icon: Terminal,
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
    icon: Code2,
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
    label: "Custom MCP",
    icon: Cpu,
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

const STEPS = ["Install", "Configure", "Verify"]

const glass = {
  background: "rgba(17,25,35,0.88)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.09)",
  boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 4px 20px rgba(0,0,0,0.4)",
} as React.CSSProperties

export default function ConnectPage() {
  const [active, setActive] = React.useState("claude-code")
  const [verified, setVerified] = React.useState(false)
  const [copiedInstall, setCopiedInstall] = React.useState(false)
  const [copiedConfig, setCopiedConfig] = React.useState(false)

  React.useEffect(() => {
    const t = setTimeout(() => setVerified(true), 3000)
    return () => clearTimeout(t)
  }, [])

  const tool = TOOLS.find((t) => t.id === active)!

  const handleCopy = (text: string, type: "install" | "config") => {
    navigator.clipboard.writeText(text)
    if (type === "install") {
      setCopiedInstall(true)
      setTimeout(() => setCopiedInstall(false), 2000)
    } else {
      setCopiedConfig(true)
      setTimeout(() => setCopiedConfig(false), 2000)
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
                    {done && i !== 2 ? <CheckCircle className="h-3 w-3" /> : i + 1}
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

            <div className="border-t border-[rgba(255,255,255,0.06)] pt-3 mt-2 space-y-1">
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#4B5563] px-3">MCP Tools</p>
              {["save_memory", "get_memory", "share_context", "save_artifact"].map((tool) => (
                <div key={tool} className="flex items-center gap-2 px-3 py-1">
                  <span className="h-1 w-1 rounded-full bg-[#ADFF2F] opacity-60" />
                  <span className="text-[11px] font-mono text-[#8B96A0]">{tool}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: step content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Step 1 */}
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
                <code className="flex-1 text-sm font-mono text-[#ADFF2F]">npm install -g devmind</code>
                <button
                  onClick={() => handleCopy("npm install -g devmind", "install")}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] transition-all duration-150"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {copiedInstall ? <Check className="h-3.5 w-3.5 text-[#ADFF2F]" /> : <Copy className="h-3.5 w-3.5 text-[#8B96A0]" />}
                </button>
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
              <div className="flex gap-2">
                {TOOLS.map((t) => {
                  const Icon = t.icon
                  const isActive = active === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActive(t.id)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-[10px] px-3 py-2.5 text-xs font-medium transition-all duration-200 cursor-pointer"
                      style={isActive
                        ? { background: "rgba(173,255,47,0.1)", border: "1px solid rgba(173,255,47,0.25)", color: "#ADFF2F" }
                        : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#8B96A0" }
                      }
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="hidden sm:block">{t.label}</span>
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
                  <code dangerouslySetInnerHTML={{ __html: tool.config
                    .replace(/("DEVMIND_WORKSPACE"|"DEVMIND_API_KEY"|"command"|"args"|"env"|"mcpServers"|"devmind")/g, '<span style="color:#60A5FA">$1</span>')
                    .replace(/(DEVMIND_WORKSPACE|DEVMIND_API_KEY)/g, '<span style="color:#FBBF24">$1</span>')
                    .replace(/("ws_abc123xyz"|"dm_sk_\.\.\."|"devmind-mcp"|"-y")/g, '<span style="color:#ADFF2F">$1</span>')
                  }} />
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
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: "rgba(173,255,47,0.1)", border: "1px solid rgba(173,255,47,0.2)" }}>
                    <CheckCircle className="h-5 w-5 text-[#ADFF2F]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#ADFF2F]">Connected successfully</p>
                    <p className="mt-0.5 text-sm text-[#8B96A0]">Claude Code · workspace devmind-core · 4 tools registered</p>
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
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <Wifi className="h-5 w-5 text-[#8B96A0] animate-pulse" />
                  </div>
                  <div>
                    <p className="font-medium text-[#8B96A0]">Waiting for first connection…</p>
                    <p className="mt-0.5 text-sm text-[#4B5563]">Start your AI tool after adding the config. We'll detect when it first connects.</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
