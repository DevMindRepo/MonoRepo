"use client"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import type { CSSProperties, ReactNode } from "react"

interface ScrollRevealProps {
  children: ReactNode
  delay?: number
  className?: string
  translateY?: number
}

export function ScrollReveal({ children, delay = 0, className = "", translateY = 24 }: ScrollRevealProps) {
  const { ref, visible } = useScrollReveal()
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : `translateY(${translateY}px)`,
        transition: `opacity 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
