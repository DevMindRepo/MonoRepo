import { SealClient as SealSDK, SessionKey } from '@mysten/seal';
import type { SealConfig, EncryptResult } from './types.js';

// Mysten Labs allowlisted Seal key servers for testnet.
// Update these if you switch to a different network or run your own servers.
const TESTNET_KEY_SERVER_IDS = [
  '0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75',
  '0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8',
];

export class SealClient {
  private sdk: SealSDK | null = null;
  private packageId: string;
  private suiClient: SealConfig['suiClient'];

  constructor(config: SealConfig) {
    this.packageId = config.packageId;
    this.suiClient = config.suiClient;
  }

  private getSdk(): SealSDK {
    if (this.sdk) return this.sdk;
    this.sdk = new SealSDK({
      suiClient: this.suiClient as never,
      serverConfigs: TESTNET_KEY_SERVER_IDS.map((objectId) => ({ objectId, weight: 1 })),
      verifyKeyServers: false,
    });
    return this.sdk;
  }

  async encrypt(data: Uint8Array, id: string): Promise<EncryptResult> {
    // Seal expects id as a hex string (no 0x prefix needed).
    const idHex = Buffer.from(id, 'utf-8').toString('hex');
    const { encryptedObject } = await this.getSdk().encrypt({
      threshold: 1,
      packageId: this.packageId,
      id: idHex,
      data,
    });
    return {
      encryptedData: encryptedObject,
      encryptedKey: new Uint8Array(0),
      id,
    };
  }

  async decrypt(encryptedData: Uint8Array, sessionKey: SessionKey): Promise<Uint8Array> {
    const decrypted = await this.getSdk().decrypt({
      data: encryptedData,
      sessionKey,
      txBytes: new Uint8Array(0),
    });
    return decrypted;
  }
}
