"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Copy, ExternalLink, Trash2, UserPlus, Shield, Webhook, Settings2, Users, GitBranch, Check, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { truncateAddress, timeAgo } from "@/lib/utils"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { AddWebhookDialog } from "@/components/app/add-webhook-dialog"
import { SettingsSkeleton } from "@/components/ui/skeleton"
import { useAuthStore } from "@/lib/store/auth"
import { workspacesApi, webhooksApi } from "@/lib/api-endpoints"
import { ApiError } from "@/lib/api"
import { env } from "@/lib/env"

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

const memberColors = ["#ADFF2F", "#60A5FA", "#F472B6", "#FBBF24", "#A855F7"]

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

function displayLabel(displayName: string | null, suiAddress: string): string {
  return displayName ?? truncateAddress(suiAddress, 4)
}

export default function SettingsPage() {
  const workspaceId = useAuthStore((s) => s.workspace?.id)
  const currentUserId = useAuthStore((s) => s.user?.id)
  const queryClient = useQueryClient()

  const [inviteAddr, setInviteAddr] = React.useState("")
  const [copied, setCopied] = React.useState(false)
  const [leaveOpen, setLeaveOpen] = React.useState(false)
  const [removeMemberId, setRemoveMemberId] = React.useState<string | null>(null)
  const [webhookOpen, setWebhookOpen] = React.useState(false)
  const [deleteWebhookId, setDeleteWebhookId] = React.useState<string | null>(null)
  const [newWebhookSecret, setNewWebhookSecret] = React.useState<{ repo: string; secret: string } | null>(null)
  const [copiedSecret, setCopiedSecret] = React.useState(false)

  const workspaceQuery = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => workspacesApi.get(workspaceId!),
    enabled: !!workspaceId,
  })

  const webhooksQuery = useQuery({
    queryKey: ["webhooks", workspaceId],
    queryFn: () => webhooksApi.list(workspaceId!),
    enabled: !!workspaceId,
  })

  const workspace = workspaceQuery.data
  const members = workspace?.members ?? []
  const webhooks = webhooksQuery.data ?? []
  const loading = workspaceQuery.isLoading || webhooksQuery.isLoading

  const inviteMutation = useMutation({
    mutationFn: (addr: string) => workspacesApi.inviteMember(workspaceId!, addr),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] })
      toast.success("Invitation sent", { description: `Member added to workspace` })
      setInviteAddr("")
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Invite failed"),
  })

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => workspacesApi.removeMember(workspaceId!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] })
      toast.success("Member removed")
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Remove failed"),
  })

  const createWebhookMutation = useMutation({
    mutationFn: ({ repo, event }: { repo: string; event: string }) =>
      webhooksApi.create(workspaceId!, repo, event),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["webhooks", workspaceId] })
      setNewWebhookSecret({ repo: data.repo, secret: data.secret })
      toast.success("Webhook added", { description: "Copy the secret now — it won't be shown again" })
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Webhook create failed"),
  })

  const deleteWebhookMutation = useMutation({
    mutationFn: (webhookId: string) => webhooksApi.delete(workspaceId!, webhookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks", workspaceId] })
      toast.success("Webhook deleted")
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Delete failed"),
  })

  const toggleWebhookMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      webhooksApi.toggle(workspaceId!, id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks", workspaceId] })
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Toggle failed"),
  })

  const handleCopyId = () => {
    if (!workspace?.suiObjectId) return
    navigator.clipboard.writeText(workspace.suiObjectId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const explorerUrl = workspace?.suiObjectId
    ? `${env.NEXT_PUBLIC_SUI_EXPLORER}/object/${workspace.suiObjectId}`
    : "#"

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
                  defaultValue={workspace?.name ?? ""}
                  readOnly
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-mono uppercase tracking-widest text-[#4B5563]">Sui Object ID</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 min-w-0 rounded-[10px] px-3 py-2.5 text-xs font-mono text-[#ADFF2F] truncate"
                    style={{ background: "rgba(173,255,47,0.05)", border: "1px solid rgba(173,255,47,0.15)" }}>
                    {workspace?.suiObjectId ?? "(not minted)"}
                  </code>
                  <button onClick={handleCopyId}
                    disabled={!workspace?.suiObjectId}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] transition-all duration-150 disabled:opacity-40"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-[#ADFF2F]" /> : <Copy className="h-3.5 w-3.5 text-[#8B96A0]" />}
                  </button>
                  <button onClick={() => workspace?.suiObjectId && window.open(explorerUrl, "_blank")}
                    disabled={!workspace?.suiObjectId}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] transition-all duration-150 disabled:opacity-40"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <ExternalLink className="h-3.5 w-3.5 text-[#8B96A0]" />
                  </button>
                </div>
              </div>
              {workspace?.walrusRoot && (
                <div>
                  <label className="mb-1.5 block text-[10px] font-mono uppercase tracking-widest text-[#4B5563]">Walrus Root</label>
                  <code className="block w-full rounded-[10px] px-3 py-2.5 text-xs font-mono text-[#8B96A0] truncate"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}>
                    {workspace.walrusRoot}
                  </code>
                </div>
              )}
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
              {members.map((m, i) => {
                const color = memberColors[i % memberColors.length]
                const name = displayLabel(m.user.displayName, m.user.suiAddress)
                const isOwner = m.role === "owner"
                const isYou = m.userId === currentUserId
                return (
                  <div key={m.userId} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[rgba(255,255,255,0.03)]">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold font-mono"
                        style={{ background: `${color}18`, border: `1px solid ${color}30`, color }}>
                        {name[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[#E8EDF0]">
                          {name}{isYou ? " (you)" : ""}
                        </p>
                        <p className="text-[10px] font-mono text-[#4B5563] truncate">{truncateAddress(m.user.suiAddress, 8)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Chip variant={isOwner ? "mint" : "default"}>{m.role}</Chip>
                      {!isOwner && !isYou && (
                        <button onClick={() => setRemoveMemberId(m.userId)} className="flex h-7 w-7 items-center justify-center rounded-[8px] text-[#4B5563] hover:text-[#F87171] hover:bg-[rgba(248,113,113,0.1)] transition-all duration-150">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}

              <div className="mt-3 space-y-2 border-t border-[rgba(255,255,255,0.06)] pt-4">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#4B5563]">Invite member</p>
                <div className="flex gap-2">
                  <input
                    placeholder="0x... Sui address"
                    value={inviteAddr}
                    onChange={(e) => setInviteAddr(e.target.value)}
                    className="flex-1 min-w-0 rounded-[10px] px-3 py-2 text-xs font-mono text-[#E8EDF0] placeholder:text-[#4B5563] focus:outline-none transition-all duration-200"
                    style={inputStyle}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-1.5 shrink-0"
                    loading={inviteMutation.isPending}
                    onClick={() => {
                      if (!inviteAddr.startsWith("0x")) {
                        toast.error("Invalid Sui address", { description: "Address must start with 0x" })
                        return
                      }
                      inviteMutation.mutate(inviteAddr)
                    }}
                  >
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
              {newWebhookSecret && (
                <div
                  className="rounded-[10px] p-3 space-y-2 mb-2"
                  style={{ background: "rgba(173,255,47,0.06)", border: "1px solid rgba(173,255,47,0.25)" }}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-[#ADFF2F]" />
                    <p className="text-xs text-[#ADFF2F] font-medium">Secret for {newWebhookSecret.repo} — shown only once</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 min-w-0 rounded-[8px] px-2.5 py-2 text-xs font-mono text-[#ADFF2F] truncate"
                      style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(173,255,47,0.18)" }}>
                      {newWebhookSecret.secret}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(newWebhookSecret.secret)
                        setCopiedSecret(true)
                        setTimeout(() => setCopiedSecret(false), 2000)
                      }}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] transition-all duration-150"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      {copiedSecret ? <Check className="h-3.5 w-3.5 text-[#ADFF2F]" /> : <Copy className="h-3.5 w-3.5 text-[#8B96A0]" />}
                    </button>
                    <button
                      onClick={() => setNewWebhookSecret(null)}
                      className="text-[10px] font-mono text-[#4B5563] hover:text-[#8B96A0] px-2"
                    >
                      dismiss
                    </button>
                  </div>
                </div>
              )}

              {webhooks.length === 0 ? (
                <p className="text-xs text-[#4B5563] px-3 py-2">No webhooks configured.</p>
              ) : webhooks.map((wh) => (
                <div key={wh.id} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[rgba(255,255,255,0.03)]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px]"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <Webhook className="h-3.5 w-3.5 text-[#8B96A0]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-mono text-[#E8EDF0] truncate">{wh.repo}</p>
                      <p className="text-[10px] text-[#4B5563]">
                        on {wh.event} · {wh.lastDeliveryAt ? timeAgo(wh.lastDeliveryAt) : "no deliveries"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleWebhookMutation.mutate({ id: wh.id, active: !wh.active })}
                      title={wh.active ? "Disable" : "Enable"}
                    >
                      <Chip variant={wh.active ? "mint" : "default"} dot>{wh.active ? "active" : "paused"}</Chip>
                    </button>
                    <button
                      onClick={() => setDeleteWebhookId(wh.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-[8px] text-[#4B5563] hover:text-[#F87171] hover:bg-[rgba(248,113,113,0.1)] transition-all duration-150"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
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
        onConfirm={() => {
          // TODO: backend does not yet expose a self-leave endpoint
          toast.info("Coming soon", { description: "Self-leave is not yet supported" })
        }}
      />

      <ConfirmDialog
        open={removeMemberId !== null}
        onOpenChange={(open) => !open && setRemoveMemberId(null)}
        title="Remove member from workspace?"
        description="They will lose access immediately. You can re-invite them later."
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={() => {
          if (removeMemberId) removeMemberMutation.mutate(removeMemberId)
          setRemoveMemberId(null)
        }}
      />

      <ConfirmDialog
        open={deleteWebhookId !== null}
        onOpenChange={(open) => !open && setDeleteWebhookId(null)}
        title="Delete this webhook?"
        description="GitHub events will no longer be processed for this repo. You can re-add it later."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deleteWebhookId) deleteWebhookMutation.mutate(deleteWebhookId)
          setDeleteWebhookId(null)
        }}
      />

      <AddWebhookDialog
        open={webhookOpen}
        onOpenChange={setWebhookOpen}
        onAdd={async ({ repo, event }) => {
          await createWebhookMutation.mutateAsync({ repo, event })
        }}
      />
    </div>
  )
}
