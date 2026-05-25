import { Cpu, Search, Lock, HardDrive, Bot, GitBranch } from "lucide-react"

const FEATURES = [
  {
    icon: Cpu,
    title: "MCP Native",
    description: "Works with any MCP-compatible AI out of the box — Claude Code, Cursor, or your own client.",
    size: "lg",
  },
  {
    icon: Search,
    title: "Semantic Search",
    description: "pgvector under the hood. Recall by meaning, not exact keywords. \"what was our auth decision\" just works.",
    size: "sm",
  },
  {
    icon: Lock,
    title: "Encrypted by Default",
    description: "Seal SDK encrypts every memory before it touches Walrus. Your data, your keys.",
    size: "sm",
  },
  {
    icon: HardDrive,
    title: "Permanent Storage",
    description: "Walrus blob storage. Long-lived, renewable, decentralized. Not a SaaS silo.",
    size: "sm",
  },
  {
    icon: Bot,
    title: "Autonomous Agents",
    description: "PR Reviewer agent built on Mastra reads your memory and reviews code with full context of past decisions.",
    size: "lg",
  },
  {
    icon: GitBranch,
    title: "GitHub Native",
    description: "Webhook auto-extracts decisions from PR merges and commits. Memory grows without manual effort.",
    size: "sm",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6 border-t border-[rgba(255,255,255,0.04)]">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16 space-y-3">
          <p className="text-xs font-mono text-[#ADFF2F] uppercase tracking-widest">Features</p>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
            The full stack of memory.
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-[#11181C] p-6 hover:border-[rgba(255,255,255,0.1)] hover:bg-[#161D22] transition-all duration-300 space-y-4"
            >
              <Icon className="h-5 w-5 text-[rgba(255,255,255,0.5)]" />
              <h3 className="font-semibold text-[#E8EDF0]">{title}</h3>
              <p className="text-sm text-[#8B96A0] leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
