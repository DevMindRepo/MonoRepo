"use client"

import { authApi } from "./api-endpoints"
import { useAuthStore } from "./store/auth"

export interface SignAndLoginParams {
  suiAddress: string
  signPersonalMessage: (args: { message: Uint8Array }) => Promise<{ signature: string }>
  displayName?: string
}

/**
 * Full login flow:
 *   1. Request challenge from backend
 *   2. Ask wallet to sign it
 *   3. Verify signature → receive JWT
 *   4. Persist session in zustand store
 */
export async function signAndLogin({
  suiAddress,
  signPersonalMessage,
  displayName,
}: SignAndLoginParams) {
  const { message } = await authApi.requestChallenge(suiAddress)

  const messageBytes = new TextEncoder().encode(message)
  const { signature } = await signPersonalMessage({ message: messageBytes })

  const verify = await authApi.verify(suiAddress, signature, displayName)

  useAuthStore.getState().setSession(verify.token, verify.user)
  return verify
}

export function logout() {
  useAuthStore.getState().clear()
}
