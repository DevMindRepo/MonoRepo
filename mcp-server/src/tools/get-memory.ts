import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getApiClient, formatApiError } from '../client.js';
import { getConfig } from '../config.js';

interface SearchResult {
  id: string;
  content: string;
  type: string;
  tags: string[];
  score: number;
  createdAt: string;
}

export function registerGetMemory(server: McpServer): void {
  server.registerTool(
    'get_memory',
    {
      title: 'Search Memory',
      description:
        'Semantic search across team memory. Returns past decisions, bug contexts, architectural choices, ' +
        'or notes that match your query. Use this BEFORE making decisions that might conflict with team history.',
      inputSchema: {
        query: z.string().min(1).describe('Natural language search query'),
        limit: z.number().int().min(1).max(20).default(5).describe('Max results to return'),
      },
    },
    async ({ query, limit }) => {
      const cfg = getConfig();
      const client = getApiClient();

      try {
        const res = await client.post('/memories/search', {
          workspaceId: cfg.DEVMIND_WORKSPACE_ID,
          query,
          limit,
        });

        const results = res.data.data as SearchResult[];

        if (results.length === 0) {
          return {
            content: [{ type: 'text', text: `No memories found matching "${query}"` }],
          };
        }

        const formatted = results
          .map((r, i) => {
            const date = new Date(r.createdAt).toISOString().slice(0, 10);
            const tags = r.tags.length > 0 ? ` [${r.tags.join(', ')}]` : '';
            return `${i + 1}. [${r.type}] ${r.content}\n   ${date}${tags} (score: ${r.score.toFixed(3)})`;
          })
          .join('\n\n');

        return {
          content: [{ type: 'text', text: `Found ${results.length} memories:\n\n${formatted}` }],
        };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Failed to search memory: ${formatApiError(err)}` }],
          isError: true,
        };
      }
    },
  );
}
