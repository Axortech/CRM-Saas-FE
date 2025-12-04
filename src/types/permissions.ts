// Permission types for the CRM SaaS platform

export type Permission = 'view' | 'create' | 'edit' | 'delete' | 'export' | 'admin';

export type Module = 
  | 'contacts' 
  | 'leads' 
  | 'deals' 
  | 'tasks' 
  | 'reports' 
  | 'settings'
  | 'team'
  | 'organization';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Record<Module, Permission[]>;
  is_default: boolean;
  is_system: boolean; // System roles cannot be deleted
  created_at: string;
  updated_at: string;
}

export interface RoleAssignment {
  user_id: string;
  role_id: string;
  team_id?: string; // Optional: role can be scoped to a team
  assigned_at: string;
  assigned_by: string;
}

// Default permission sets for quick role creation
export const DEFAULT_PERMISSIONS: Record<string, Record<Module, Permission[]>> = {
  owner: {
    contacts: ['view', 'create', 'edit', 'delete', 'export', 'admin'],
    leads: ['view', 'create', 'edit', 'delete', 'export', 'admin'],
    deals: ['view', 'create', 'edit', 'delete', 'export', 'admin'],
    tasks: ['view', 'create', 'edit', 'delete', 'export', 'admin'],
    reports: ['view', 'create', 'edit', 'delete', 'export', 'admin'],
    settings: ['view', 'create', 'edit', 'delete', 'export', 'admin'],
    team: ['view', 'create', 'edit', 'delete', 'export', 'admin'],
    organization: ['view', 'create', 'edit', 'delete', 'export', 'admin'],
  },
  admin: {
    contacts: ['view', 'create', 'edit', 'delete', 'export', 'admin'],
    leads: ['view', 'create', 'edit', 'delete', 'export', 'admin'],
    deals: ['view', 'create', 'edit', 'delete', 'export', 'admin'],
    tasks: ['view', 'create', 'edit', 'delete', 'export', 'admin'],
    reports: ['view', 'create', 'edit', 'delete', 'export', 'admin'],
    settings: ['view', 'edit'],
    team: ['view', 'create', 'edit', 'delete'],
    organization: ['view', 'edit'],
  },
  manager: {
    contacts: ['view', 'create', 'edit', 'export'],
    leads: ['view', 'create', 'edit', 'export'],
    deals: ['view', 'create', 'edit', 'export'],
    tasks: ['view', 'create', 'edit', 'delete'],
    reports: ['view', 'create', 'export'],
    settings: ['view'],
    team: ['view', 'edit'],
    organization: ['view'],
  },
  member: {
    contacts: ['view', 'create', 'edit'],
    leads: ['view', 'create', 'edit'],
    deals: ['view', 'create', 'edit'],
    tasks: ['view', 'create', 'edit'],
    reports: ['view'],
    settings: ['view'],
    team: ['view'],
    organization: ['view'],
  },
  viewer: {
    contacts: ['view'],
    leads: ['view'],
    deals: ['view'],
    tasks: ['view'],
    reports: ['view'],
    settings: [],
    team: ['view'],
    organization: ['view'],
  },
};



