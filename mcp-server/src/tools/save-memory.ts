import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getApiClient, formatApiError } from '../client.js';
import { getConfig } from '../config.js';

export function registerSaveMemory(server: McpServer): void {
  server.registerTool(
    'save_memory',
    {
      title: 'Save Memory',
      description:
        'Save a decision, architectural choice, bug context, or note to DevMind. ' +
        'Content goes to a pending queue and requires user approval via dashboard before being permanently stored on Walrus.',
      inputSchema: {
        content: z.string().min(1).describe('The memory content (1-3 sentences, action-oriented)'),
        type: z
          .enum(['decision', 'bug', 'arch', 'note'])
          .describe('Memory category: decision | bug | arch | note'),
        privacy: z
          .enum(['private', 'team', 'public'])
          .default('team')
          .describe('Who can access: private (just you) | team (workspace members) | public'),
        tags: z.array(z.string()).default([]).describe('Optional tags for categorization'),
      },
    },
    async ({ content, type, privacy, tags }) => {
      const cfg = getConfig();
      const client = getApiClient();

      try {
        const res = await client.post('/memories', {
          workspaceId: cfg.DEVMIND_WORKSPACE_ID,
          content,
          type,
          privacy,
          tags,
        });

        const data = res.data.data as { pendingId: string; secretFlags: string[] };

        const lines = [
          `✓ Memory queued for approval`,
          `Pending ID: ${data.pendingId}`,
          `Status: awaiting user approval at dashboard`,
        ];
        if (data.secretFlags.length > 0) {
          lines.push(`⚠ Potential secrets detected: ${data.secretFlags.join(', ')}`);
        }

        return {
          content: [{ type: 'text', text: lines.join('\n') }],
        };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Failed to save memory: ${formatApiError(err)}` }],
          isError: true,
        };
      }
    },
  );
}
