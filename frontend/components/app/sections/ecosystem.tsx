"use client"
import Image from "next/image"

import { ScrollReveal } from "@/components/app/scroll-reveal"

const PANELS = [
  {
    id: "walrus",
    title: "Walrus",
    description: "Decentralized blob storage. Every memory has a verifiable blob ID, long-lived and epoch-renewable.",
    img: "/ecosystem-walrus.png",
    bgColor: "rgba(173,255,47,0.04)",
    hoverOverlay: "rgba(173,255,47,0.06)",
  },
  {
    id: "seal",
    title: "Seal",
    description: "Client-side encryption SDK. Memories are encrypted before upload — only your workspace backend can decrypt.",
    img: "/ecosystem-seal.png",
    bgColor: "rgba(168,85,247,0.04)",
    hoverOverlay: "rgba(168,85,247,0.07)",
  },
  {
    id: "sui",
    title: "Sui Move",
    description: "Workspace identity anchored on-chain. A Move smart contract registers your workspace and enforces access policies.",
    img: "/ecosystem-sui.png",
    bgColor: "rgba(59,130,246,0.04)",
    hoverOverlay: "rgba(59,130,246,0.07)",
  },
]

export function EcosystemSection() {
  return (
    <section id="ecosystem" className="py-16 md:py-24 px-4 md:px-6" style={{ background: "#070B0E" }}>
      <div className="mx-auto max-w-5xl">

        {/* ── Horizontal divider with label ── */}
        <ScrollReveal>
          <div className="flex items-center gap-4 mb-14">
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
            <span className="text-[13px] font-mono text-[#ADFF2F] uppercase tracking-[0.25em] whitespace-nowrap">
              Built on
            </span>
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
          </div>
        </ScrollReveal>

        {/* ── Two-column header ── */}
        <ScrollReveal>
          <div className="grid md:grid-cols-2 gap-8 mb-12 items-end">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-[#E8EDF0]">
              Walrus + Seal +{" "}
              <span className="gradient-text-mint">Sui</span>{" "}
              ecosystem
            </h2>
            <p className="text-[#8B96A0] leading-relaxed md:pb-1">
              Every memory is decentralized by default. Walrus stores the encrypted blob,
              Seal handles client-side encryption, and Sui anchors your workspace identity on-chain.
            </p>
          </div>
        </ScrollReveal>

        {/* ── Unified bento container ── */}
        <ScrollReveal delay={120}>
          <div
            className="rounded-[20px] overflow-hidden"
            style={{
              border: "1px solid rgba(255,255,255,0.07)",
              background: "#0D1117",
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[rgba(255,255,255,0.06)]">
              {PANELS.map(({ id, title, description, img, bgColor, hoverOverlay }) => (
                <div key={id} className="group flex flex-col cursor-default">
                  {/* Illustration */}
                  <div
                    className="relative overflow-hidden transition-colors duration-300"
                    style={{ height: "260px", background: bgColor }}
                  >
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{ background: `linear-gradient(180deg, ${hoverOverlay} 0%, transparent 60%)` }}
                    />
                    <Image
                      src={img}
                      alt={title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>

                  {/* Label row */}
                  <div
                    className="p-5"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="space-y-1.5">
                      <h3 className="text-[17px] font-semibold text-[#E8EDF0] leading-tight group-hover:text-white transition-colors duration-200">
                        {title}
                      </h3>
                      <p className="text-[12px] text-[#4B5563] leading-relaxed group-hover:text-[#6B7880] transition-colors duration-200">
                        {description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>


      </div>
    </section>
  )
}
