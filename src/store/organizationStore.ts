import { create } from 'zustand';
import { Organization, Team, OrganizationMember } from '@/types/organization';
import { Role } from '@/types/permissions';

interface OrganizationStore {
  // Current organization context
  currentOrganization: Organization | null;
  currentTeam: Team | null;
  currentMember: OrganizationMember | null;
  
  // Lists
  organizations: Organization[];
  teams: Team[];
  members: OrganizationMember[];
  roles: Role[];
  
  // Loading states
  isLoading: boolean;
  isHydrated: boolean;
  
  // Flags
  hasCompletedOnboarding: boolean;
  
  // Actions
  setCurrentOrganization: (org: Organization | null) => void;
  setCurrentTeam: (team: Team | null) => void;
  setCurrentMember: (member: OrganizationMember | null) => void;
  setOrganizations: (orgs: Organization[]) => void;
  setTeams: (teams: Team[]) => void;
  setMembers: (members: OrganizationMember[]) => void;
  setRoles: (roles: Role[]) => void;
  setHasCompletedOnboarding: (completed: boolean) => void;
  setLoading: (loading: boolean) => void;
  
  // Helpers
  addOrganization: (org: Organization) => void;
  updateOrganization: (id: string, updates: Partial<Organization>) => void;
  removeOrganization: (id: string) => void;
  addTeam: (team: Team) => void;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  removeTeam: (id: string) => void;
  addMember: (member: OrganizationMember) => void;
  updateMember: (id: string, updates: Partial<OrganizationMember>) => void;
  removeMember: (id: string) => void;
  
  // Initialize from localStorage
  initializeOrganization: () => void;
  clearOrganization: () => void;
}

const STORAGE_KEYS = {
  CURRENT_ORG: 'crm_current_org',
  CURRENT_TEAM: 'crm_current_team',
  ONBOARDING_COMPLETED: 'crm_onboarding_completed',
};

export const useOrganizationStore = create<OrganizationStore>((set, get) => ({
  // Initial state
  currentOrganization: null,
  currentTeam: null,
  currentMember: null,
  organizations: [],
  teams: [],
  members: [],
  roles: [],
  isLoading: false,
  isHydrated: false,
  hasCompletedOnboarding: false,

  // Setters
  setCurrentOrganization: (org) => {
    if (typeof window !== 'undefined' && org) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_ORG, JSON.stringify(org));
    }
    set({ currentOrganization: org });
  },

  setCurrentTeam: (team) => {
    if (typeof window !== 'undefined' && team) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_TEAM, JSON.stringify(team));
    }
    set({ currentTeam: team });
  },

  setCurrentMember: (member) => {
    set({ currentMember: member });
  },

  setOrganizations: (orgs) => {
    set({ organizations: orgs });
  },

  setTeams: (teams) => {
    set({ teams: teams });
  },

  setMembers: (members) => {
    set({ members: members });
  },

  setRoles: (roles) => {
    set({ roles: roles });
  },

  setHasCompletedOnboarding: (completed) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, String(completed));
    }
    set({ hasCompletedOnboarding: completed });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  // Helpers for organizations
  addOrganization: (org) => {
    set((state) => ({
      organizations: [...state.organizations, org],
    }));
  },

  updateOrganization: (id, updates) => {
    set((state) => ({
      organizations: state.organizations.map((org) =>
        org.id === id ? { ...org, ...updates } : org
      ),
      currentOrganization:
        state.currentOrganization?.id === id
          ? { ...state.currentOrganization, ...updates }
          : state.currentOrganization,
    }));
  },

  removeOrganization: (id) => {
    set((state) => ({
      organizations: state.organizations.filter((org) => org.id !== id),
      currentOrganization:
        state.currentOrganization?.id === id ? null : state.currentOrganization,
    }));
  },

  // Helpers for teams
  addTeam: (team) => {
    set((state) => ({
      teams: [...state.teams, team],
    }));
  },

  updateTeam: (id, updates) => {
    set((state) => ({
      teams: state.teams.map((team) =>
        team.id === id ? { ...team, ...updates } : team
      ),
      currentTeam:
        state.currentTeam?.id === id
          ? { ...state.currentTeam, ...updates }
          : state.currentTeam,
    }));
  },

  removeTeam: (id) => {
    set((state) => ({
      teams: state.teams.filter((team) => team.id !== id),
      currentTeam: state.currentTeam?.id === id ? null : state.currentTeam,
    }));
  },

  // Helpers for members
  addMember: (member) => {
    set((state) => ({
      members: [...state.members, member],
    }));
  },

  updateMember: (id, updates) => {
    set((state) => ({
      members: state.members.map((member) =>
        member.id === id ? { ...member, ...updates } : member
      ),
      currentMember:
        state.currentMember?.id === id
          ? { ...state.currentMember, ...updates }
          : state.currentMember,
    }));
  },

  removeMember: (id) => {
    set((state) => ({
      members: state.members.filter((member) => member.id !== id),
    }));
  },

  // Initialize from localStorage
  initializeOrganization: () => {
    if (typeof window !== 'undefined') {
      try {
        const orgData = localStorage.getItem(STORAGE_KEYS.CURRENT_ORG);
        const teamData = localStorage.getItem(STORAGE_KEYS.CURRENT_TEAM);
        const onboardingCompleted = localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);

        set({
          currentOrganization: orgData ? JSON.parse(orgData) : null,
          currentTeam: teamData ? JSON.parse(teamData) : null,
          hasCompletedOnboarding: onboardingCompleted === 'true',
          isHydrated: true,
        });
      } catch (error) {
        console.error('Error initializing organization store:', error);
        set({ isHydrated: true });
      }
    }
  },

  clearOrganization: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_ORG);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_TEAM);
      localStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    }

    set({
      currentOrganization: null,
      currentTeam: null,
      currentMember: null,
      organizations: [],
      teams: [],
      members: [],
      roles: [],
      hasCompletedOnboarding: false,
      isHydrated: true,
    });
  },
}));

// Selector hooks for performance
export const useCurrentOrganization = () =>
  useOrganizationStore((state) => state.currentOrganization);

export const useCurrentTeam = () =>
  useOrganizationStore((state) => state.currentTeam);

export const useCurrentMember = () =>
  useOrganizationStore((state) => state.currentMember);

export const useOrganizations = () =>
  useOrganizationStore((state) => state.organizations);

export const useTeams = () =>
  useOrganizationStore((state) => state.teams);

export const useMembers = () =>
  useOrganizationStore((state) => state.members);

export const useRoles = () =>
  useOrganizationStore((state) => state.roles);

export const useHasCompletedOnboarding = () =>
  useOrganizationStore((state) => state.hasCompletedOnboarding);



