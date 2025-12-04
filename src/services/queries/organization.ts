import { useMutation, useQuery, useQueryClient } from 'react-query';
import { isFrontendOnlyMode } from '@/services/api/client';
import {
  Organization,
  Team,
  OrganizationMember,
  Invitation,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  CreateTeamRequest,
  UpdateTeamRequest,
  InviteMemberRequest,
  UpdateMemberRequest,
  PaginatedResponse,
} from '@/types/organization';
import { Role, DEFAULT_PERMISSIONS } from '@/types/permissions';
import { useOrganizationStore } from '@/store/organizationStore';

// ============================================
// MOCK DATA GENERATORS
// ============================================

const generateId = () => Math.random().toString(36).substring(2, 11);

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Default roles for new organizations
const createDefaultRoles = (orgId: string): Role[] => [
  {
    id: `role_owner_${orgId}`,
    name: 'Owner',
    description: 'Full access to all features and settings',
    permissions: DEFAULT_PERMISSIONS.owner,
    is_default: false,
    is_system: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: `role_admin_${orgId}`,
    name: 'Admin',
    description: 'Full access except billing and organization deletion',
    permissions: DEFAULT_PERMISSIONS.admin,
    is_default: false,
    is_system: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: `role_manager_${orgId}`,
    name: 'Manager',
    description: 'Can manage team data and export reports',
    permissions: DEFAULT_PERMISSIONS.manager,
    is_default: false,
    is_system: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: `role_member_${orgId}`,
    name: 'Member',
    description: 'Can view and edit assigned records',
    permissions: DEFAULT_PERMISSIONS.member,
    is_default: true,
    is_system: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: `role_viewer_${orgId}`,
    name: 'Viewer',
    description: 'Read-only access to data',
    permissions: DEFAULT_PERMISSIONS.viewer,
    is_default: false,
    is_system: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Mock organization storage (simulates backend)
let mockOrganizations: Organization[] = [];
let mockTeams: Team[] = [];
let mockMembers: OrganizationMember[] = [];
let mockRoles: Role[] = [];
let mockInvitations: Invitation[] = [];

// Initialize mock data from localStorage
const initMockData = () => {
  if (typeof window !== 'undefined') {
    try {
      const orgs = localStorage.getItem('mock_organizations');
      const teams = localStorage.getItem('mock_teams');
      const members = localStorage.getItem('mock_members');
      const roles = localStorage.getItem('mock_roles');
      const invitations = localStorage.getItem('mock_invitations');

      if (orgs) mockOrganizations = JSON.parse(orgs);
      if (teams) mockTeams = JSON.parse(teams);
      if (members) mockMembers = JSON.parse(members);
      if (roles) mockRoles = JSON.parse(roles);
      if (invitations) mockInvitations = JSON.parse(invitations);
    } catch (e) {
      console.error('Error loading mock data:', e);
    }
  }
};

// Save mock data to localStorage
const saveMockData = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mock_organizations', JSON.stringify(mockOrganizations));
    localStorage.setItem('mock_teams', JSON.stringify(mockTeams));
    localStorage.setItem('mock_members', JSON.stringify(mockMembers));
    localStorage.setItem('mock_roles', JSON.stringify(mockRoles));
    localStorage.setItem('mock_invitations', JSON.stringify(mockInvitations));
  }
};

// Initialize on module load
initMockData();

// ============================================
// ORGANIZATION QUERIES
// ============================================

export const useOrganizationsQuery = () => {
  return useQuery<Organization[]>(
    ['organizations'],
    async () => {
      await delay(300);

      if (isFrontendOnlyMode) {
        initMockData();
        return mockOrganizations;
      }

      // TODO: Replace with actual API call
      return mockOrganizations;
    },
    {
      staleTime: 5 * 60 * 1000,
    }
  );
};

export const useOrganizationQuery = (orgId: string) => {
  return useQuery<Organization | null>(
    ['organization', orgId],
    async () => {
      await delay(200);

      if (isFrontendOnlyMode) {
        initMockData();
        return mockOrganizations.find((o) => o.id === orgId) || null;
      }

      // TODO: Replace with actual API call
      return mockOrganizations.find((o) => o.id === orgId) || null;
    },
    {
      enabled: !!orgId,
      staleTime: 5 * 60 * 1000,
    }
  );
};

export const useCreateOrganizationMutation = () => {
  const queryClient = useQueryClient();
  const { setCurrentOrganization, setHasCompletedOnboarding, addOrganization, setRoles } =
    useOrganizationStore();

  return useMutation<Organization, Error, CreateOrganizationRequest>(
    async (data) => {
      await delay(500);

      const userId = localStorage.getItem('user_data')
        ? JSON.parse(localStorage.getItem('user_data')!).id
        : 'user_1';

      const newOrg: Organization = {
        id: `org_${generateId()}`,
        name: data.name,
        slug: data.name.toLowerCase().replace(/\s+/g, '-'),
        industry: data.industry,
        size: data.size,
        website: data.website,
        owner_id: userId,
        settings: {
          default_role_id: '',
          allow_member_invites: true,
          require_two_factor: false,
          timezone: 'UTC',
          date_format: 'MM/DD/YYYY',
          currency: 'USD',
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Create default roles
      const roles = createDefaultRoles(newOrg.id);
      newOrg.settings.default_role_id = roles.find((r) => r.is_default)?.id || roles[3].id;

      // Create owner as first member
      const userData = localStorage.getItem('user_data');
      const user = userData ? JSON.parse(userData) : { email: 'owner@example.com', first_name: 'Owner', last_name: 'User' };

      const ownerMember: OrganizationMember = {
        id: `member_${generateId()}`,
        user_id: userId,
        organization_id: newOrg.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        status: 'active',
        role: roles[0], // Owner role
        teams: [],
        joined_at: new Date().toISOString(),
      };

      // Save to mock storage
      mockOrganizations.push(newOrg);
      mockRoles.push(...roles);
      mockMembers.push(ownerMember);
      saveMockData();

      return newOrg;
    },
    {
      onSuccess: (org) => {
        addOrganization(org);
        setCurrentOrganization(org);
        setHasCompletedOnboarding(true);
        const roles = mockRoles.filter((r) => r.id.includes(org.id));
        setRoles(roles);
        queryClient.invalidateQueries(['organizations']);
      },
    }
  );
};

export const useUpdateOrganizationMutation = () => {
  const queryClient = useQueryClient();
  const { updateOrganization } = useOrganizationStore();

  return useMutation<Organization, Error, { id: string; data: UpdateOrganizationRequest }>(
    async ({ id, data }) => {
      await delay(300);

      const index = mockOrganizations.findIndex((o) => o.id === id);
      if (index === -1) throw new Error('Organization not found');

      mockOrganizations[index] = {
        ...mockOrganizations[index],
        ...data,
        updated_at: new Date().toISOString(),
      };

      saveMockData();
      return mockOrganizations[index];
    },
    {
      onSuccess: (org) => {
        updateOrganization(org.id, org);
        queryClient.invalidateQueries(['organizations']);
        queryClient.invalidateQueries(['organization', org.id]);
      },
    }
  );
};

// ============================================
// TEAM QUERIES
// ============================================

export const useTeamsQuery = (orgId: string) => {
  return useQuery<Team[]>(
    ['teams', orgId],
    async () => {
      await delay(200);
      initMockData();
      return mockTeams.filter((t) => t.organization_id === orgId);
    },
    {
      enabled: !!orgId,
      staleTime: 5 * 60 * 1000,
    }
  );
};

export const useCreateTeamMutation = () => {
  const queryClient = useQueryClient();
  const { addTeam } = useOrganizationStore();
  const currentOrg = useOrganizationStore((s) => s.currentOrganization);

  return useMutation<Team, Error, CreateTeamRequest>(
    async (data) => {
      await delay(300);

      if (!currentOrg) throw new Error('No organization selected');

      const newTeam: Team = {
        id: `team_${generateId()}`,
        organization_id: currentOrg.id,
        name: data.name,
        description: data.description,
        color: data.color || '#1677ff',
        leader_id: data.leader_id,
        member_count: data.member_ids?.length || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockTeams.push(newTeam);
      saveMockData();
      return newTeam;
    },
    {
      onSuccess: (team) => {
        addTeam(team);
        queryClient.invalidateQueries(['teams', team.organization_id]);
      },
    }
  );
};

export const useUpdateTeamMutation = () => {
  const queryClient = useQueryClient();
  const { updateTeam } = useOrganizationStore();

  return useMutation<Team, Error, { id: string; data: UpdateTeamRequest }>(
    async ({ id, data }) => {
      await delay(200);

      const index = mockTeams.findIndex((t) => t.id === id);
      if (index === -1) throw new Error('Team not found');

      mockTeams[index] = {
        ...mockTeams[index],
        ...data,
        updated_at: new Date().toISOString(),
      };

      saveMockData();
      return mockTeams[index];
    },
    {
      onSuccess: (team) => {
        updateTeam(team.id, team);
        queryClient.invalidateQueries(['teams', team.organization_id]);
      },
    }
  );
};

export const useDeleteTeamMutation = () => {
  const queryClient = useQueryClient();
  const { removeTeam } = useOrganizationStore();

  return useMutation<void, Error, string>(
    async (teamId) => {
      await delay(200);

      const team = mockTeams.find((t) => t.id === teamId);
      if (!team) throw new Error('Team not found');

      mockTeams = mockTeams.filter((t) => t.id !== teamId);
      saveMockData();
    },
    {
      onSuccess: (_, teamId) => {
        removeTeam(teamId);
        queryClient.invalidateQueries(['teams']);
      },
    }
  );
};

// ============================================
// MEMBER QUERIES
// ============================================

export const useMembersQuery = (orgId: string) => {
  return useQuery<OrganizationMember[]>(
    ['members', orgId],
    async () => {
      await delay(200);
      initMockData();
      return mockMembers.filter((m) => m.organization_id === orgId);
    },
    {
      enabled: !!orgId,
      staleTime: 5 * 60 * 1000,
    }
  );
};

export const useInviteMemberMutation = () => {
  const queryClient = useQueryClient();
  const currentOrg = useOrganizationStore((s) => s.currentOrganization);

  return useMutation<Invitation, Error, InviteMemberRequest>(
    async (data) => {
      await delay(400);

      if (!currentOrg) throw new Error('No organization selected');

      const userData = localStorage.getItem('user_data');
      const user = userData ? JSON.parse(userData) : { id: 'user_1' };

      const invitation: Invitation = {
        id: `inv_${generateId()}`,
        organization_id: currentOrg.id,
        email: data.email,
        role_id: data.role_id,
        team_ids: data.team_ids,
        status: 'pending',
        invited_by: user.id,
        invited_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        token: generateId() + generateId(),
      };

      mockInvitations.push(invitation);
      saveMockData();
      return invitation;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['invitations']);
      },
    }
  );
};

export const useUpdateMemberMutation = () => {
  const queryClient = useQueryClient();
  const { updateMember } = useOrganizationStore();

  return useMutation<OrganizationMember, Error, { id: string; data: UpdateMemberRequest }>(
    async ({ id, data }) => {
      await delay(200);

      const index = mockMembers.findIndex((m) => m.id === id);
      if (index === -1) throw new Error('Member not found');

      // Find new role if role_id is being updated
      if (data.role_id) {
        const newRole = mockRoles.find((r) => r.id === data.role_id);
        if (newRole) {
          mockMembers[index].role = newRole;
        }
      }

      mockMembers[index] = {
        ...mockMembers[index],
        ...data,
      };

      saveMockData();
      return mockMembers[index];
    },
    {
      onSuccess: (member) => {
        updateMember(member.id, member);
        queryClient.invalidateQueries(['members', member.organization_id]);
      },
    }
  );
};

export const useRemoveMemberMutation = () => {
  const queryClient = useQueryClient();
  const { removeMember } = useOrganizationStore();

  return useMutation<void, Error, string>(
    async (memberId) => {
      await delay(200);

      const member = mockMembers.find((m) => m.id === memberId);
      if (!member) throw new Error('Member not found');

      mockMembers = mockMembers.filter((m) => m.id !== memberId);
      saveMockData();
    },
    {
      onSuccess: (_, memberId) => {
        removeMember(memberId);
        queryClient.invalidateQueries(['members']);
      },
    }
  );
};

// ============================================
// ROLE QUERIES
// ============================================

export const useRolesQuery = (orgId: string) => {
  return useQuery<Role[]>(
    ['roles', orgId],
    async () => {
      await delay(200);
      initMockData();
      return mockRoles.filter((r) => r.id.includes(orgId));
    },
    {
      enabled: !!orgId,
      staleTime: 5 * 60 * 1000,
    }
  );
};

export const useCreateRoleMutation = () => {
  const queryClient = useQueryClient();
  const { setRoles } = useOrganizationStore();
  const currentOrg = useOrganizationStore((s) => s.currentOrganization);

  return useMutation<Role, Error, Omit<Role, 'id' | 'created_at' | 'updated_at'>>(
    async (data) => {
      await delay(300);

      if (!currentOrg) throw new Error('No organization selected');

      const newRole: Role = {
        ...data,
        id: `role_${generateId()}_${currentOrg.id}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockRoles.push(newRole);
      saveMockData();
      return newRole;
    },
    {
      onSuccess: () => {
        if (currentOrg) {
          const roles = mockRoles.filter((r) => r.id.includes(currentOrg.id));
          setRoles(roles);
          queryClient.invalidateQueries(['roles', currentOrg.id]);
        }
      },
    }
  );
};

// ============================================
// INVITATION QUERIES
// ============================================

export const useInvitationsQuery = (orgId: string) => {
  return useQuery<Invitation[]>(
    ['invitations', orgId],
    async () => {
      await delay(200);
      initMockData();
      return mockInvitations.filter((i) => i.organization_id === orgId);
    },
    {
      enabled: !!orgId,
      staleTime: 5 * 60 * 1000,
    }
  );
};

export const useCancelInvitationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>(
    async (invitationId) => {
      await delay(200);

      const index = mockInvitations.findIndex((i) => i.id === invitationId);
      if (index === -1) throw new Error('Invitation not found');

      mockInvitations[index].status = 'cancelled';
      saveMockData();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['invitations']);
      },
    }
  );
};



