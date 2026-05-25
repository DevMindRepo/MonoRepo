"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ADFF2F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070B0E] disabled:pointer-events-none disabled:opacity-40 cursor-pointer select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-[#ADFF2F] text-[#070B0E] font-semibold hover:bg-[#90D400] hover:shadow-[0_0_20px_rgba(173,255,47,0.3)] active:scale-[0.98]",
        secondary:
          "border border-[rgba(173,255,47,0.3)] text-[#ADFF2F] bg-transparent hover:bg-[rgba(173,255,47,0.08)] hover:border-[rgba(173,255,47,0.5)] active:scale-[0.98]",
        ghost:
          "text-[#8B96A0] hover:text-[#E8EDF0] hover:bg-[rgba(255,255,255,0.06)] active:scale-[0.98]",
        destructive:
          "bg-[rgba(248,113,113,0.15)] text-[#F87171] border border-[rgba(248,113,113,0.3)] hover:bg-[rgba(248,113,113,0.25)] active:scale-[0.98]",
        outline:
          "border border-[rgba(255,255,255,0.1)] text-[#E8EDF0] bg-transparent hover:bg-[rgba(255,255,255,0.06)] active:scale-[0.98]",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4",
        lg: "h-11 px-6 text-base",
        xl: "h-13 px-8 text-base",
        icon: "h-9 w-9",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {asChild ? children : (
          <>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {children}
          </>
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
