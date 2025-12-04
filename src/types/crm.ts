// CRM types for Contacts and Leads

export type ContactStatus = 'active' | 'inactive';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted';
export type LeadSource = 'website' | 'referral' | 'social' | 'campaign' | 'cold_call' | 'event' | 'other';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

// Contact Types
export interface Contact {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  mobile?: string;
  company?: string;
  job_title?: string;
  department?: string;
  website?: string;
  address?: Address;
  status: ContactStatus;
  tags: string[];
  assigned_to?: string; // Member ID
  assigned_to_name?: string;
  source?: LeadSource;
  notes?: string;
  avatar_url?: string;
  social_profiles?: SocialProfiles;
  custom_fields?: Record<string, any>;
  created_by: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  last_contacted_at?: string;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export interface SocialProfiles {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
}

// Lead Types
export interface Lead {
  id: string;
  organization_id: string;
  contact_id?: string; // Optional link to existing contact
  name: string;
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  website?: string;
  source: LeadSource;
  status: LeadStatus;
  score?: number; // Lead scoring 0-100
  priority: Priority;
  estimated_value?: number;
  currency?: string;
  assigned_to?: string; // Member ID
  assigned_to_name?: string;
  notes?: string;
  tags: string[];
  custom_fields?: Record<string, any>;
  created_by: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  converted_at?: string;
  converted_to_contact_id?: string;
  last_activity_at?: string;
}

// Activity/Timeline types
export type ActivityType = 
  | 'note'
  | 'email'
  | 'call'
  | 'meeting'
  | 'task'
  | 'status_change'
  | 'assignment_change'
  | 'created'
  | 'updated';

export interface Activity {
  id: string;
  entity_type: 'contact' | 'lead';
  entity_id: string;
  type: ActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  created_by: string;
  created_by_name?: string;
  created_at: string;
}

// Tag type
export interface Tag {
  id: string;
  organization_id: string;
  name: string;
  color: string;
  usage_count: number;
  created_at: string;
}

// API Request types
export interface CreateContactRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  mobile?: string;
  company?: string;
  job_title?: string;
  department?: string;
  website?: string;
  address?: Address;
  status?: ContactStatus;
  tags?: string[];
  assigned_to?: string;
  source?: LeadSource;
  notes?: string;
  social_profiles?: SocialProfiles;
  custom_fields?: Record<string, any>;
}

export interface UpdateContactRequest extends Partial<CreateContactRequest> {
  id: string;
}

export interface CreateLeadRequest {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  website?: string;
  source: LeadSource;
  status?: LeadStatus;
  priority?: Priority;
  estimated_value?: number;
  currency?: string;
  assigned_to?: string;
  notes?: string;
  tags?: string[];
  custom_fields?: Record<string, any>;
}

export interface UpdateLeadRequest extends Partial<CreateLeadRequest> {
  id: string;
}

export interface ConvertLeadRequest {
  lead_id: string;
  create_contact: boolean;
  contact_data?: Partial<CreateContactRequest>;
}

// Filter types
export interface ContactFilters {
  search?: string;
  status?: ContactStatus[];
  tags?: string[];
  assigned_to?: string[];
  source?: LeadSource[];
  created_from?: string;
  created_to?: string;
}

export interface LeadFilters {
  search?: string;
  status?: LeadStatus[];
  source?: LeadSource[];
  priority?: Priority[];
  tags?: string[];
  assigned_to?: string[];
  score_min?: number;
  score_max?: number;
  created_from?: string;
  created_to?: string;
}

// Import types
export interface ImportResult {
  total: number;
  successful: number;
  failed: number;
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  data?: Record<string, any>;
}

// Stats types
export interface ContactStats {
  total: number;
  active: number;
  inactive: number;
  by_source: Record<LeadSource, number>;
  by_tag: Record<string, number>;
  recent_count: number; // Last 30 days
}

export interface LeadStats {
  total: number;
  by_status: Record<LeadStatus, number>;
  by_source: Record<LeadSource, number>;
  by_priority: Record<Priority, number>;
  conversion_rate: number;
  average_score: number;
  total_estimated_value: number;
  recent_count: number; // Last 30 days
}



