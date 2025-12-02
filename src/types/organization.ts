// Organization and Team types for multi-tenancy

import { Role, RoleAssignment } from './permissions';

export type OrganizationSize = 'solo' | '2-10' | '11-50' | '51-200' | '201-500' | '500+';

export type Industry = 
  | 'technology'
  | 'healthcare'
  | 'finance'
  | 'retail'
  | 'manufacturing'
  | 'education'
  | 'real_estate'
  | 'consulting'
  | 'marketing'
  | 'legal'
  | 'other';

export type MemberStatus = 'active' | 'inactive' | 'pending' | 'suspended';
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'cancelled';

export interface Organization {
  id: string;
  name: string;
  slug: string; // URL-friendly identifier
  logo_url?: string;
  industry?: Industry;
  size?: OrganizationSize;
  website?: string;
  description?: string;
  owner_id: string;
  settings: OrganizationSettings;
  created_at: string;
  updated_at: string;
}

export interface OrganizationSettings {
  default_role_id: string;
  allow_member_invites: boolean;
  require_two_factor: boolean;
  timezone: string;
  date_format: string;
  currency: string;
}

export interface Team {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  color?: string; // For UI identification
  leader_id?: string;
  member_count: number;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  user_id: string;
  organization_id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  job_title?: string;
  phone?: string;
  status: MemberStatus;
  role: Role;
  teams: Team[];
  joined_at: string;
  last_active_at?: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  member_id: string; // OrganizationMember id
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  role_in_team?: string; // e.g., "Team Lead", "Member"
  joined_at: string;
}

export interface Invitation {
  id: string;
  organization_id: string;
  email: string;
  role_id: string;
  team_ids?: string[];
  status: InvitationStatus;
  invited_by: string;
  invited_at: string;
  expires_at: string;
  accepted_at?: string;
  token: string;
}

// API Request/Response types
export interface CreateOrganizationRequest {
  name: string;
  industry?: Industry;
  size?: OrganizationSize;
  website?: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  logo_url?: string;
  industry?: Industry;
  size?: OrganizationSize;
  website?: string;
  description?: string;
  settings?: Partial<OrganizationSettings>;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
  color?: string;
  leader_id?: string;
  member_ids?: string[];
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  color?: string;
  leader_id?: string;
}

export interface InviteMemberRequest {
  email: string;
  role_id: string;
  team_ids?: string[];
  message?: string;
}

export interface UpdateMemberRequest {
  role_id?: string;
  status?: MemberStatus;
  job_title?: string;
  team_ids?: string[];
}

// List response with pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

