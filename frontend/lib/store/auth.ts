"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export interface AuthUser {
  id: string
  suiAddress: string
  displayName: string | null
}

export interface ActiveWorkspace {
  id: string
  name: string
  suiObjectId?: string | null
}

interface AuthState {
  token: string | null
  user: AuthUser | null
  workspace: ActiveWorkspace | null
  hasHydrated: boolean

  setSession: (token: string, user: AuthUser) => void
  setWorkspace: (workspace: ActiveWorkspace) => void
  clear: () => void
  setHasHydrated: (v: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      workspace: null,
      hasHydrated: false,

      setSession: (token, user) => set({ token, user }),
      setWorkspace: (workspace) => set({ workspace }),
      clear: () => set({ token: null, user: null, workspace: null }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: "devmind-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ token: s.token, user: s.user, workspace: s.workspace }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)

export function getAuthToken(): string | null {
  return useAuthStore.getState().token
}

export function getActiveWorkspaceId(): string | null {
  return useAuthStore.getState().workspace?.id ?? null
}
