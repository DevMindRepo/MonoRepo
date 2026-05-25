import * as React from "react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-8 text-center",
        className
      )}
    >
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[14px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] text-[#8B96A0]">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-medium text-[#E8EDF0] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[#8B96A0] max-w-sm leading-relaxed mb-5">{description}</p>
      )}
      {action}
    </div>
  )
}
