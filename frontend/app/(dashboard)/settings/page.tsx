"use client"

import * as React from "react"
import { Copy, ExternalLink, Trash2, UserPlus, Shield, Webhook, Settings2, Users, GitBranch, Key, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { truncateAddress } from "@/lib/utils"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { AddWebhookDialog } from "@/components/app/add-webhook-dialog"
import { SettingsSkeleton } from "@/components/ui/skeleton"

const glass = {
  background: "rgba(17,25,35,0.88)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.09)",
  boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 4px 20px rgba(0,0,0,0.4)",
} as React.CSSProperties

const inputClass = "w-full rounded-[10px] px-3 py-2.5 text-sm text-[#E8EDF0] placeholder:text-[#4B5563] focus:outline-none transition-all duration-200"
const inputStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.09)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
}

function SectionHeader({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description?: string }) {
  return (
    <div className="flex items-start gap-3 px-5 py-4 border-b border-[rgba(255,255,255,0.06)]">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#8B96A0]" />
      <div>
        <h2 className="text-sm font-semibold text-[#E8EDF0]">{title}</h2>
        {description && <p className="text-xs text-[#8B96A0] mt-0.5">{description}</p>}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [inviteAddr, setInviteAddr] = React.useState("")
  const [copied, setCopied] = React.useState(false)
  const [members, setMembers] = React.useState([
    { address: "0x7f3a9b2c8d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a", role: "owner", name: "you", color: "#ADFF2F" },
    { address: "0x4f2a1b3c5d7e9f0a2b4c6d8e0f1a3b5c7d9e1f2a", role: "member", name: "alisa", color: "#60A5FA" },
    { address: "0x2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c", role: "member", name: "dev", color: "#F472B6" },
  ])
  const [webhooks, setWebhooks] = React.useState([
    { repo: "org/devmind", event: "pull_request", status: "active", lastDelivery: "2h ago" },
    { repo: "org/api-service", event: "push", status: "active", lastDelivery: "1d ago" },
  ])
  const [leaveOpen, setLeaveOpen] = React.useState(false)
  const [regenOpen, setRegenOpen] = React.useState(false)
  const [removeMemberAddr, setRemoveMemberAddr] = React.useState<string | null>(null)
  const [webhookOpen, setWebhookOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

  const handleCopyId = () => {
    navigator.clipboard.writeText("0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#E8EDF0]">Settings</h1>
        <p className="mt-0.5 text-sm text-[#8B96A0]">Manage your workspace and team</p>
      </div>

      {/* Two-column grid on large screens */}
      {loading ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-5">
            <SettingsSkeleton />
            <SettingsSkeleton />
          </div>
          <div className="space-y-5">
            <SettingsSkeleton />
            <SettingsSkeleton />
          </div>
        </div>
      ) : (
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-5">
          {/* Workspace info */}
          <div className="overflow-hidden rounded-2xl" style={glass}>
            <SectionHeader icon={Settings2} title="Workspace" description="General workspace information" />
            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-[10px] font-mono uppercase tracking-widest text-[#4B5563]">Name</label>
                <input
                  defaultValue="devmind-core"
                  className={inputClass}
                  style={inputStyle}
                  onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(173,255,47,0.4)" }}
                  onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.09)" }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-mono uppercase tracking-widest text-[#4B5563]">Sui Object ID</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 min-w-0 rounded-[10px] px-3 py-2.5 text-xs font-mono text-[#ADFF2F] truncate"
                    style={{ background: "rgba(173,255,47,0.05)", border: "1px solid rgba(173,255,47,0.15)" }}>
                    0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b
                  </code>
                  <button onClick={handleCopyId}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] transition-all duration-150"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-[#ADFF2F]" /> : <Copy className="h-3.5 w-3.5 text-[#8B96A0]" />}
                  </button>
                  <button onClick={() => window.open("https://suiexplorer.com/object/0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b?network=testnet", "_blank")}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] transition-all duration-150"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <ExternalLink className="h-3.5 w-3.5 text-[#8B96A0]" />
                  </button>
                </div>
              </div>
              <Button variant="primary" size="sm" className="w-full" onClick={() => toast.success("Workspace saved", { description: "Changes synced to your Sui object" })}>Save changes</Button>
            </div>
          </div>

          {/* API key */}
          <div className="overflow-hidden rounded-2xl" style={glass}>
            <SectionHeader icon={Key} title="API Key" description="Used by the MCP server to authenticate" />
            <div className="space-y-3 p-5">
              <div className="flex items-center gap-2">
                <code className="flex-1 min-w-0 rounded-[10px] px-3 py-2.5 text-xs font-mono text-[#8B96A0] truncate"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}>
                  dm_sk_••••••••••••••••••••••••••••••••
                </code>
                <button onClick={() => { navigator.clipboard.writeText("dm_sk_live_••••••••••••••••••••••••••••••••"); toast.success("API key copied", { description: "Paste it in your MCP server config" }) }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] transition-all duration-150"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <Copy className="h-3.5 w-3.5 text-[#8B96A0]" />
                </button>
              </div>
              <button onClick={() => setRegenOpen(true)} className="text-xs font-mono text-[#ADFF2F] hover:underline transition-opacity hover:opacity-80">
                Regenerate key →
              </button>
            </div>
          </div>

          {/* Danger zone */}
          <div className="overflow-hidden rounded-2xl" style={{ background: "rgba(248,113,113,0.04)", border: "1px solid rgba(248,113,113,0.18)", backdropFilter: "blur(20px)" }}>
            <div className="flex items-center gap-3 border-b border-[rgba(248,113,113,0.12)] px-5 py-4">
              <Shield className="h-4 w-4 shrink-0 text-[#F87171]" />
              <h2 className="text-sm font-semibold text-[#F87171]">Danger zone</h2>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <p className="text-sm font-medium text-[#E8EDF0]">Leave workspace</p>
                <p className="mt-0.5 text-xs text-[#8B96A0]">Your memories stay, but you lose access</p>
              </div>
              <Button variant="destructive" size="sm" onClick={() => setLeaveOpen(true)}>Leave</Button>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Members */}
          <div className="overflow-hidden rounded-2xl" style={glass}>
            <SectionHeader icon={Users} title="Members" description="Team members identified by Sui address" />
            <div className="p-5 space-y-1">
              {members.map(({ address, role, name, color }) => (
                <div key={address} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[rgba(255,255,255,0.03)]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold font-mono"
                      style={{ background: `${color}18`, border: `1px solid ${color}30`, color }}>
                      {name[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#E8EDF0]">{name}</p>
                      <p className="text-[10px] font-mono text-[#4B5563] truncate">{truncateAddress(address, 8)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Chip variant={role === "owner" ? "mint" : "default"}>{role}</Chip>
                    {role !== "owner" && (
                      <button onClick={() => setRemoveMemberAddr(address)} className="flex h-7 w-7 items-center justify-center rounded-[8px] text-[#4B5563] hover:text-[#F87171] hover:bg-[rgba(248,113,113,0.1)] transition-all duration-150">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div className="mt-3 space-y-2 border-t border-[rgba(255,255,255,0.06)] pt-4">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#4B5563]">Invite member</p>
                <div className="flex gap-2">
                  <input
                    placeholder="0x... Sui address"
                    value={inviteAddr}
                    onChange={(e) => setInviteAddr(e.target.value)}
                    className="flex-1 min-w-0 rounded-[10px] px-3 py-2 text-xs font-mono text-[#E8EDF0] placeholder:text-[#4B5563] focus:outline-none transition-all duration-200"
                    style={inputStyle}
                    onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(173,255,47,0.4)" }}
                    onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.09)" }}
                  />
                  <Button variant="secondary" size="sm" className="gap-1.5 shrink-0" onClick={() => {
                    if (!inviteAddr.startsWith("0x")) {
                      toast.error("Invalid Sui address", { description: "Address must start with 0x" })
                      return
                    }
                    toast.success("Invitation sent", { description: `Sent to ${inviteAddr.slice(0, 8)}…` })
                    setInviteAddr("")
                  }}>
                    <UserPlus className="h-3.5 w-3.5" />
                    Invite
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* GitHub Webhooks */}
          <div className="overflow-hidden rounded-2xl" style={glass}>
            <SectionHeader icon={GitBranch} title="GitHub Webhooks" description="Auto-extract memories from PRs and commits" />
            <div className="p-5 space-y-1">
              {webhooks.map(({ repo, event, status, lastDelivery }) => (
                <div key={repo} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[rgba(255,255,255,0.03)]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px]"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <Webhook className="h-3.5 w-3.5 text-[#8B96A0]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-mono text-[#E8EDF0] truncate">{repo}</p>
                      <p className="text-[10px] text-[#4B5563]">on {event} · {lastDelivery}</p>
                    </div>
                  </div>
                  <Chip variant={status === "active" ? "mint" : "default"} dot>{status}</Chip>
                </div>
              ))}
              <div className="pt-3 border-t border-[rgba(255,255,255,0.06)] mt-2">
                <Button variant="outline" size="sm" className="gap-1.5 w-full" onClick={() => setWebhookOpen(true)}>
                  <Webhook className="h-3.5 w-3.5" />
                  Add webhook
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      <ConfirmDialog
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        title="Leave this workspace?"
        description="You'll lose access to all team memories. Your private memories stay yours. Owners cannot leave — transfer ownership first."
        confirmLabel="Leave workspace"
        variant="destructive"
        onConfirm={() => { toast.success("Workspace left", { description: "You no longer have access to devmind-core" }) }}
      />

      <ConfirmDialog
        open={regenOpen}
        onOpenChange={setRegenOpen}
        title="Regenerate API key?"
        description="The current key will stop working immediately. Update your MCP server configs to use the new key after regeneration."
        confirmLabel="Regenerate"
        variant="destructive"
        onConfirm={() => { toast.success("New API key generated", { description: "Update your AI tool configs with the new key" }) }}
      />

      <ConfirmDialog
        open={removeMemberAddr !== null}
        onOpenChange={(open) => !open && setRemoveMemberAddr(null)}
        title="Remove member from workspace?"
        description="They will lose access immediately. You can re-invite them later."
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={() => {
          if (removeMemberAddr) {
            setMembers((prev) => prev.filter((m) => m.address !== removeMemberAddr))
            toast.success("Member removed")
          }
          setRemoveMemberAddr(null)
        }}
      />

      <AddWebhookDialog
        open={webhookOpen}
        onOpenChange={setWebhookOpen}
        onAdd={({ repo, event }) => {
          setWebhooks((prev) => [...prev, { repo, event, status: "active", lastDelivery: "just now" }])
          toast.success("Webhook added", { description: `Listening on ${repo} for ${event} events` })
        }}
      />
    </div>
  )
}
