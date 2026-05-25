import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getApiClient, formatApiError } from '../client.js';

export function registerShareContext(server: McpServer): void {
  server.registerTool(
    'share_context',
    {
      title: 'Share Context',
      description:
        'Push the current conversation context to another workspace (cross-team handoff). ' +
        'The context becomes a memory in the target workspace, subject to their approval.',
      inputSchema: {
        context: z.string().min(1).describe('Context summary to share (what you/AI are working on)'),
        target_workspace: z.string().min(1).describe('Target workspace ID to share with'),
      },
    },
    async ({ context, target_workspace }) => {
      const client = getApiClient();

      try {
        const res = await client.post('/memories', {
          workspaceId: target_workspace,
          content: context,
          type: 'note',
          privacy: 'team',
          tags: ['shared-context', 'handoff'],
        });

        const data = res.data.data as { pendingId: string };

        return {
          content: [
            {
              type: 'text',
              text: `✓ Context shared to workspace ${target_workspace}\nPending ID: ${data.pendingId}`,
            },
          ],
        };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Failed to share context: ${formatApiError(err)}` }],
          isError: true,
        };
      }
    },
  );
}
