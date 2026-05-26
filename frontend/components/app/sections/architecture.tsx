"use client"
import { useEffect, useRef, useState } from "react"
import Image from "next/image"

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true) },
      { threshold }
    )
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

export function ArchitectureSection() {
  const { ref, inView } = useInView(0.1)

  return (
    <>
      <style>{`
        @keyframes arch-float  { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-10px)} }
        @keyframes arch-glow-a { 0%,100%{opacity:.5} 50%{opacity:.9} }
        @keyframes arch-glow-b { 0%,100%{opacity:.4} 50%{opacity:.8} }
        @keyframes arch-scan {
          0%   { top:-4px; opacity:0 }
          5%   { opacity:1 }
          95%  { opacity:1 }
          100% { top:100%; opacity:0 }
        }
      `}</style>

      <section
        className="py-16 md:py-24 px-4 md:px-6"
        style={{ background: "#050A0E", borderTop: "1px solid rgba(255,255,255,0.04)" }}
      >
        <div className="mx-auto max-w-6xl">

          {/* Header */}
          <div
            className="text-center mb-16"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(24px)",
              transition: "opacity 0.7s ease, transform 0.7s ease",
            }}
          >
            <p className="text-[12px] font-mono text-[#ADFF2F] uppercase tracking-[0.25em] mb-4">
              Architecture
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#E8EDF0] leading-tight">
              Serious infrastructure.{" "}
              <br className="hidden lg:block" />
              <span style={{
                background: "linear-gradient(135deg, #ADFF2F 0%, #60A5FA 55%, #A78BFA 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Simple integration.
              </span>
            </h2>
          </div>

          {/* Diagram — transparent PNG floats over dark bg */}
          <div
            ref={ref}
            className="relative mx-auto"
            style={{
              maxWidth: "860px",
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(40px)",
              transition: "opacity 1s cubic-bezier(0.16,1,0.3,1) 0.2s, transform 1s cubic-bezier(0.16,1,0.3,1) 0.2s",
              animation: inView ? "arch-float 7s ease-in-out 1.2s infinite" : "none",
            }}
          >
            {/* Ambient glow blobs behind the image */}
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
              {/* lime top-center */}
              <div className="absolute" style={{
                top: "5%", left: "30%", width: "40%", height: "35%",
                background: "radial-gradient(circle, rgba(173,255,47,0.18) 0%, transparent 70%)",
                filter: "blur(60px)",
                animation: "arch-glow-a 5s ease-in-out infinite",
              }} />
              {/* amber mid-left */}
              <div className="absolute" style={{
                top: "35%", left: "5%", width: "35%", height: "30%",
                background: "radial-gradient(circle, rgba(251,146,60,0.15) 0%, transparent 70%)",
                filter: "blur(60px)",
                animation: "arch-glow-b 6s ease-in-out 1s infinite",
              }} />
              {/* blue mid-right */}
              <div className="absolute" style={{
                top: "40%", right: "5%", width: "35%", height: "30%",
                background: "radial-gradient(circle, rgba(96,165,250,0.15) 0%, transparent 70%)",
                filter: "blur(60px)",
                animation: "arch-glow-a 7s ease-in-out 0.5s infinite",
              }} />
              {/* purple bottom-center */}
              <div className="absolute" style={{
                bottom: "5%", left: "25%", width: "50%", height: "35%",
                background: "radial-gradient(circle, rgba(167,139,250,0.14) 0%, transparent 70%)",
                filter: "blur(60px)",
                animation: "arch-glow-b 5.5s ease-in-out 2s infinite",
              }} />
            </div>

            {/* The image itself */}
            <div className="relative" style={{ zIndex: 1 }}>
              {/* Scan line sweeping over the image */}
              <div
                className="absolute inset-x-0 h-[3px] pointer-events-none"
                style={{
                  zIndex: 2,
                  background: "linear-gradient(90deg, transparent 0%, rgba(173,255,47,0.6) 40%, rgba(173,255,47,1) 50%, rgba(173,255,47,0.6) 60%, transparent 100%)",
                  animation: inView ? "arch-scan 5s ease-in-out 1.5s infinite" : "none",
                }}
              />

              <Image
                src="/system-architecture.png"
                alt="DevMind system architecture"
                width={1200}
                height={700}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 860px"
                className="w-full h-auto block"
                style={{
                  filter: "invert(1) drop-shadow(0 0 40px rgba(173,255,47,0.25)) drop-shadow(0 0 80px rgba(173,255,47,0.1))",
                }}
                priority
              />
            </div>
          </div>

          {/* Bottom caption badges */}
          <div
            className="flex items-center justify-center gap-6 mt-10 flex-wrap"
            style={{
              opacity: inView ? 1 : 0,
              transition: "opacity 0.6s ease 0.9s",
            }}
          >
            {[
              { label: "Sui Testnet",    color: "#A78BFA" },
              { label: "Walrus Testnet", color: "#60A5FA" },
              { label: "Railway",        color: "#FB923C" },
              { label: "Vercel",         color: "#ADFF2F" },
            ].map(({ label, color }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${color}30`,
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                <span className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span>
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  )
}
