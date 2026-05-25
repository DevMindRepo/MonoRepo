"use client"
import { ScrollReveal } from "@/components/app/scroll-reveal"

export function ProblemSection() {
  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
                AI assistants have{" "}
                <span className="text-[#F472B6]">amnesia.</span>
              </h2>
              <p className="text-[#8B96A0] leading-relaxed">
                Every new session, your AI starts from zero. The architecture decision you made on
                Monday? Gone. The bug your team spent 3 hours debugging? Forgotten. The patterns
                that work in your codebase? Lost.
              </p>
              <ul className="space-y-3">
                {[
                  "Context lost between every session",
                  "Knowledge trapped in a single tool or device",
                  "Teammates can't share what their AI has learned",
                  "Autonomous agents repeat the same mistakes",
                ].map((pain) => (
                  <li key={pain} className="flex items-start gap-3 text-sm text-[#8B96A0]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F472B6]" />
                    {pain}
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual — two AI bubbles that can't see each other */}
            <div className="relative h-64 rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-[#11181C] overflow-hidden flex items-center justify-center gap-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-[rgba(244,114,182,0.3)] to-transparent absolute" />
              </div>

              {/* Session 1 */}
              <div className="flex flex-col items-center gap-3 z-10">
                <div className="rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-3 text-xs text-[#8B96A0] max-w-[140px] text-center">
                  "We use Prisma for all DB ops"
                </div>
                <div className="text-[10px] font-mono text-[#4B5563]">Session Monday</div>
              </div>

              {/* Fade symbol */}
              <div className="flex flex-col items-center gap-1 z-10">
                <span className="text-2xl text-[rgba(244,114,182,0.5)]">⟳</span>
                <span className="text-[10px] text-[#F472B6] font-mono">session end</span>
              </div>

              {/* Session 2 */}
              <div className="flex flex-col items-center gap-3 z-10">
                <div className="rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-3 text-xs text-[#8B96A0] max-w-[140px] text-center opacity-40">
                  "What ORM does this project use?"
                </div>
                <div className="text-[10px] font-mono text-[#4B5563]">Session Thursday</div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
