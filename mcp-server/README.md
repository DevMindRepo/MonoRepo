# DevMind MCP Server

MCP (Model Context Protocol) server that exposes DevMind memory to AI coding assistants like Claude Code, Cursor, or any MCP-compatible client.

## Tools Provided

| Tool | Purpose |
|---|---|
| `save_memory` | Save a decision/bug/arch/note to DevMind pending queue (user approves later) |
| `get_memory` | Semantic search across workspace memory (returns ranked matches) |
| `share_context` | Push current context to another workspace (handoff) |
| `save_artifact` | Persist binary file (report, log, dataset) to Walrus |

## Prerequisites

1. **Backend running** at `http://localhost:3001` (or remote URL)
2. **Workspace exists** in DevMind — get the workspace ID from dashboard
3. **JWT token** — login via dashboard, copy token from `localStorage.devmind_token` or from `/auth/verify` response

## Build

```cmd
cd E:\devmind\mcp-server
pnpm build
```

Output goes to `dist/index.js`.

## Configure Claude Code

Edit `~/.claude.json` (Windows: `C:\Users\<you>\.claude.json`) — add `devmind` to `mcpServers`:

```json
{
  "mcpServers": {
    "devmind": {
      "command": "node",
      "args": ["E:/devmind/mcp-server/dist/index.js"],
      "env": {
        "DEVMIND_API_BASE_URL": "http://localhost:3001",
        "DEVMIND_API_TOKEN": "eyJhbGciOi...",
        "DEVMIND_WORKSPACE_ID": "cuid_workspace_id_here"
      }
    }
  }
}
```

Then restart Claude Code. The 4 DevMind tools will be available.

## Configure Cursor

Add to Cursor settings (Settings → MCP → Add new MCP server):

- **Name**: `devmind`
- **Command**: `node E:/devmind/mcp-server/dist/index.js`
- **Env vars**: same as Claude Code config above

## Quick Test (without Claude Code)

You can test the server manually with `npx @modelcontextprotocol/inspector`:

```cmd
set DEVMIND_API_BASE_URL=http://localhost:3001
set DEVMIND_API_TOKEN=eyJ...
set DEVMIND_WORKSPACE_ID=...
npx @modelcontextprotocol/inspector node dist/index.js
```

This opens a UI where you can manually invoke each tool to verify it works.

## Getting Your JWT Token

For now (Phase 1), get token by calling backend directly:

1. Call `POST /auth/challenge` with your Sui address — get challenge message
2. Sign message with Sui wallet (use dapp-kit or sui CLI)
3. Call `POST /auth/verify` with signature — receive JWT
4. Copy `data.token` from response

Later (Phase 2), dashboard will have a "Generate API Token" button for long-lived tokens.

## Architecture

```
Claude Code (or any MCP client)
        │ stdio (JSON-RPC over stdin/stdout)
        ▼
DevMind MCP Server (this package)
        │ HTTPS + Bearer JWT
        ▼
DevMind Backend (Fastify) → Sui / Walrus / Seal / Postgres
```
