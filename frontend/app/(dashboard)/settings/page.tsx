"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Copy, ExternalLink, Trash2, UserPlus, Shield, Webhook, Loader2, KeyRound, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { truncateAddress } from "@/lib/utils"
import { workspacesApi, webhooksApi } from "@/lib/api-endpoints"
import { useAuthStore } from "@/lib/store/auth"
import { env } from "@/lib/env"
import { ApiError } from "@/lib/api"

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
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
  const workspace = useAuthStore((s) => s.workspace)
  const user = useAuthStore((s) => s.user)
  const workspaceId = workspace?.id
  const queryClient = useQueryClient()

  const [inviteAddr, setInviteAddr] = React.useState("")
  const [webhookRepo, setWebhookRepo] = React.useState("")
  const [createdWebhookSecret, setCreatedWebhookSecret] = React.useState<string | null>(null)
  const [showSecret, setShowSecret] = React.useState(false)

  const detailQuery = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => workspacesApi.get(workspaceId!),
    enabled: !!workspaceId,
  })

  const webhooksQuery = useQuery({
    queryKey: ["webhooks", workspaceId],
    queryFn: () => webhooksApi.list(workspaceId!),
    enabled: !!workspaceId,
  })

  const inviteMutation = useMutation({
    mutationFn: (address: string) => workspacesApi.inviteMember(workspaceId!, address),
    onSuccess: () => {
      toast.success("Member invited on-chain + DB")
      setInviteAddr("")
      queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] })
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to invite")
    },
  })

  const removeMutation = useMutation({
    mutationFn: (userId: string) => workspacesApi.removeMember(workspaceId!, userId),
    onSuccess: () => {
      toast.success("Member removed")
      queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] })
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to remove")
    },
  })

  const createWebhookMutation = useMutation({
    mutationFn: (repo: string) => webhooksApi.create(workspaceId!, repo),
    onSuccess: (data) => {
      setCreatedWebhookSecret(data.secret)
      setWebhookRepo("")
      queryClient.invalidateQueries({ queryKey: ["webhooks", workspaceId] })
      toast.success("Webhook created — copy the secret now")
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to create webhook")
    },
  })

  const deleteWebhookMutation = useMutation({
    mutationFn: (webhookId: string) => webhooksApi.delete(workspaceId!, webhookId),
    onSuccess: () => {
      toast.success("Webhook removed")
      queryClient.invalidateQueries({ queryKey: ["webhooks", workspaceId] })
    },
  })

  function copyObjectId() {
    if (!workspace?.suiObjectId) return
    navigator.clipboard.writeText(workspace.suiObjectId)
    toast.success("Object ID copied")
  }

  function copySecret() {
    if (!createdWebhookSecret) return
    navigator.clipboard.writeText(createdWebhookSecret)
    toast.success("Webhook secret copied")
  }

  const isOwner = detailQuery.data?.ownerId === user?.id

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
              defaultValue={workspace?.name ?? ""}
              readOnly
              className="w-full rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[#161D22] px-3 py-2 text-sm text-[#E8EDF0]"
            />
          </div>
          {workspace?.suiObjectId && (
            <div>
              <label className="text-xs font-mono text-[#4B5563] uppercase tracking-wider block mb-1.5">Sui Object ID</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-xs font-mono text-[#ADFF2F] truncate">
                  {workspace.suiObjectId}
                </code>
                <Button variant="ghost" size="icon-sm" onClick={copyObjectId}>
                  <Copy className="h-4 w-4" />
                </Button>
                <a
                  href={`${env.NEXT_PUBLIC_SUI_EXPLORER}/object/${workspace.suiObjectId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#8B96A0] hover:text-[#E8EDF0] hover:bg-[rgba(255,255,255,0.06)] transition-all duration-150"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Members */}
      <Section title="Members" description="Workspace members identified by Sui address">
        <div className="space-y-3">
          {detailQuery.isLoading ? (
            <p className="text-xs text-[#4B5563]">Loading members…</p>
          ) : (
            detailQuery.data?.members.map(({ user: m, role, userId }) => (
              <div key={userId} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-7 w-7 rounded-full bg-[rgba(173,255,47,0.1)] flex items-center justify-center text-[#ADFF2F] text-xs font-mono shrink-0">
                    {(m.displayName ?? m.suiAddress)[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#E8EDF0]">
                      {m.displayName ?? truncateAddress(m.suiAddress)}
                    </p>
                    <p className="text-[10px] font-mono text-[#4B5563] truncate">
                      {truncateAddress(m.suiAddress, 6)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Chip variant={role === "owner" ? "mint" : "default"}>{role}</Chip>
                  {role !== "owner" && isOwner && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeMutation.mutate(userId)}
                      disabled={removeMutation.isPending}
                      className="text-[#F87171] hover:text-[#F87171] hover:bg-[rgba(248,113,113,0.1)]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}

          {isOwner && (
            <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
              <p className="text-xs font-mono text-[#4B5563] uppercase tracking-wider mb-2">Invite member</p>
              <div className="flex gap-2">
                <input
                  placeholder="0x... Sui address"
                  value={inviteAddr}
                  onChange={(e) => setInviteAddr(e.target.value)}
                  disabled={inviteMutation.isPending}
                  className="flex-1 rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[#161D22] px-3 py-2 text-xs font-mono text-[#E8EDF0] placeholder:text-[#4B5563] focus:outline-none focus:border-[rgba(173,255,47,0.4)] transition-colors duration-200 disabled:opacity-50"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1.5 shrink-0"
                  onClick={() => inviteMutation.mutate(inviteAddr.trim())}
                  disabled={!inviteAddr.trim() || inviteMutation.isPending}
                >
                  {inviteMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
                  Invite
                </Button>
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* GitHub Webhooks */}
      <Section title="GitHub Webhooks" description="Auto-extract memories from PR merges and commits">
        <div className="space-y-3">
          {webhooksQuery.isLoading ? (
            <p className="text-xs text-[#4B5563]">Loading webhooks…</p>
          ) : webhooksQuery.data && webhooksQuery.data.length > 0 ? (
            webhooksQuery.data.map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between gap-3 py-2 border-b border-[rgba(255,255,255,0.04)] last:border-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Webhook className="h-4 w-4 text-[#8B96A0] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-mono text-[#E8EDF0] truncate">{w.repo}</p>
                    <p className="text-[10px] text-[#4B5563]">
                      event: {w.event} · {w.lastDeliveryAt ? `last: ${w.lastDeliveryAt}` : "no deliveries yet"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Chip variant={w.active ? "mint" : "default"} dot>
                    {w.active ? "active" : "paused"}
                  </Chip>
                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => deleteWebhookMutation.mutate(w.id)}
                      disabled={deleteWebhookMutation.isPending}
                      className="text-[#F87171] hover:bg-[rgba(248,113,113,0.1)]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-[#4B5563]">No webhooks configured yet.</p>
          )}

          {createdWebhookSecret && (
            <div className="rounded-[10px] border border-[rgba(173,255,47,0.25)] bg-[rgba(173,255,47,0.04)] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#ADFF2F] uppercase tracking-wider">Webhook secret (save it now)</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => setShowSecret((v) => !v)}>
                    {showSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={copySecret}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <p className="font-mono text-xs text-[#ADFF2F] break-all">
                {showSecret ? createdWebhookSecret : "•".repeat(48)}
              </p>
              <p className="text-[10px] text-[#8B96A0]">
                Add to GitHub repo Settings → Webhooks. Payload URL: <span className="font-mono text-[#E8EDF0]">{env.NEXT_PUBLIC_API_URL}/webhook/github</span>
              </p>
              <button
                onClick={() => setCreatedWebhookSecret(null)}
                className="text-[10px] font-mono text-[#8B96A0] hover:text-[#E8EDF0] transition-colors duration-150"
              >
                Done — hide
              </button>
            </div>
          )}

          {isOwner && !createdWebhookSecret && (
            <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)]">
              <p className="text-xs font-mono text-[#4B5563] uppercase tracking-wider mb-2">Add webhook</p>
              <div className="flex gap-2">
                <input
                  placeholder="owner/repo"
                  value={webhookRepo}
                  onChange={(e) => setWebhookRepo(e.target.value)}
                  disabled={createWebhookMutation.isPending}
                  className="flex-1 rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[#161D22] px-3 py-2 text-xs font-mono text-[#E8EDF0] placeholder:text-[#4B5563] focus:outline-none focus:border-[rgba(173,255,47,0.4)] transition-colors duration-200 disabled:opacity-50"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1.5 shrink-0"
                  onClick={() => createWebhookMutation.mutate(webhookRepo.trim())}
                  disabled={!webhookRepo.trim() || createWebhookMutation.isPending}
                >
                  {createWebhookMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}
                  Create
                </Button>
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Danger zone */}
      <div className="rounded-[14px] border border-[rgba(248,113,113,0.2)] bg-[rgba(248,113,113,0.03)] p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-[#F87171]" />
          <h2 className="text-sm font-semibold text-[#F87171]">Danger zone</h2>
        </div>
        <p className="text-xs text-[#8B96A0]">
          Workspace deletion is not yet supported — contact your workspace owner if you need to leave.
        </p>
      </div>
    </div>
  )
}
