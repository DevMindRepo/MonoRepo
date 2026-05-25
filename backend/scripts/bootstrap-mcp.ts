/**
 * Dev bootstrap script — generates JWT + creates workspace for MCP testing.
 *
 * Uses SUI_MASTER_WALLET_KEY from .env to sign the auth challenge.
 *
 * Usage (from backend folder):
 *   pnpm bootstrap-mcp
 */
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import { getEnv } from '../src/lib/env.js';

function loadKeypair(): Ed25519Keypair {
  const key = getEnv().SUI_MASTER_WALLET_KEY.trim();
  if (key.startsWith('suiprivkey1')) {
    const { secretKey } = decodeSuiPrivateKey(key);
    return Ed25519Keypair.fromSecretKey(secretKey);
  }
  return Ed25519Keypair.deriveKeypair(key);
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function api<T>(
  baseUrl: string,
  path: string,
  method: 'GET' | 'POST',
  body?: unknown,
  token?: string,
): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = (await res.json()) as ApiResponse<T>;
  if (!res.ok || !json.success) {
    throw new Error(`[${res.status}] ${json.error ?? 'Unknown error'}`);
  }
  return json.data as T;
}

async function main() {
  const baseUrl = `http://localhost:${getEnv().PORT}`;
  const keypair = loadKeypair();
  const suiAddress = keypair.toSuiAddress();

  console.log(`Sui address: ${suiAddress}`);
  console.log(`Backend: ${baseUrl}\n`);

  // 1) Challenge
  console.log('[1/3] Requesting auth challenge...');
  const challenge = await api<{ message: string }>(baseUrl, '/auth/challenge', 'POST', { suiAddress });
  console.log(`  Challenge received (${challenge.message.length} chars)\n`);

  // 2) Sign + verify
  console.log('[2/3] Signing & verifying...');
  const messageBytes = new TextEncoder().encode(challenge.message);
  const { signature } = await keypair.signPersonalMessage(messageBytes);

  const verify = await api<{ token: string; user: { id: string } }>(
    baseUrl,
    '/auth/verify',
    'POST',
    { suiAddress, signature, displayName: 'DevMind Bootstrap' },
  );
  console.log(`  JWT received (user: ${verify.user.id})\n`);

  // 3) Workspace
  console.log('[3/3] Checking/creating workspace...');
  const list = await api<Array<{ id: string; name: string }>>(
    baseUrl,
    '/workspaces',
    'GET',
    undefined,
    verify.token,
  );

  let workspace: { id: string; name: string };
  if (list.length > 0) {
    workspace = list[0];
    console.log(`  Using existing workspace: ${workspace.name} (${workspace.id})`);
  } else {
    workspace = await api<{ id: string; name: string; txDigest?: string }>(
      baseUrl,
      '/workspaces',
      'POST',
      { name: 'DevMind Dev' },
      verify.token,
    );
    console.log(`  Created new workspace: ${workspace.name} (${workspace.id})`);
  }

  const claudeConfig = {
    devmind: {
      command: 'node',
      args: ['E:/devmind/mcp-server/dist/index.js'],
      env: {
        DEVMIND_API_BASE_URL: baseUrl,
        DEVMIND_API_TOKEN: verify.token,
        DEVMIND_WORKSPACE_ID: workspace.id,
      },
    },
  };

  console.log('\n' + '═'.repeat(72));
  console.log('READY — paste into ~/.claude.json under "mcpServers":');
  console.log('═'.repeat(72));
  console.log(JSON.stringify(claudeConfig, null, 2));
  console.log('═'.repeat(72));
  console.log('\nOR test with MCP Inspector:\n');
  console.log(`  set DEVMIND_API_BASE_URL=${baseUrl}`);
  console.log(`  set DEVMIND_API_TOKEN=${verify.token}`);
  console.log(`  set DEVMIND_WORKSPACE_ID=${workspace.id}`);
  console.log(`  npx @modelcontextprotocol/inspector node E:/devmind/mcp-server/dist/index.js`);
}

main().catch((err) => {
  console.error('Fatal:', err instanceof Error ? err.message : err);
  process.exit(1);
});
