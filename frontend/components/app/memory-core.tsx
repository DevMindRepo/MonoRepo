"use client"

import Image from "next/image"

export function MemoryCore() {
  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Outer ambient glow */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(173,255,47,0.12) 0%, rgba(173,255,47,0.04) 45%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      {/* Static image */}
      <div
        className="relative w-full h-full"
      >
        <Image
          src="/hero-circle.png"
          alt="DevMind memory network"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain"
          style={{
            mixBlendMode: "screen",
            filter: "drop-shadow(0 0 40px rgba(173,255,47,0.35)) drop-shadow(0 0 80px rgba(173,255,47,0.15))",
          }}
          priority
        />
      </div>

      {/* Center pulse ring */}
      <div
        className="absolute rounded-full pointer-events-none animate-ping"
        style={{
          width: "80px",
          height: "80px",
          background: "transparent",
          border: "1px solid rgba(173,255,47,0.3)",
          animationDuration: "2.5s",
        }}
      />
    </div>
  )
}
