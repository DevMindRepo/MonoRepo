#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { getConfig } from './config.js';
import { registerSaveMemory } from './tools/save-memory.js';
import { registerGetMemory } from './tools/get-memory.js';
import { registerShareContext } from './tools/share-context.js';
import { registerSaveArtifact } from './tools/save-artifact.js';

async function main() {
  // Validate config early — fail fast if missing env vars
  const cfg = getConfig();

  const server = new McpServer({
    name: 'devmind',
    version: '0.0.1',
  });

  registerSaveMemory(server);
  registerGetMemory(server);
  registerShareContext(server);
  registerSaveArtifact(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  // stderr because stdout is reserved for MCP protocol on stdio
  console.error(`DevMind MCP server connected. Workspace: ${cfg.DEVMIND_WORKSPACE_ID}`);
}

main().catch((err) => {
  console.error('Fatal error in MCP server:', err);
  process.exit(1);
});
