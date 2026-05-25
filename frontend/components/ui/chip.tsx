import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const chipVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-mono text-xs font-medium px-2.5 py-0.5 whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-[rgba(255,255,255,0.08)] text-[#8B96A0]",
        mint: "bg-[rgba(173,255,47,0.12)] text-[#ADFF2F] border border-[rgba(173,255,47,0.2)]",
        magenta: "bg-[rgba(244,114,182,0.12)] text-[#F472B6] border border-[rgba(244,114,182,0.2)]",
        yellow: "bg-[rgba(251,191,36,0.12)] text-[#FBBF24] border border-[rgba(251,191,36,0.2)]",
        red: "bg-[rgba(248,113,113,0.12)] text-[#F87171] border border-[rgba(248,113,113,0.2)]",
        blue: "bg-[rgba(96,165,250,0.12)] text-[#60A5FA] border border-[rgba(96,165,250,0.2)]",
        outline: "border border-[rgba(255,255,255,0.1)] text-[#8B96A0]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface ChipProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof chipVariants> {
  dot?: boolean
}

const memoryTypeVariant: Record<string, VariantProps<typeof chipVariants>["variant"]> = {
  decision: "mint",
  bug: "red",
  arch: "blue",
  note: "default",
}

const privacyVariant: Record<string, VariantProps<typeof chipVariants>["variant"]> = {
  private: "magenta",
  team: "yellow",
  public: "mint",
}

function Chip({ className, variant, dot, children, ...props }: ChipProps) {
  return (
    <span className={cn(chipVariants({ variant, className }))} {...props}>
      {dot && (
        <span
          className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70"
          aria-hidden
        />
      )}
      {children}
    </span>
  )
}

export { Chip, chipVariants, memoryTypeVariant, privacyVariant }
