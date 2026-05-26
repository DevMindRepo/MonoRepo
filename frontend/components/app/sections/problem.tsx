"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ScrollReveal } from "@/components/app/scroll-reveal"

const MSG_A = [
  { from: "user", text: "We use JWT for auth — stateless, scales horizontally." },
  { from: "ai",   text: "Got it. Prisma for all DB ops, raw SQL only for analytics." },
  { from: "user", text: "Rate-limit via Redis, 60 req/min per workspace." },
]
const MSG_B = [
  { from: "ai", text: "What ORM does this project use?" },
  { from: "ai", text: "Should I use JWT or session-based auth?" },
  { from: "ai", text: "What's the rate-limiting strategy again?" },
]

function Bubble({ from, text, visible }: { from: "user" | "ai"; text: string; visible: boolean }) {
  return (
    <div className={cn(
      "flex items-end gap-2 transition-all duration-500 ease-out",
      from === "user" ? "flex-row-reverse" : "flex-row",
      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none",
    )}>
      {from === "ai" && (
        <div className="h-6 w-6 rounded-full bg-[#1A2129] border border-[rgba(255,255,255,0.1)] flex items-center justify-center shrink-0 mb-0.5">
          <span className="text-[7px] font-bold text-[#8B96A0]">AI</span>
        </div>
      )}
      <div className={cn(
        "rounded-[14px] px-3.5 py-2.5 text-[12.5px] leading-snug max-w-[calc(100%-2.5rem)]",
        from === "user"
          ? "bg-[rgba(173,255,47,0.1)] border border-[rgba(173,255,47,0.22)] text-[#C8E87A] rounded-br-[4px]"
          : "bg-[#161D22] border border-[rgba(255,255,255,0.08)] text-[#8B96A0] rounded-bl-[4px]",
      )}>
        {text}
      </div>
    </div>
  )
}

function ChatVisual() {
  const [visA, setVisA] = useState([false, false, false])
  const [wiped, setWiped] = useState(false)
  const [visB, setVisB] = useState([false, false, false])
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    const T: ReturnType<typeof setTimeout>[] = []
    setVisA([false, false, false]); setWiped(false); setVisB([false, false, false])
    T.push(setTimeout(() => setVisA([true,  false, false]), 600))
    T.push(setTimeout(() => setVisA([true,  true,  false]), 1300))
    T.push(setTimeout(() => setVisA([true,  true,  true ]), 2000))
    T.push(setTimeout(() => setWiped(true),                 3200))
    T.push(setTimeout(() => setVisB([true,  false, false]), 4100))
    T.push(setTimeout(() => setVisB([true,  true,  false]), 4800))
    T.push(setTimeout(() => setVisB([true,  true,  true ]), 5500))
    T.push(setTimeout(() => setCycle(c => c + 1),           8600))
    return () => T.forEach(clearTimeout)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycle])

  return (
    <div className="h-full rounded-[20px] border border-[rgba(255,255,255,0.07)] bg-[#0E1419] overflow-hidden flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[rgba(255,255,255,0.05)] shrink-0">
        <span className="h-2.5 w-2.5 rounded-full bg-[#F87171] opacity-60" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FBBF24] opacity-60" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#4ADE80] opacity-60" />
        <span className="ml-2 text-[10px] font-mono text-[#4B5563]">claude code · devmind session</span>
      </div>
      <div className={cn("flex-1 flex flex-col px-4 pt-4 pb-3 space-y-2.5 min-h-0 transition-opacity duration-700", wiped ? "opacity-[0.18]" : "opacity-100")}>
        <div className="flex items-center gap-2 mb-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ADFF2F]" />
          <span className="text-[9px] font-mono text-[#4B5563] uppercase tracking-[0.18em]">Monday · Session 1</span>
        </div>
        {MSG_A.map((m, i) => <Bubble key={i} from={m.from as "user"|"ai"} text={m.text} visible={visA[i]} />)}
      </div>
      <div className={cn("relative mx-0 py-3.5 shrink-0 transition-all duration-600 ease-out", wiped ? "opacity-100" : "opacity-0")}>
        <div className="h-px bg-gradient-to-r from-transparent via-[rgba(244,114,182,0.45)] to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-[#0E1419] px-3 text-[9px] font-mono text-[#F472B6] tracking-[0.18em] uppercase whitespace-nowrap select-none">
            — session ended · context wiped —
          </span>
        </div>
      </div>
      <div className="flex-1 flex flex-col px-4 pb-4 pt-2 space-y-2.5 min-h-0">
        <div className="flex items-center gap-2 mb-2">
          <span className={cn("h-1.5 w-1.5 rounded-full bg-[#F472B6] shrink-0", wiped && "animate-pulse")} />
          <span className="text-[9px] font-mono text-[#4B5563] uppercase tracking-[0.18em]">Thursday · Session 2</span>
        </div>
        {MSG_B.map((m, i) => <Bubble key={i} from={m.from as "user"|"ai"} text={m.text} visible={visB[i]} />)}
      </div>
    </div>
  )
}

export function ProblemSection() {
  return (
    <section className="relative py-16 md:py-24 overflow-x-hidden">
      {/* Semi-transparent dark overlay — lets shader glitch bleed through with a pink/purple tint */}
      <div className="absolute inset-0 bg-[rgba(7,11,14,0.82)]" />
      <div className="absolute inset-0 bg-[rgba(244,114,182,0.04)] mix-blend-screen pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
        <ScrollReveal>
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
                AI assistants have{" "}
                <span className="text-[#F472B6]">amnesia.</span>
              </h2>

              <p className="text-[#8B96A0] leading-relaxed">
                Monday you walked Claude through your entire auth strategy.
                Thursday it starts fresh — no context, no decisions, no memory.{" "}
                Every session, every tool, every teammate:{" "}
                <span className="text-[#E8EDF0] font-medium">zero.</span>
              </p>

              <ul className="space-y-4">
                {[
                  { text: "Re-explain your stack from scratch, every session",    sub: "Claude, Cursor, Copilot — each one starts blind" },
                  { text: "PR reviews that contradict decisions made last sprint", sub: "Your agent doesn't know what your team already agreed on" },
                  { text: "Knowledge siloed per developer, per device",           sub: "What your AI learned can't be shared with teammates" },
                  { text: "Agents repeat the same expensive mistakes",            sub: "No memory = no learning across runs" },
                ].map(({ text, sub }) => (
                  <li key={text} className="flex items-start gap-3">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#F472B6]" />
                    <div>
                      <p className="text-sm font-medium text-[#C8D0D8]">{text}</p>
                      <p className="text-xs text-[#4B5563] mt-0.5">{sub}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="h-[420px] sm:h-[440px] lg:h-[460px]">
              <ChatVisual />
            </div>

          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
