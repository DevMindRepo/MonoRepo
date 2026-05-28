# devmind-mcp-server

> MCP server for **DevMind** — persistent memory for AI coding assistants (Claude Code, Cursor) backed by Walrus + MemWal + Seal on Sui.

Once installed, Claude Code / Cursor / any MCP-compatible client can:
- **`save_memory`** — push a decision, bug, arch note, or general note into your team's shared memory queue (awaits human approval, then encrypted + uploaded to Walrus via MemWal).
- **`get_memory`** — semantic search across your team's approved memories.
- **`share_context`** — push context directly to another workspace member.
- **`save_artifact`** — store a file (dataset, log, report) to Walrus.

Memories survive across sessions, tools, and team members. The PR Reviewer Agent reads them autonomously to flag PRs that violate past decisions.

## Install

```bash
npm install -g devmind-mcp-server
```

That installs the `devmind-mcp` binary globally.

## Setup

You need:
1. A DevMind workspace (create one at https://devmind.app or your self-hosted dashboard)
2. An API token (`dm_sk_*`) from the `/connect` page

### Claude Code

Add to `~/.claude.json`:

```json
{
  "mcpServers": {
    "devmind": {
      "command": "devmind-mcp",
      "env": {
        "DEVMIND_API_BASE_URL": "https://api.devmind.app",
        "DEVMIND_API_TOKEN": "dm_sk_xxxxx",
        "DEVMIND_WORKSPACE_ID": "cmpxxxxxxxxxx"
      }
    }
  }
}
```

Restart Claude Code. Verify with `/mcp` — you should see `devmind` connected.

### Cursor

Add to `.cursor/mcp.json` in your project root (same shape as above).

### Custom MCP client

```typescript
const client = new McpClient({ transport: "stdio" })
await client.connect({
  command: "devmind-mcp",
  env: {
    DEVMIND_API_BASE_URL: "https://api.devmind.app",
    DEVMIND_API_TOKEN: "dm_sk_xxxxx",
    DEVMIND_WORKSPACE_ID: "cmpxxxxxxxxxx",
  },
})
```

## Environment Variables

| Var | Required | Description |
|---|---|---|
| `DEVMIND_API_BASE_URL` | yes | DevMind backend URL (e.g. `https://api.devmind.app`) |
| `DEVMIND_API_TOKEN` | yes | API token `dm_sk_*` — generate at `/connect` page |
| `DEVMIND_WORKSPACE_ID` | yes | Workspace ID this MCP client should save/recall against |

## Self-hosting the backend

The MCP server only speaks to a DevMind backend. If you self-host the backend (Fastify + Postgres + Walrus testnet), point `DEVMIND_API_BASE_URL` at your instance.

See https://github.com/DevMindRepo/MonoRepo for the full stack (backend, frontend, smart contracts, PR Reviewer Agent).

## License

MIT
