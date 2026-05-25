export interface SealConfig {
  packageId: string;
  suiClient: import('@mysten/sui/jsonRpc').SuiJsonRpcClient;
}

export interface EncryptResult {
  encryptedData: Uint8Array;
  encryptedKey: Uint8Array;
  id: string;
}
