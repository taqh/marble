export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  timezone: string | null;
  createdAt: Date | string;
  currentUserRole: string | null;
  members: Array<{
    id: string;
    role: string;
    organizationId: string;
    createdAt: Date | string;
    userId: string;
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
  }>;
  invitations?: Array<{
    id: string;
    email: string;
    role: string | null;
    status: string;
    organizationId: string;
    inviterId: string;
    expiresAt: Date | string;
  }>;
  subscription?: {
    id: string;
    status: string;
    plan: string;
    currentPeriodStart?: string | Date;
    currentPeriodEnd?: string | Date;
    cancelAtPeriodEnd?: boolean;
    canceledAt?: string | Date | null;
  } | null;
}

export type WorkspaceWithRole = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  createdAt: Date;
  userRole: string | null;
  subscription?: {
    id: string;
    status: string;
    plan: string;
  } | null;
};

export interface WorkspaceContextType {
  activeWorkspace: Workspace | null;
  updateActiveWorkspace: (
    workspaceSlug: string,
    newWorkspace?: Partial<Workspace>,
  ) => Promise<void>;
  workspaceList: WorkspaceWithRole[] | null;
  isFetchingWorkspace: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isMember: boolean;
  currentUserRole: string | null;
}

export interface WorkspaceProviderProps {
  children: React.ReactNode;
  initialWorkspace: Workspace | null;
}
