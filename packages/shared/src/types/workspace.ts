export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  suiObjectId?: string;
  walrusRoot?: string;
  createdAt: Date;
}

export interface WorkspaceMember {
  workspaceId: string;
  userId: string;
  role: 'owner' | 'member';
  joinedAt: Date;
}

export interface User {
  id: string;
  suiAddress: string;
  displayName?: string;
  createdAt: Date;
}
