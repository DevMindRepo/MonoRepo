import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from '@mysten/sui/jsonRpc';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import { verifyPersonalMessageSignature } from '@mysten/sui/verify';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import { getEnv } from '../lib/env.js';

let cachedClient: SuiJsonRpcClient | null = null;
let cachedKeypair: Ed25519Keypair | null = null;

export function getSuiClient(): SuiJsonRpcClient {
  if (cachedClient) return cachedClient;
  const env = getEnv();
  cachedClient = new SuiJsonRpcClient({ url: getJsonRpcFullnodeUrl(env.SUI_NETWORK) });
  return cachedClient;
}

export function getMasterKeypair(): Ed25519Keypair {
  if (cachedKeypair) return cachedKeypair;
  const key = getEnv().SUI_MASTER_WALLET_KEY.trim();

  if (key.startsWith('suiprivkey1')) {
    const { secretKey } = decodeSuiPrivateKey(key);
    cachedKeypair = Ed25519Keypair.fromSecretKey(secretKey);
  } else {
    cachedKeypair = Ed25519Keypair.deriveKeypair(key);
  }
  return cachedKeypair;
}

export function getMasterAddress(): string {
  return getMasterKeypair().toSuiAddress();
}

/**
 * Verify a Sui wallet signature against a personal message.
 * Returns the signer address if valid, throws otherwise.
 */
export async function verifyWalletSignature(
  message: string,
  signature: string,
  expectedAddress: string,
): Promise<boolean> {
  try {
    const messageBytes = new TextEncoder().encode(message);
    const publicKey = await verifyPersonalMessageSignature(messageBytes, signature);
    return publicKey.toSuiAddress() === expectedAddress;
  } catch {
    return false;
  }
}

/**
 * Create a workspace on-chain. Returns the workspace object ID.
 */
export async function createWorkspaceOnChain(params: {
  name: string;
  walrusRoot: string;
}): Promise<{ workspaceId: string; txDigest: string }> {
  const env = getEnv();
  const client = getSuiClient();
  const keypair = getMasterKeypair();

  const tx = new Transaction();
  tx.moveCall({
    target: `${env.WORKSPACE_REGISTRY_PACKAGE_ID}::workspace::create_workspace`,
    arguments: [
      tx.pure.string(params.name),
      tx.pure.string(params.walrusRoot),
      tx.object('0x6'),
    ],
  });

  const result = await client.signAndExecuteTransaction({
    transaction: tx,
    signer: keypair,
    options: { showEffects: true, showEvents: true },
  });

  const created = result.effects?.created ?? [];
  const workspace = created.find((o) => o.owner !== 'Immutable' && typeof o.owner === 'object' && 'Shared' in o.owner);

  if (!workspace) throw new Error('Workspace object not created');

  return {
    workspaceId: workspace.reference.objectId,
    txDigest: result.digest,
  };
}

/**
 * Invite a member to a workspace on-chain.
 */
export async function inviteMemberOnChain(params: {
  workspaceObjectId: string;
  newMember: string;
}): Promise<string> {
  const env = getEnv();
  const client = getSuiClient();
  const keypair = getMasterKeypair();

  const tx = new Transaction();
  tx.moveCall({
    target: `${env.WORKSPACE_REGISTRY_PACKAGE_ID}::workspace::invite_member`,
    arguments: [
      tx.object(params.workspaceObjectId),
      tx.pure.address(params.newMember),
    ],
  });

  const result = await client.signAndExecuteTransaction({
    transaction: tx,
    signer: keypair,
    options: { showEffects: true },
  });

  return result.digest;
}

/**
 * Remove a member from workspace on-chain.
 */
export async function removeMemberOnChain(params: {
  workspaceObjectId: string;
  member: string;
}): Promise<string> {
  const env = getEnv();
  const client = getSuiClient();
  const keypair = getMasterKeypair();

  const tx = new Transaction();
  tx.moveCall({
    target: `${env.WORKSPACE_REGISTRY_PACKAGE_ID}::workspace::remove_member`,
    arguments: [
      tx.object(params.workspaceObjectId),
      tx.pure.address(params.member),
    ],
  });

  const result = await client.signAndExecuteTransaction({
    transaction: tx,
    signer: keypair,
    options: { showEffects: true },
  });

  return result.digest;
}

/**
 * Check if address is member of workspace by reading the on-chain object.
 */
export async function isMemberOnChain(workspaceObjectId: string, address: string): Promise<boolean> {
  const client = getSuiClient();
  const obj = await client.getObject({
    id: workspaceObjectId,
    options: { showContent: true },
  });

  const content = obj.data?.content;
  if (!content || content.dataType !== 'moveObject') return false;

  const fields = (content as { fields: Record<string, unknown> }).fields;
  const owner = fields.owner as string;
  const members = fields.members as { fields: { contents: string[] } } | undefined;

  if (owner === address) return true;
  const memberList = members?.fields.contents ?? [];
  return memberList.includes(address);
}
