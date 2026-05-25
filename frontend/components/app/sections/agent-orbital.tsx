"use client"

import dynamic from "next/dynamic"
import { GitPullRequest, Brain, Search, FileText, Database, Lock, Link2 } from "lucide-react"
import { ScrollReveal } from "@/components/app/scroll-reveal"

const RadialOrbitalTimeline = dynamic(
  () => import("@/components/ui/radial-orbital-timeline"),
  { ssr: false }
)

const DEVMIND_FLOW = [
  {
    id: 1,
    title: "Trigger",
    date: "Step 1",
    content: "PR webhook received from GitHub. DevMind agent instantiated with workspace context.",
    category: "Event",
    icon: GitPullRequest,
    relatedIds: [2, 7],
    status: "completed" as const,
    energy: 100,
  },
  {
    id: 2,
    title: "Recall",
    date: "Step 2",
    content: "Semantic search retrieves relevant memories — decisions, patterns, and prior bugs — from Walrus.",
    category: "Memory",
    icon: Brain,
    relatedIds: [1, 3],
    status: "completed" as const,
    energy: 85,
  },
  {
    id: 3,
    title: "Analyze",
    date: "Step 3",
    content: "Code diff analyzed against recalled context. Inconsistencies and regressions flagged automatically.",
    category: "Analysis",
    icon: Search,
    relatedIds: [2, 4],
    status: "completed" as const,
    energy: 72,
  },
  {
    id: 4,
    title: "Review",
    date: "Step 4",
    content: "Team-aware review generated. Comments reference actual past decisions, not generic patterns.",
    category: "Output",
    icon: FileText,
    relatedIds: [3, 5],
    status: "in-progress" as const,
    energy: 55,
  },
  {
    id: 5,
    title: "Save",
    date: "Step 5",
    content: "New patterns discovered in this PR queued for team approval before persistence.",
    category: "Memory",
    icon: Database,
    relatedIds: [4, 6],
    status: "pending" as const,
    energy: 35,
  },
  {
    id: 6,
    title: "Encrypt",
    date: "Step 6",
    content: "Approved memories encrypted with Seal client-side before upload to Walrus testnet.",
    category: "Storage",
    icon: Lock,
    relatedIds: [5, 7],
    status: "pending" as const,
    energy: 20,
  },
  {
    id: 7,
    title: "Anchor",
    date: "Step 7",
    content: "Walrus blob ID and Seal access policy anchored to Sui smart contract on-chain.",
    category: "Chain",
    icon: Link2,
    relatedIds: [6, 1],
    status: "pending" as const,
    energy: 10,
  },
]

export function AgentOrbitalSection() {
  return (
    <section className="relative" id="agent-workflow">
      <ScrollReveal>
        <div className="text-center pt-20 pb-6 px-4">
          <p className="text-xs font-mono text-[#ADFF2F] tracking-[0.2em] uppercase mb-3">
            Autonomous workflow
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#E8EDF0]">
            Every PR. Every commit.{" "}
            <span className="gradient-text-mint">Remembered.</span>
          </h2>
          <p className="mt-3 text-sm text-[#8B96A0] max-w-md mx-auto">
            Click any node to explore the step. Related nodes light up automatically.
          </p>
        </div>
      </ScrollReveal>

      <RadialOrbitalTimeline timelineData={DEVMIND_FLOW} />
    </section>
  )
}
