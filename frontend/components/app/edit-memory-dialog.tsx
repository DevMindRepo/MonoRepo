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

const TYPES = ["decision", "bug", "arch", "note"] as const
const PRIVACY = ["private", "team", "public"] as const

export interface EditableMemory {
  id: string
  content: string
  type: (typeof TYPES)[number]
  privacy?: (typeof PRIVACY)[number]
  tags: string[]
}

interface EditMemoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  memory: EditableMemory | null
  onSave: (updated: EditableMemory) => void | Promise<void>
}

export function EditMemoryDialog({ open, onOpenChange, memory, onSave }: EditMemoryDialogProps) {
  const [content, setContent] = React.useState("")
  const [type, setType] = React.useState<(typeof TYPES)[number]>("note")
  const [privacy, setPrivacy] = React.useState<(typeof PRIVACY)[number]>("team")
  const [tagInput, setTagInput] = React.useState("")
  const [tags, setTags] = React.useState<string[]>([])
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (memory) {
      setContent(memory.content)
      setType(memory.type)
      setPrivacy(memory.privacy ?? "team")
      setTags(memory.tags)
      setTagInput("")
    }
  }, [memory])

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput("")
  }

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t))

  const handleSave = async () => {
    if (!memory) return
    setSaving(true)
    try {
      await onSave({ id: memory.id, content, type, privacy, tags })
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit memory</DialogTitle>
          <DialogDescription>Refine the content before approval. This will be encrypted with Seal and stored on Walrus.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Content */}
          <div>
            <label className="mb-1.5 block text-[10px] font-mono uppercase tracking-widest text-[#4B5563]">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full rounded-[10px] px-3 py-2.5 text-sm text-[#E8EDF0] placeholder:text-[#4B5563] focus:outline-none focus:border-[rgba(173,255,47,0.4)] transition-all duration-200 resize-none"
              style={inputStyle}
              placeholder="Describe the decision, bug, or note..."
            />
          </div>

          {/* Type */}
          <div>
            <label className="mb-1.5 block text-[10px] font-mono uppercase tracking-widest text-[#4B5563]">Type</label>
            <div className="flex flex-wrap gap-1.5">
              {TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-mono transition-all duration-150 cursor-pointer border",
                    type === t
                      ? "text-[#ADFF2F] border-[rgba(173,255,47,0.3)]"
                      : "text-[#8B96A0] border-transparent hover:border-[rgba(255,255,255,0.1)] hover:text-[#E8EDF0]"
                  )}
                  style={{ background: type === t ? "rgba(173,255,47,0.1)" : "rgba(255,255,255,0.04)" }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Privacy */}
          <div>
            <label className="mb-1.5 block text-[10px] font-mono uppercase tracking-widest text-[#4B5563]">Privacy</label>
            <div className="flex flex-wrap gap-1.5">
              {PRIVACY.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPrivacy(p)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-mono transition-all duration-150 cursor-pointer border",
                    privacy === p
                      ? "text-[#ADFF2F] border-[rgba(173,255,47,0.3)]"
                      : "text-[#8B96A0] border-transparent hover:border-[rgba(255,255,255,0.1)] hover:text-[#E8EDF0]"
                  )}
                  style={{ background: privacy === p ? "rgba(173,255,47,0.1)" : "rgba(255,255,255,0.04)" }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1.5 block text-[10px] font-mono uppercase tracking-widest text-[#4B5563]">Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-mono text-[#8B96A0]"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-[#4B5563] hover:text-[#F87171] transition-colors"
                    aria-label={`Remove ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault()
                  addTag()
                }
              }}
              placeholder="Add tag and press Enter..."
              className="w-full rounded-[10px] px-3 py-2 text-xs font-mono text-[#E8EDF0] placeholder:text-[#4B5563] focus:outline-none focus:border-[rgba(173,255,47,0.4)] transition-all duration-200"
              style={inputStyle}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} loading={saving} disabled={!content.trim()}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
