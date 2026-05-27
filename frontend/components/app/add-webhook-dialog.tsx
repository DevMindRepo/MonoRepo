"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const EVENTS = ["pull_request", "push", "issues"] as const

interface AddWebhookDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (data: { repo: string; event: (typeof EVENTS)[number] }) => void | Promise<void>
}

export function AddWebhookDialog({ open, onOpenChange, onAdd }: AddWebhookDialogProps) {
  const [repo, setRepo] = React.useState("")
  const [event, setEvent] = React.useState<(typeof EVENTS)[number]>("pull_request")
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setRepo("")
      setEvent("pull_request")
    }
  }, [open])

  const handleAdd = async () => {
    if (!repo.includes("/")) return
    setSaving(true)
    try {
      await onAdd({ repo, event })
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add GitHub webhook</DialogTitle>
          <DialogDescription>Trigger memory extraction when events occur on a repo.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[10px] font-mono uppercase tracking-widest text-[#4B5563]">Repository</label>
            <input
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              placeholder="org/repo-name"
              className="w-full rounded-[10px] px-3 py-2.5 text-sm font-mono text-[#E8EDF0] placeholder:text-[#4B5563] focus:outline-none focus:border-[rgba(173,255,47,0.4)] transition-all duration-200"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-mono uppercase tracking-widest text-[#4B5563]">Trigger event</label>
            <div className="flex flex-wrap gap-1.5">
              {EVENTS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEvent(e)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-mono transition-all duration-150 cursor-pointer border",
                    event === e
                      ? "text-[#ADFF2F] border-[rgba(173,255,47,0.3)]"
                      : "text-[#8B96A0] border-transparent hover:border-[rgba(255,255,255,0.1)] hover:text-[#E8EDF0]"
                  )}
                  style={{ background: event === e ? "rgba(173,255,47,0.1)" : "rgba(255,255,255,0.04)" }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleAdd} loading={saving} disabled={!repo.includes("/")}>
            Add webhook
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
