"use client"

import * as React from "react"
import { Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CodePillProps {
  code: string
  className?: string
  label?: string
}

export function CodePill({ code, className, label }: CodePillProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "group inline-flex items-center gap-3 rounded-[10px] border border-[rgba(173,255,47,0.2)] bg-[rgba(173,255,47,0.05)] px-4 py-2.5 transition-all duration-200 hover:border-[rgba(173,255,47,0.4)] hover:bg-[rgba(173,255,47,0.08)] active:scale-[0.99] cursor-pointer",
        className
      )}
      aria-label={`Copy: ${code}`}
    >
      {label && (
        <span className="text-xs text-[#8B96A0] font-sans">{label}</span>
      )}
      <code className="font-mono text-sm text-[#ADFF2F] tracking-tight">
        {code}
      </code>
      <span className="ml-auto pl-2 text-[#ADFF2F] opacity-50 transition-opacity duration-200 group-hover:opacity-100">
        {copied ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </span>
    </button>
  )
}
