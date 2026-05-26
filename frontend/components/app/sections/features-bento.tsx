"use client"
import type { ReactNode } from "react"
import { Lock, Database, Bot, Plug, CheckCircle } from "lucide-react"
import { ScrollReveal } from "@/components/app/scroll-reveal"

const ICON_CARDS = [
  {
    id: "memory",
    label: "Memory",
    isActive: true,
  },
  {
    id: "seal",
    icon: Lock,
    isActive: false,
  },
  {
    id: "walrus",
    icon: Database,
    isActive: false,
  },
  {
    id: "agent",
    icon: Bot,
    isActive: false,
  },
  {
    id: "mcp",
    icon: Plug,
    isActive: false,
  },
  {
    id: "approval",
    icon: CheckCircle,
    isActive: false,
  },
]

function CodeLine({
  children,
  showDot = true,
}: {
  children: ReactNode
  showDot?: boolean
}) {
  return (
    <div className="flex items-start mb-2">
      {showDot ? (
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[rgba(255,255,255,0.18)] mr-3 flex-shrink-0 mt-[5px]" />
      ) : (
        <span className="inline-block w-1.5 h-1.5 mr-3 flex-shrink-0 mt-[5px]" />
      )}
      <span className="font-mono text-[11px] leading-relaxed">{children}</span>
    </div>
  )
}

function K({ children }: { children: ReactNode }) {
  return <span className="text-[#C084FC]">{children}</span>
}

function S({ children }: { children: ReactNode }) {
  return <span className="text-[#86EFAC]">{children}</span>
}

function T({ children }: { children: ReactNode }) {
  return <span className="text-[#ADFF2F]">{children}</span>
}

function P({ children }: { children: ReactNode }) {
  return <span className="text-[#93C5FD]">{children}</span>
}

function C({ children }: { children: ReactNode }) {
  return <span className="text-[rgba(255,255,255,0.3)]">{children}</span>
}

function D({ children }: { children: ReactNode }) {
  return <span className="text-[rgba(255,255,255,0.7)]">{children}</span>
}

function LeftCard() {
  return (
    <div className="col-span-1 md:col-span-2 bg-[#0F1214] border border-[rgba(255,255,255,0.07)] rounded-[16px] overflow-hidden flex flex-col">
      <div className="bg-[#0A0D10] p-5 flex-1">
        <CodeLine>
          <K>import</K>
          <D> {"{ "}</D>
          <T>DevMind</T>
          <D>{" }"}</D>
          <K> from </K>
          <S>"devmind"</S>
        </CodeLine>
        <CodeLine>
          <K>import</K>
          <D> {"{ "}</D>
          <T>SealClient</T>
          <D>{" }"}</D>
          <K> from </K>
          <S>"@mysten/seal"</S>
        </CodeLine>
        <CodeLine showDot={false}>
          <D>&nbsp;</D>
        </CodeLine>
        <CodeLine>
          <K>const </K>
          <D>memory </D>
          <D>= </D>
          <K>await </K>
          <T>devmind</T>
          <D>.save({"{"}</D>
        </CodeLine>
        <CodeLine>
          <D>&nbsp;&nbsp;</D>
          <P>content</P>
          <D>{": "}</D>
          <S>"JWT chosen for auth"</S>
          <D>,</D>
        </CodeLine>
        <CodeLine>
          <D>&nbsp;&nbsp;</D>
          <P>type</P>
          <D>{": "}</D>
          <S>"decision"</S>
          <D>,</D>
        </CodeLine>
        <CodeLine>
          <D>&nbsp;&nbsp;</D>
          <P>tags</P>
          <D>{": ["}</D>
          <S>"auth"</S>
          <D>{", "}</D>
          <S>"security"</S>
          <D>{"],"}</D>
        </CodeLine>
        <CodeLine>
          <D>{"}"}</D>
          <D>)</D>
        </CodeLine>
        <CodeLine showDot={false}>
          <D>&nbsp;</D>
        </CodeLine>
        <CodeLine>
          <C>{"// encrypted + stored on Walrus"}</C>
        </CodeLine>
        <CodeLine>
          <D>memory.</D>
          <T>blobId</T>
          <D>{" "}</D>
          <C>{"// → "}</C>
          <S>"8xKp3...mN9q"</S>
        </CodeLine>
      </div>
      <div className="p-5 border-t border-[rgba(255,255,255,0.05)]">
        <p className="text-base font-bold text-[#E8EDF0]">Build memory tools in minutes</p>
        <p className="text-sm text-[rgba(255,255,255,0.45)] mt-1">
          Write once, persist forever — encrypted on Walrus, anchored on Sui.
        </p>
      </div>
    </div>
  )
}

function RightCard() {
  return (
    <div className="col-span-1 md:col-span-3 bg-[#0F1214] border border-[rgba(255,255,255,0.07)] rounded-[16px] overflow-hidden flex flex-col">
      <div className="bg-[#0A0D10] flex-1 p-3 overflow-hidden">
        <div className="bg-[#0F1214] rounded-[10px] h-full overflow-hidden border border-[rgba(255,255,255,0.06)] flex flex-col">
          {/* Topbar */}
          <div className="bg-[#161D22] px-3 py-2 flex items-center gap-2 border-b border-[rgba(255,255,255,0.04)] flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#F87171] inline-block" />
            <span className="w-2 h-2 rounded-full bg-[#FBBF24] inline-block" />
            <span className="w-2 h-2 rounded-full bg-[#ADFF2F] inline-block" />
            <span className="text-[rgba(255,255,255,0.4)] text-[10px] font-mono ml-2">
              DevMind — Approval Queue
            </span>
          </div>

          {/* Content area */}
          <div className="px-3 py-2 space-y-2 flex-1">
            {/* Row 1 */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F472B6] flex-shrink-0" />
              <span className="text-[10px] font-mono text-[rgba(255,255,255,0.7)] flex-1">
                decision — JWT for auth · 2h ago
              </span>
              <span className="text-[8px] px-2 py-0.5 rounded bg-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.55)] border border-[rgba(255,255,255,0.08)]">
                Approve
              </span>
            </div>

            {/* Row 2 — active/highlighted */}
            <div className="flex items-center gap-2 bg-[rgba(255,255,255,0.03)] rounded px-2 py-0.5">
              <span className="w-2 h-2 rounded-full bg-[#F472B6] flex-shrink-0" />
              <span className="text-[10px] font-mono text-[rgba(255,255,255,0.7)] flex-1">
                arch — Walrus blob expiry · 1h ago
              </span>
              <span className="text-[8px] px-2 py-0.5 rounded bg-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.55)] border border-[rgba(255,255,255,0.08)]">
                Approve
              </span>
            </div>

            {/* Row 3 */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F472B6] flex-shrink-0" />
              <span className="text-[10px] font-mono text-[rgba(255,255,255,0.7)] flex-1">
                bug — race condition in upload · 30m ago
              </span>
              <span className="text-[8px] px-2 py-0.5 rounded bg-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.55)] border border-[rgba(255,255,255,0.08)]">
                Approve
              </span>
            </div>

            {/* Divider */}
            <div className="h-px bg-[rgba(255,255,255,0.04)] my-2" />

            {/* Footer */}
            <div className="text-[9px] text-[rgba(255,255,255,0.25)] font-mono">
              3 pending · encrypted with Seal before upload
            </div>
          </div>
        </div>
      </div>
      <div className="p-5 border-t border-[rgba(255,255,255,0.05)]">
        <p className="text-base font-bold text-[#E8EDF0]">Your team&apos;s memory dashboard</p>
        <p className="text-sm text-[rgba(255,255,255,0.45)] mt-1">
          Browse, approve, and manage AI memories across your team.
        </p>
      </div>
    </div>
  )
}

export function FeaturesBentoSection() {
  return (
    <section id="features" className="py-16 bg-[#070B0E]">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        {/* Icon row */}
        <ScrollReveal>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
            {ICON_CARDS.map((card, index) => {
              if (card.isActive) {
                return (
                  <div
                    key={card.id}
                    className="border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.03)] rounded-[14px] flex flex-col items-center justify-center gap-2 p-4 h-20"
                  >
                    <span className="text-[rgba(255,255,255,0.8)] text-xs font-mono">{card.label}</span>
                  </div>
                )
              }

              const Icon = card.icon!
              return (
                <div
                  key={card.id}
                  className="bg-[#111111] border border-[rgba(255,255,255,0.07)] rounded-[14px] flex flex-col items-center justify-center gap-2 p-4 h-20"
                >
                  <Icon size={22} className="text-[rgba(255,255,255,0.5)]" />
                </div>
              )
            })}
          </div>
        </ScrollReveal>

        {/* Two bento cards */}
        <ScrollReveal delay={90}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <LeftCard />
            <RightCard />
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
