"use client"
import { CodePill } from "@/components/ui/code-pill"
import { ScrollReveal } from "@/components/app/scroll-reveal"

const MCP_CONFIG = `// ~/.claude.json
{
  "mcpServers": {
    "devmind": {
      "command": "devmind",
      "env": {
        "DEVMIND_WORKSPACE": "your-workspace-id"
      }
    }
  }
}`

const TOOL_CALL = `// Claude Code now has memory
await mcp.call('save_memory', {
  content: 'Use Prisma for all DB access. Raw SQL only for analytics queries.',
  type: 'decision',
  privacy: 'team',
  tags: ['database', 'orm']
})
// → { pending_id: 'mem_abc123', status: 'pending_approval' }

// Later, in any session or tool
await mcp.call('get_memory', {
  query: 'what ORM do we use'
})
// → { content: 'Use Prisma for all DB access...', blobId: '7xK2...' }`

export function CodeSection() {
  return (
    <section className="py-16 md:py-24 px-4 md:px-6 border-t border-[rgba(255,255,255,0.04)]">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-xs font-mono text-[#ADFF2F] uppercase tracking-widest">Integration</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">Two lines to get started.</h2>
              <p className="text-[#8B96A0] leading-relaxed">
                Install, add to your MCP config, and your AI tools have persistent memory. No
                refactoring. No SDK to learn.
              </p>
              <div className="space-y-2">
                <CodePill code="npm create devmind" />
                <p className="text-xs text-[#4B5563] font-mono pl-1">then add to ~/.claude.json</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-[#0D1317] overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[rgba(255,255,255,0.06)]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[rgba(248,113,113,0.6)]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[rgba(251,191,36,0.6)]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[rgba(173,255,47,0.6)]" />
                  <span className="ml-2 text-[10px] font-mono text-[#4B5563]">~/.claude.json</span>
                </div>
                <pre className="p-4 text-xs font-mono text-[#8B96A0] leading-relaxed overflow-x-auto">
                  <code>
                    {MCP_CONFIG.split('\n').map((line, i) => (
                      <span key={i}>
                        {line.includes('"devmind"') || line.includes('"mcpServers"')
                          ? <span className="text-[#ADFF2F]">{line}</span>
                          : line.includes('//') ? <span className="text-[#4B5563]">{line}</span>
                          : line}
                        {'\n'}
                      </span>
                    ))}
                  </code>
                </pre>
              </div>

              <div className="rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-[#0D1317] overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[rgba(255,255,255,0.06)]">
                  <span className="ml-2 text-[10px] font-mono text-[#4B5563]">MCP tool calls</span>
                </div>
                <pre className="p-4 text-xs font-mono text-[#8B96A0] leading-relaxed overflow-x-auto">
                  <code>
                    {TOOL_CALL.split('\n').map((line, i) => (
                      <span key={i}>
                        {line.startsWith('//') ? <span className="text-[#4B5563]">{line}</span>
                          : line.includes('save_memory') || line.includes('get_memory') ? <span className="text-[#ADFF2F]">{line}</span>
                          : line.includes('→') ? <span className="text-[#FBBF24]">{line}</span>
                          : line}
                        {'\n'}
                      </span>
                    ))}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
