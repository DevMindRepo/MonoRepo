"use client"

import * as React from "react"
import Image from "next/image"
import { X, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "primary" | "destructive"
  onConfirm: () => void | Promise<void>
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "primary",
  onConfirm,
  loading,
}: ConfirmDialogProps) {
  const [internalLoading, setInternalLoading] = React.useState(false)
  const isLoading = loading ?? internalLoading

  const handleConfirm = async () => {
    setInternalLoading(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setInternalLoading(false)
    }
  }

  const accentGradient =
    variant === "destructive"
      ? "linear-gradient(90deg, transparent, rgba(248,113,113,0.6), transparent)"
      : "linear-gradient(90deg, transparent, rgba(173,255,47,0.5), transparent)"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 border-0 bg-transparent shadow-none max-w-[380px] w-full"
        style={{ boxShadow: "none" }}
      >
        {/* Card */}
        <div
          className="relative overflow-hidden rounded-[20px] p-6"
          style={{
            background: "rgba(13,19,26,0.98)",
            backdropFilter: "blur(32px)",
            WebkitBackdropFilter: "blur(32px)",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.05), 0 24px 64px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          {/* Top accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[20px]"
            style={{ background: accentGradient }}
          />

          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="absolute top-4 right-4 flex items-center justify-center rounded-md transition-colors duration-150 disabled:opacity-40"
            style={{ color: "#4B5563" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#8B96A0")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#4B5563")}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {/* App logo */}
          <div className="flex justify-center mb-4">
            <Image
              src="/icon-512.png"
              alt="DevMind"
              width={32}
              height={32}
              className="rounded-[8px]"
            />
          </div>

          {/* Title */}
          <DialogTitle
            className="text-center tracking-tight"
            style={{
              fontSize: "17px",
              fontWeight: 600,
              color: "#E8EDF0",
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </DialogTitle>

          {/* Description */}
          {description && (
            <p
              className="text-sm leading-relaxed text-center mt-1.5"
              style={{ color: "#8B96A0" }}
            >
              {description}
            </p>
          )}

          {/* Divider */}
          <div
            className="mt-5 pt-5"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
          >
            {/* Buttons */}
            <div className="flex gap-2.5">
              {/* Cancel */}
              <button
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="flex-1 rounded-[10px] px-4 py-2.5 text-sm font-medium transition-colors duration-150 disabled:opacity-40"
                style={{
                  color: "#8B96A0",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.09)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.09)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.06)")
                }
              >
                {cancelLabel}
              </button>

              {/* Confirm */}
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-1 rounded-[10px] px-4 py-2.5 text-sm font-semibold transition-colors duration-150 disabled:opacity-60 flex items-center justify-center gap-1.5"
                style={
                  variant === "destructive"
                    ? {
                        background: "rgba(239,68,68,0.9)",
                        color: "#ffffff",
                        border: "none",
                      }
                    : {
                        background: "#ADFF2F",
                        color: "#0A0A0A",
                        border: "none",
                      }
                }
                onMouseEnter={(e) => {
                  if (variant === "destructive") {
                    e.currentTarget.style.background = "rgba(239,68,68,1.0)"
                  } else {
                    e.currentTarget.style.background = "#c5ff5a"
                  }
                }}
                onMouseLeave={(e) => {
                  if (variant === "destructive") {
                    e.currentTarget.style.background = "rgba(239,68,68,0.9)"
                  } else {
                    e.currentTarget.style.background = "#ADFF2F"
                  }
                }}
              >
                {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
