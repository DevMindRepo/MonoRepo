"use client"

import * as React from "react"

const NOISE_URI =
  "data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"

function useStars(count: number) {
  const [shadow, setShadow] = React.useState("")

  React.useEffect(() => {
    const W = window.innerWidth
    const H = window.innerHeight
    // LCG pseudo-random — deterministic per session, no hydration mismatch
    let s = 0x4a3f2e1d
    const rng = () => {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0
      return s / 0xffffffff
    }

    const parts: string[] = []
    for (let i = 0; i < count; i++) {
      const x = Math.round(rng() * W)
      const y = Math.round(rng() * H)
      const a = (rng() * 0.45 + 0.08).toFixed(2)
      const big = rng() > 0.93
      parts.push(`${x}px ${y}px 0 ${big ? "1px" : "0"} rgba(200,220,255,${a})`)
    }
    setShadow(parts.join(","))
  }, [count])

  return shadow
}

export function PremiumDashboardBackground() {
  const stars = useStars(160)

  return (
    <>
      <style suppressHydrationWarning>{`
        @keyframes _dmA {
          0%,100% { transform:translate(0,0) scale(1); }
          50%      { transform:translate(48px,-36px) scale(1.08); }
        }
        @keyframes _dmB {
          0%,100% { transform:translate(0,0) scale(1); }
          50%      { transform:translate(-36px,44px) scale(1.07); }
        }
        @keyframes _dmC {
          0%,100% { transform:translate(0,0) scale(1); }
          33%      { transform:translate(28px,22px) scale(1.05); }
          66%      { transform:translate(-22px,-14px) scale(0.96); }
        }
        ._dm-a { animation:_dmA 28s ease-in-out infinite; }
        ._dm-b { animation:_dmB 34s ease-in-out infinite; }
        ._dm-c { animation:_dmC 22s ease-in-out infinite; }
      `}</style>

      <div
        className="fixed inset-0 overflow-hidden"
        style={{ background: "#070B12", zIndex: 0 }}
        aria-hidden="true"
      >
        {/* ── Blue spotlight — top-right ── */}
        <div
          className="_dm-a absolute"
          style={{
            top: "-22%",
            right: "-12%",
            width: "72vw",
            height: "72vw",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at center, rgba(140,170,255,0.32) 0%, rgba(100,140,255,0.08) 40%, transparent 68%)",
            pointerEvents: "none",
          }}
        />

        {/* ── Purple glow — top-center ── */}
        <div
          className="_dm-b absolute"
          style={{
            top: "-28%",
            left: "22%",
            width: "54vw",
            height: "54vw",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at center, rgba(120,80,255,0.13) 0%, transparent 58%)",
            pointerEvents: "none",
          }}
        />

        {/* ── Brand green — bottom-left ── */}
        <div
          className="_dm-c absolute"
          style={{
            bottom: "-22%",
            left: "-8%",
            width: "48vw",
            height: "48vw",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at center, rgba(173,255,47,0.07) 0%, transparent 62%)",
            pointerEvents: "none",
          }}
        />

        {/* ── Stars ── */}
        {stars && (
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
          >
            <span
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                display: "block",
                width: "1px",
                height: "1px",
                borderRadius: "50%",
                background: "transparent",
                boxShadow: stars,
              }}
            />
          </div>
        )}

        {/* ── Grain / noise ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("${NOISE_URI}")`,
            backgroundRepeat: "repeat",
            backgroundSize: "256px 256px",
            opacity: 0.032,
            mixBlendMode: "overlay",
          }}
        />

        {/* ── Edge vignette ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 140% 110% at 50% 50%, transparent 38%, rgba(3,6,11,0.75) 100%)",
          }}
        />

        {/* ── Bottom fade ── */}
        <div
          className="absolute bottom-0 inset-x-0 h-1/2 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(3,6,11,0.55) 100%)",
          }}
        />

        {/* ── Top rim light (subtle) ── */}
        <div
          className="absolute inset-x-0 top-0 h-px pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(140,170,255,0.18) 40%, rgba(120,80,255,0.12) 60%, transparent 100%)",
          }}
        />
      </div>
    </>
  )
}
