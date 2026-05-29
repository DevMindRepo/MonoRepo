"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  Siren,
  Server,
  Clock,
  Bot,
  Brain,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  Loader2,
  AlertTriangle,
  ChevronDown,
} from "lucide-react"
import { Chip } from "@/components/ui/chip"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { incidentsApi } from "@/lib/api-endpoints"
import { useAuthStore } from "@/lib/store/auth"
import { ApiError } from "@/lib/api"
import { timeAgo } from "@/lib/utils"
import type { Incident, IncidentSeverity, IncidentStatus, AgentRun } from "@/lib/api-types"

const severityColor: Record<IncidentSeverity, string> = {
  low: "text-[#8B96A0] bg-[rgba(139,150,160,0.1)]",
  medium: "text-[#FBBF24] bg-[rgba(251,191,36,0.1)]",
  high: "text-[#F472B6] bg-[rgba(244,114,182,0.1)]",
  critical: "text-[#F87171] bg-[rgba(248,113,113,0.12)]",
}

const statusColor: Record<IncidentStatus, string> = {
  new: "text-[#60A5FA] bg-[rgba(96,165,250,0.1)]",
  triaging: "text-[#FBBF24] bg-[rgba(251,191,36,0.1)]",
  researching: "text-[#A78BFA] bg-[rgba(167,139,250,0.1)]",
  responding: "text-[#F472B6] bg-[rgba(244,114,182,0.1)]",
  resolved: "text-[#ADFF2F] bg-[rgba(173,255,47,0.12)]",
  failed: "text-[#F87171] bg-[rgba(248,113,113,0.12)]",
}

const glass = {
  background: "rgba(17,25,35,0.78)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 4px 20px rgba(0,0,0,0.4)",
} as React.CSSProperties

export default function IncidentsPage() {
  const workspace = useAuthStore((s) => s.workspace)
  const workspaceId = workspace?.id ?? null
  const queryClient = useQueryClient()
  const [expanded, setExpanded] = React.useState<string | null>(null)
  const [resolveOpen, setResolveOpen] = React.useState<string | null>(null)
  const [resolutionText, setResolutionText] = React.useState("")

  const { data: incidents, isLoading } = useQuery({
    queryKey: ["incidents", workspaceId],
    queryFn: () => incidentsApi.list(workspaceId!, { limit: 100 }),
    enabled: !!workspaceId,
    // Poll every 3s while user is on this page so pipeline progress shows live
    refetchInterval: 3000,
  })

  const detailQuery = useQuery({
    queryKey: ["incident", expanded],
    queryFn: () => incidentsApi.get(expanded!),
    enabled: !!expanded,
    refetchInterval: 3000,
  })

  const resolveMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) => incidentsApi.resolve(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] })
      queryClient.invalidateQueries({ queryKey: ["incident"] })
      toast.success("Incident resolved — resolution saved")
      setResolveOpen(null)
      setResolutionText("")
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to resolve"),
  })

  const retryMutation = useMutation({
    mutationFn: (id: string) => incidentsApi.retry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] })
      toast.success("Incident re-enqueued")
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Retry failed"),
  })

  const stats = React.useMemo(() => {
    if (!incidents) return { total: 0, open: 0, resolved: 0 }
    return {
      total: incidents.length,
      open: incidents.filter((i) => i.status !== "resolved" && i.status !== "failed").length,
      resolved: incidents.filter((i) => i.status === "resolved").length,
    }
  }, [incidents])

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#E8EDF0]">Incidents</h1>
          <p className="mt-0.5 text-sm text-[#8B96A0]">
            {stats.total} total · {stats.open} open · {stats.resolved} resolved · agent pipeline auto-triages
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-[14px] h-24 animate-pulse" style={{ background: "rgba(17,25,35,0.5)" }} />
          ))}
        </div>
      ) : !incidents || incidents.length === 0 ? (
        <EmptyState
          icon={<Siren className="h-6 w-6" />}
          title="No incidents yet"
          description="Install the devmind-monitor SDK on your production server to start capturing incidents. The agent pipeline will triage, recall past similar incidents, and suggest fixes automatically."
        />
      ) : (
        <div className="space-y-3">
          {incidents.map((inc) => (
            <IncidentRow
              key={inc.id}
              incident={inc}
              expanded={expanded === inc.id}
              onToggle={() => setExpanded(expanded === inc.id ? null : inc.id)}
              detailedRuns={expanded === inc.id ? detailQuery.data?.agentRuns ?? [] : []}
              onResolve={() => {
                setResolveOpen(inc.id)
                setResolutionText("")
              }}
              onRetry={() => retryMutation.mutate(inc.id)}
              isRetrying={retryMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Resolve dialog (inline simple) */}
      {resolveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setResolveOpen(null)}>
          <div
            className="w-full max-w-md rounded-[16px] p-5 space-y-4"
            style={glass}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-[#E8EDF0]">Resolve incident</h2>
            <p className="text-xs text-[#8B96A0]">
              Briefly describe how this was fixed. This will be saved as a memory so future similar incidents recall this solution.
            </p>
            <textarea
              value={resolutionText}
              onChange={(e) => setResolutionText(e.target.value)}
              rows={5}
              placeholder="e.g. Restarted pod + bumped --max-old-space-size=4096. Long-term fix tracked at ACME-234."
              className="w-full rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-3 py-2.5 text-sm text-[#E8EDF0] placeholder:text-[#4B5563] focus:outline-none focus:border-[rgba(173,255,47,0.4)] transition-colors duration-200"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setResolveOpen(null)}>Cancel</Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!resolutionText.trim() || resolveMutation.isPending}
                onClick={() => resolveMutation.mutate({ id: resolveOpen, notes: resolutionText.trim() })}
              >
                {resolveMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                Resolve
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface IncidentRowProps {
  incident: Incident
  expanded: boolean
  onToggle: () => void
  detailedRuns: AgentRun[]
  onResolve: () => void
  onRetry: () => void
  isRetrying: boolean
}

function IncidentRow({ incident, expanded, onToggle, detailedRuns, onResolve, onRetry, isRetrying }: IncidentRowProps) {
  const sev = incident.severity
  const stat = incident.status
  const isOpen = stat !== "resolved" && stat !== "failed"

  return (
    <div className="rounded-[14px] overflow-hidden" style={glass}>
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-[rgba(255,255,255,0.02)] transition-colors duration-150"
      >
        <div className={`flex h-9 w-9 items-center justify-center rounded-[10px] shrink-0 ${severityColor[sev]}`}>
          {sev === "critical" ? <AlertTriangle className="h-4 w-4" /> : <Siren className="h-4 w-4" />}
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${severityColor[sev]}`}>
              {sev}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${statusColor[stat]}`}>
              {stat}
            </span>
            {incident.classification && (
              <Chip variant="blue">{incident.classification}</Chip>
            )}
            {incident.confidence !== null && (
              <span className="text-[10px] font-mono text-[#4B5563]">
                conf {incident.confidence.toFixed(2)}
              </span>
            )}
          </div>
          <p className="text-sm text-[#E8EDF0] line-clamp-2">{incident.message}</p>
          <div className="flex items-center gap-3 text-[11px] font-mono text-[#4B5563]">
            {incident.service && (
              <span className="flex items-center gap-1">
                <Server className="h-3 w-3" />
                {incident.service}
              </span>
            )}
            {incident.hostname && <span>{incident.hostname}</span>}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo(incident.createdAt)}
            </span>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-[#4B5563] shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="border-t border-[rgba(255,255,255,0.06)] px-5 py-4 space-y-5">
          {/* Stack */}
          {incident.stack && (
            <div>
              <p className="text-[10px] font-mono text-[#4B5563] uppercase tracking-wider mb-1.5">Stack trace</p>
              <pre className="text-[11px] font-mono text-[#8B96A0] bg-[rgba(0,0,0,0.4)] rounded-[8px] p-3 overflow-x-auto max-h-48 leading-relaxed">
                {incident.stack}
              </pre>
            </div>
          )}

          {/* Triage */}
          {incident.triageNotes && (
            <Section icon={<Bot className="h-3.5 w-3.5 text-[#FBBF24]" />} label="Triage">
              <p className="text-xs text-[#E8EDF0] leading-relaxed">{incident.triageNotes}</p>
            </Section>
          )}

          {/* Researcher */}
          {incident.recallSummary && (
            <Section icon={<Brain className="h-3.5 w-3.5 text-[#A78BFA]" />} label="Researcher · memory recall">
              <p className="text-xs text-[#E8EDF0] mb-2">{incident.recallSummary}</p>
              {incident.researcherNotes && (
                <pre className="text-[11px] font-mono text-[#8B96A0] bg-[rgba(0,0,0,0.4)] rounded-[8px] p-3 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {incident.researcherNotes}
                </pre>
              )}
            </Section>
          )}

          {/* Responder */}
          {incident.responderFix && (
            <Section icon={<Lightbulb className="h-3.5 w-3.5 text-[#ADFF2F]" />} label="Responder · suggested fix">
              <p className="text-xs text-[#E8EDF0] leading-relaxed whitespace-pre-wrap">{incident.responderFix}</p>
              {incident.suggestedActions.length > 0 && (
                <ol className="mt-3 space-y-1.5">
                  {incident.suggestedActions.map((action, i) => (
                    <li key={i} className="text-xs text-[#E8EDF0] flex gap-2">
                      <span className="text-[#ADFF2F] font-mono shrink-0">{i + 1}.</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ol>
              )}
            </Section>
          )}

          {/* Resolution */}
          {incident.resolutionNotes && (
            <Section icon={<CheckCircle2 className="h-3.5 w-3.5 text-[#ADFF2F]" />} label="Resolution">
              <p className="text-xs text-[#E8EDF0] leading-relaxed">{incident.resolutionNotes}</p>
              {incident.resolvedAt && (
                <p className="mt-1 text-[10px] font-mono text-[#4B5563]">Resolved {timeAgo(incident.resolvedAt)}</p>
              )}
            </Section>
          )}

          {/* Agent runs */}
          {detailedRuns.length > 0 && (
            <Section icon={<Bot className="h-3.5 w-3.5 text-[#60A5FA]" />} label={`Agent runs (${detailedRuns.length})`}>
              <div className="space-y-1.5">
                {detailedRuns.map((run) => (
                  <div key={run.id} className="flex items-center justify-between gap-3 text-[11px] font-mono">
                    <span className="text-[#E8EDF0]">{run.agentName}</span>
                    <span className="text-[#4B5563]">
                      {run.status} · {run.durationMs ? `${run.durationMs}ms` : "running…"}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            {stat === "failed" && (
              <Button variant="ghost" size="sm" onClick={onRetry} disabled={isRetrying}>
                {isRetrying ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                Retry
              </Button>
            )}
            {isOpen && (
              <Button variant="primary" size="sm" onClick={onResolve}>
                <CheckCircle2 className="h-3 w-3" />
                Mark resolved
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[10px] font-mono text-[#4B5563] uppercase tracking-wider">{label}</span>
      </div>
      {children}
    </div>
  )
}
