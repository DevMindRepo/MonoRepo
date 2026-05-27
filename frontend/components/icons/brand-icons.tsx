"use client"

import * as React from "react"

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number
}

const baseSvgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

export const MemoryNode = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size = 24, className, ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      {...baseSvgProps}
      className={className}
      {...props}
    >
      <circle cx="12" cy="5" r="2.25" />
      <circle cx="5" cy="18" r="2.25" />
      <circle cx="19" cy="18" r="2.25" />
      <line x1="10.45" y1="6.65" x2="6.55" y2="16.35" />
      <line x1="13.55" y1="6.65" x2="17.45" y2="16.35" />
      <line x1="7.25" y1="18" x2="16.75" y2="18" />
      <circle cx="12" cy="5" r="0.4" fill="currentColor" stroke="none" />
      <circle cx="5" cy="18" r="0.4" fill="currentColor" stroke="none" />
      <circle cx="19" cy="18" r="0.4" fill="currentColor" stroke="none" />
    </svg>
  )
)
MemoryNode.displayName = "MemoryNode"

export const WalrusBlob = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size = 24, className, ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      {...baseSvgProps}
      className={className}
      {...props}
    >
      <rect x="6" y="4" width="12" height="3.5" rx="1.75" />
      <rect x="3" y="10.25" width="18" height="3.5" rx="1.75" />
      <rect x="7.5" y="16.5" width="9" height="3.5" rx="1.75" />
    </svg>
  )
)
WalrusBlob.displayName = "WalrusBlob"

export const McpConnect = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size = 24, className, ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      {...baseSvgProps}
      className={className}
      {...props}
    >
      <line x1="2.5" y1="12" x2="21.5" y2="12" />
      <circle cx="8.5" cy="12" r="4.25" />
      <circle cx="15.5" cy="12" r="4.25" />
      <circle cx="8.5" cy="12" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="12" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
)
McpConnect.displayName = "McpConnect"

export const AgentBot = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size = 24, className, ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      {...baseSvgProps}
      className={className}
      {...props}
    >
      <line x1="12" y1="3" x2="12" y2="5.5" />
      <circle cx="12" cy="2.5" r="0.85" />
      <rect x="4.5" y="7.5" width="15" height="12" rx="3" />
      <circle cx="9" cy="13" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="15" cy="13" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  )
)
AgentBot.displayName = "AgentBot"

export const SealLock = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size = 24, className, ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      {...baseSvgProps}
      className={className}
      {...props}
    >
      <path d="M12 2.5 L20.5 7.25 L20.5 16.75 L12 21.5 L3.5 16.75 L3.5 7.25 Z" />
      <circle cx="12" cy="10.5" r="1.5" />
      <line x1="12" y1="12" x2="12" y2="15.5" />
    </svg>
  )
)
SealLock.displayName = "SealLock"

export const SuiAnchor = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size = 24, className, ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      {...baseSvgProps}
      className={className}
      {...props}
    >
      <path d="M12 4 L19 12 L12 20 L5 12 Z" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none" />
      <line x1="12" y1="2.5" x2="12" y2="3.25" />
      <line x1="21.5" y1="12" x2="20.25" y2="12" />
      <line x1="12" y1="21.5" x2="12" y2="20.75" />
      <line x1="2.5" y1="12" x2="3.75" y2="12" />
    </svg>
  )
)
SuiAnchor.displayName = "SuiAnchor"
