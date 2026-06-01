"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CodePill } from "@/components/ui/code-pill"
import { Play } from "lucide-react"

// Geometry measured from /rotate2/coreandtentacles.png (596×488, transparent).
// The image rotates about its glowing core (which sits slightly above the
// bounding-box center), and a branded pod is anchored at each tentacle tip.
const CORE_ORIGIN = "50.2% 45.7%" // core center as % of the image — the rotation pivot
const POD_PCT = 34 // pod ("remora") size, as % of the container width

// Each pod's resting position = its tentacle tip, as % of the image box.
// Mapped to the original solar-system layout by matching tentacle angle.
const NODES = [
  { left: 26.8, top: 7.4, src: "/rotate2/Sui.png", label: "Sui" },
  { left: 67.8, top: 2.3, src: "/rotate2/ClaudeCode.png", label: "Claude Code" },
  { left: 91.3, top: 21.1, src: "/rotate2/cursor.png", label: "Cursor" },
  { left: 94.0, top: 69.1, src: "/rotate2/github.png", label: "GitHub" },
  { left: 54.0, top: 95.9, src: "/rotate2/mcp.png", label: "MCP" },
  { left: 11.7, top: 83.4, src: "/rotate2/Walrus.png", label: "Walrus" },
  { left: 4.2, top: 38.5, src: "/rotate2/Seal.png", label: "Seal" },
]

export function HeroSection() {
  const orbRef = useRef<HTMLDivElement>(null)
  const iconRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    // Respect users who prefer reduced motion — leave everything static for them.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const orb = orbRef.current
    if (!orb) return

    // Slow idle rotation — one full turn per minute. The core + tentacles spin
    // about the core; the pods orbit along with them but counter-rotate so they
    // (and their labels) stay upright.
    const DEG_PER_SEC = 6
    let frame = 0
    let start: number | null = null

    const tick = (now: number) => {
      if (start === null) start = now
      const deg = (((now - start) / 1000) * DEG_PER_SEC) % 360
      orb.style.transform = `rotate(${deg}deg)`
      for (const el of iconRefs.current) {
        if (el) el.style.transform = `translate(-50%, -50%) rotate(${-deg}deg)`
      }
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Lime accent glow — sits on top of the page-level shader */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] rounded-full bg-[radial-gradient(circle,rgba(173,255,47,0.05)_0%,transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(173,255,47,0.03)_0%,transparent_50%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 md:px-6 py-12 md:py-16 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center w-full">
        {/* Left — text */}
        <div className="space-y-6 md:space-y-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
            Your AI finally{" "}
            <span className="gradient-text-mint">remembers.</span>
          </h1>

          <p className="text-base md:text-lg text-[#8B96A0] leading-relaxed max-w-md">
            Persistent memory for Claude Code, Cursor, and Copilot. Your team&apos;s decisions,
            patterns, and context — recalled across sessions, across tools, across teammates.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <CodePill code="npm create devmind" label="Quick start" />
            <Button asChild variant="secondary" size="md" className="gap-2">
              <Link href="#">
                <Play className="h-3.5 w-3.5" />
                Watch demo
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { logo: "/ecosystem-seal.png", label: "Encrypted with Seal" },
              { logo: "/ecosystem-walrus.png", label: "Stored on Walrus" },
              { logo: "/ecosystem-sui.png", label: "Anchored on Sui" },
            ].map(({ logo, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-[#C8D0D8] transition-colors duration-200 hover:text-[#E8EDF0]"
                style={{
                  background: "rgba(17,25,35,0.7)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <Image src={logo} alt={label} width={16} height={16} className="h-4 w-4 rounded-full object-cover" />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Right — solar system */}
        <div className="relative flex items-center justify-center order-first lg:order-last">
          <div
            ref={orbRef}
            className="relative w-[232px] sm:w-[348px] lg:w-[309px] xl:w-[386px] 2xl:w-[497px]"
            style={{ aspectRatio: "596 / 488", transformOrigin: CORE_ORIGIN, willChange: "transform" }}
          >
            <Image
              src="/rotate2/coreandtentacles.png"
              alt="DevMind memory network"
              fill
              className="object-contain"
              style={{ filter: "drop-shadow(0 0 40px rgba(173,255,47,0.5)) drop-shadow(0 0 100px rgba(173,255,47,0.2))" }}
              sizes="(min-width: 1536px) 497px, (min-width: 1280px) 386px, (min-width: 1024px) 309px, (min-width: 640px) 348px, 232px"
              preload
            />

            {/* Branded pod at each tentacle tip — orbits with the rotation, stays upright */}
            {NODES.map((n, i) => (
              <div
                key={n.label}
                ref={(el) => {
                  iconRefs.current[i] = el
                }}
                className="absolute"
                style={{
                  left: `${n.left}%`,
                  top: `${n.top}%`,
                  width: `${POD_PCT}%`,
                  aspectRatio: "1",
                  transform: "translate(-50%, -50%)",
                  willChange: "transform",
                }}
              >
                <Image src={n.src} alt={n.label} fill className="object-contain" sizes="(min-width: 1536px) 169px, (min-width: 1024px) 105px, 79px" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
        <div className="h-8 w-5 rounded-full border border-[rgba(255,255,255,0.3)] flex items-start justify-center pt-1.5">
          <div className="h-1.5 w-1 rounded-full bg-white animate-bounce" />
        </div>
      </div>
    </section>
  )
}
