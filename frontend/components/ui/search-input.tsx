"use client"

import * as React from "react"
import { Search, Sparkles, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  onClear?: () => void
  semantic?: boolean
  size?: "sm" | "md" | "lg"
  containerClassName?: string
}

export function SearchInput({
  className,
  containerClassName,
  onClear,
  semantic = true,
  size = "md",
  value,
  ...props
}: SearchInputProps) {
  const sizeClasses = {
    sm: "h-9 text-sm pl-9 pr-9",
    md: "h-11 text-sm pl-10 pr-10",
    lg: "h-14 text-base pl-12 pr-12",
  }

  const iconSizeClasses = {
    sm: "h-4 w-4 left-2.5",
    md: "h-4 w-4 left-3",
    lg: "h-5 w-5 left-3.5",
  }

  return (
    <div className={cn("relative group", containerClassName)}>
      <Search
        className={cn(
          "absolute top-1/2 -translate-y-1/2 text-[#8B96A0] transition-colors duration-200 group-focus-within:text-[#ADFF2F] pointer-events-none",
          iconSizeClasses[size]
        )}
      />
      <input
        type="search"
        value={value}
        className={cn(
          "w-full rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[#11181C] text-[#E8EDF0] placeholder:text-[#4B5563] transition-all duration-200",
          "focus:outline-none focus:border-[rgba(173,255,47,0.4)] focus:bg-[#161D22] focus:shadow-[0_0_0_1px_rgba(173,255,47,0.15)]",
          "hover:border-[rgba(255,255,255,0.12)]",
          "[&::-webkit-search-cancel-button]:hidden",
          sizeClasses[size],
          className
        )}
        {...props}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
        {value && onClear && (
          <button
            onClick={onClear}
            className="text-[#8B96A0] hover:text-[#E8EDF0] transition-colors duration-150 cursor-pointer"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {semantic && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(173,255,47,0.08)] px-2 py-0.5 text-[10px] font-medium text-[#ADFF2F]">
            <Sparkles className="h-2.5 w-2.5" />
            AI
          </span>
        )}
      </div>
    </div>
  )
}
