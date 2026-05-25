import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getApiClient, formatApiError } from '../client.js';
import { getConfig } from '../config.js';

export function registerSaveArtifact(server: McpServer): void {
  server.registerTool(
    'save_artifact',
    {
      title: 'Save Artifact',
      description:
        'Save a binary file artifact (dataset, log file, report, generated output) to Walrus storage. ' +
        'Useful for persisting AI-generated reports, drift analyses, error dumps, or any file an agent should recall later.',
      inputSchema: {
        filename: z.string().min(1).max(255).describe('Filename including extension'),
        content_base64: z.string().min(1).describe('File content encoded as base64'),
        type: z
          .enum(['dataset', 'log', 'report', 'output'])
          .describe('Artifact category'),
        related_memory_id: z
          .string()
          .optional()
          .describe('Optional memory ID this artifact relates to'),
      },
    },
    async ({ filename, content_base64, type, related_memory_id }) => {
      const cfg = getConfig();
      const client = getApiClient();

      try {
        const res = await client.post('/artifacts', {
          workspaceId: cfg.DEVMIND_WORKSPACE_ID,
          filename,
          contentBase64: content_base64,
          type,
          relatedMemoryId: related_memory_id,
        });

        const data = res.data.data as { artifactId: string; walrusBlobId: string };

        return {
          content: [
            {
              type: 'text',
              text:
                `✓ Artifact saved to Walrus\n` +
                `Artifact ID: ${data.artifactId}\n` +
                `Walrus Blob ID: ${data.walrusBlobId}\n` +
                `Filename: ${filename}`,
            },
          ],
        };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Failed to save artifact: ${formatApiError(err)}` }],
          isError: true,
        };
      }
    },
  );
}
