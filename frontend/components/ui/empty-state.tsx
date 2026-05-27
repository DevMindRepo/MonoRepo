import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: React.ReactNode
  image?: string
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, image, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-20 px-8 text-center",
        className
      )}
    >
      {image ? (
        <div className="mb-6 relative w-44 h-44 opacity-75">
          <Image src={image} alt={title} fill className="object-contain" />
        </div>
      ) : icon ? (
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[16px] text-[#4B5563]"
          style={{ background: "rgba(255,255,255,0.025)" }}>
          {icon}
        </div>
      ) : null}
      <h3 className="text-base font-semibold text-[#E8EDF0] mb-1.5 tracking-tight">{title}</h3>
      {description && (
        <p className="text-sm text-[#8B96A0] max-w-sm leading-relaxed mb-6">{description}</p>
      )}
      {action}
    </div>
  )
}
