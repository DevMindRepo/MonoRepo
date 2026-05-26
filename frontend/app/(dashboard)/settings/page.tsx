"use client"

import * as React from "react"
import { Copy, ExternalLink, Trash2, UserPlus, Shield, Webhook } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { truncateAddress } from "@/lib/utils"

const MEMBERS = [
  { address: "0x7f3a9b2c8d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a", role: "owner", name: "you" },
  { address: "0x4f2a1b3c5d7e9f0a2b4c6d8e0f1a3b5c7d9e1f2a", role: "member", name: "alisa" },
  { address: "0x2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c", role: "member", name: "dev@example.com" },
]

const WEBHOOKS = [
  { repo: "org/devmind", event: "pull_request", status: "active", lastDelivery: "2h ago" },
  { repo: "org/api-service", event: "push", status: "active", lastDelivery: "1d ago" },
]

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[14px] border border-[rgba(255,255,255,0.06)] bg-[#11181C] overflow-hidden">
      <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)]">
        <h2 className="text-sm font-semibold text-[#E8EDF0]">{title}</h2>
        {description && <p className="text-xs text-[#8B96A0] mt-0.5">{description}</p>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export default function SettingsPage() {
  const [inviteAddr, setInviteAddr] = React.useState("")

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-[#E8EDF0]">Workspace Settings</h1>
        <p className="text-sm text-[#8B96A0] mt-0.5">Manage your workspace and team</p>
      </div>

      {/* Workspace info */}
      <Section title="Workspace" description="General workspace information">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono text-[#4B5563] uppercase tracking-wider block mb-1.5">Name</label>
            <input
              defaultValue="devmind-core"
              className="w-full rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[#161D22] px-3 py-2 text-sm text-[#E8EDF0] focus:outline-none focus:border-[rgba(173,255,47,0.4)] transition-colors duration-200"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-[#4B5563] uppercase tracking-wider block mb-1.5">Sui Object ID</label>
            <div className="flex items-start gap-2">
              <code className="flex-1 min-w-0 rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-xs font-mono text-[#ADFF2F] break-all">
                0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b
              </code>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon-sm"><Copy className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon-sm"><ExternalLink className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Members */}
      <Section title="Members" description="Workspace members identified by Sui address">
        <div className="space-y-3">
          {MEMBERS.map(({ address, role, name }) => (
            <div key={address} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-7 w-7 rounded-full bg-[rgba(173,255,47,0.1)] flex items-center justify-center text-[#ADFF2F] text-xs font-mono shrink-0">
                  {name[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#E8EDF0]">{name}</p>
                  <p className="text-[10px] font-mono text-[#4B5563] truncate">{truncateAddress(address, 6)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Chip variant={role === "owner" ? "mint" : "default"}>{role}</Chip>
                {role !== "owner" && (
                  <Button variant="ghost" size="icon-sm" className="text-[#F87171] hover:text-[#F87171] hover:bg-[rgba(248,113,113,0.1)]">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
            <p className="text-xs font-mono text-[#4B5563] uppercase tracking-wider mb-2">Invite member</p>
            <div className="flex flex-col xs:flex-row gap-2">
              <input
                placeholder="0x... Sui address"
                value={inviteAddr}
                onChange={(e) => setInviteAddr(e.target.value)}
                className="flex-1 min-w-0 rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[#161D22] px-3 py-2 text-xs font-mono text-[#E8EDF0] placeholder:text-[#4B5563] focus:outline-none focus:border-[rgba(173,255,47,0.4)] transition-colors duration-200"
              />
              <Button variant="secondary" size="sm" className="gap-1.5 shrink-0 self-start xs:self-auto">
                <UserPlus className="h-3.5 w-3.5" />
                Invite
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* GitHub Webhooks */}
      <Section title="GitHub Webhooks" description="Auto-extract memories from PR merges and commits">
        <div className="space-y-3">
          {WEBHOOKS.map(({ repo, event, status, lastDelivery }) => (
            <div key={repo} className="flex items-center justify-between gap-3 py-2 border-b border-[rgba(255,255,255,0.04)] last:border-0">
              <div className="flex items-center gap-3">
                <Webhook className="h-4 w-4 text-[#8B96A0]" />
                <div>
                  <p className="text-xs font-mono text-[#E8EDF0]">{repo}</p>
                  <p className="text-[10px] text-[#4B5563] break-words">event: {event} · last delivery: {lastDelivery}</p>
                </div>
              </div>
              <Chip variant={status === "active" ? "mint" : "default"} dot>{status}</Chip>
            </div>
          ))}
          <Button variant="outline" size="sm" className="gap-1.5 mt-2">
            <Webhook className="h-3.5 w-3.5" />
            Add webhook
          </Button>
        </div>
      </Section>

      {/* Danger zone */}
      <div className="rounded-[14px] border border-[rgba(248,113,113,0.2)] bg-[rgba(248,113,113,0.03)] p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-[#F87171]" />
          <h2 className="text-sm font-semibold text-[#F87171]">Danger zone</h2>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-[#E8EDF0]">Leave workspace</p>
            <p className="text-xs text-[#8B96A0]">Your memories stay, but you lose access</p>
          </div>
          <Button variant="destructive" size="sm">Leave</Button>
        </div>
      </div>
    </div>
  )
}
