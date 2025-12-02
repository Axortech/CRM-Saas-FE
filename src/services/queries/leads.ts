import { useMutation, useQuery, useQueryClient } from 'react-query';
import { isFrontendOnlyMode } from '@/services/api/client';
import {
  Lead,
  CreateLeadRequest,
  UpdateLeadRequest,
  LeadFilters,
  LeadStats,
  LeadStatus,
  LeadSource,
  Priority,
} from '@/types/crm';
import { PaginatedResponse } from '@/types/organization';

// ============================================
// MOCK DATA
// ============================================

const generateId = () => Math.random().toString(36).substring(2, 11);
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Sample data
const names = ['Alex Thompson', 'Jordan Rivera', 'Morgan Chen', 'Casey Williams', 'Taylor Martinez', 'Riley Johnson', 'Avery Brown', 'Quinn Davis', 'Blake Anderson', 'Cameron Lee'];
const companies = ['TechVentures', 'StartupCo', 'Innovation Inc', 'Digital Labs', 'Growth Systems', 'Cloud Tech', 'AI Solutions', 'Data Corp', 'Smart Industries', 'Future Tech'];
const sources: LeadSource[] = ['website', 'referral', 'social', 'campaign', 'cold_call', 'event', 'other'];
const statuses: LeadStatus[] = ['new', 'contacted', 'qualified', 'unqualified', 'converted'];
const priorities: Priority[] = ['low', 'medium', 'high', 'urgent'];
const tags = ['Enterprise', 'SMB', 'Hot Lead', 'Demo Requested', 'Follow Up', 'Budget Confirmed'];

let mockLeads: Lead[] = [];

// Initialize mock leads
const initMockLeads = () => {
  if (typeof window !== 'undefined') {
    try {
      const leads = localStorage.getItem('mock_leads');
      if (leads) {
        mockLeads = JSON.parse(leads);
      } else {
        mockLeads = generateMockLeads(30);
        localStorage.setItem('mock_leads', JSON.stringify(mockLeads));
      }
    } catch (e) {
      console.error('Error loading mock leads:', e);
    }
  }
};

const generateMockLeads = (count: number): Lead[] => {
  return Array.from({ length: count }, (_, i) => {
    const name = names[Math.floor(Math.random() * names.length)];
    const company = companies[Math.floor(Math.random() * companies.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const randomTags = tags
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3));

    return {
      id: `lead_${generateId()}`,
      organization_id: 'org_mock',
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
      phone: `+1 ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
      company,
      job_title: ['CEO', 'CTO', 'VP of Engineering', 'Director', 'Manager'][Math.floor(Math.random() * 5)],
      source: sources[Math.floor(Math.random() * sources.length)],
      status,
      score: Math.floor(Math.random() * 100),
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      estimated_value: Math.floor(Math.random() * 50000 + 5000),
      currency: 'USD',
      tags: randomTags,
      notes: Math.random() > 0.5 ? 'Interested in our enterprise solution. Scheduled a demo for next week.' : undefined,
      created_by: 'user_1',
      created_by_name: 'Current User',
      created_at: new Date(Date.now() - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000)).toISOString(),
      updated_at: new Date().toISOString(),
      last_activity_at: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
    };
  });
};

const saveMockLeads = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mock_leads', JSON.stringify(mockLeads));
  }
};

// Initialize on module load
initMockLeads();

// ============================================
// LEADS QUERIES
// ============================================

export interface LeadsQueryParams {
  page?: number;
  page_size?: number;
  filters?: LeadFilters;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export const useLeadsQuery = (params: LeadsQueryParams = {}) => {
  const { page = 1, page_size = 10, filters, sort_by, sort_order } = params;

  return useQuery<PaginatedResponse<Lead>>(
    ['leads', page, page_size, filters, sort_by, sort_order],
    async () => {
      await delay(300);
      initMockLeads();

      let filtered = [...mockLeads];

      // Apply filters
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(
          (l) =>
            l.name.toLowerCase().includes(search) ||
            l.email.toLowerCase().includes(search) ||
            l.company?.toLowerCase().includes(search)
        );
      }

      if (filters?.status?.length) {
        filtered = filtered.filter((l) => filters.status!.includes(l.status));
      }

      if (filters?.source?.length) {
        filtered = filtered.filter((l) => filters.source!.includes(l.source));
      }

      if (filters?.priority?.length) {
        filtered = filtered.filter((l) => filters.priority!.includes(l.priority));
      }

      if (filters?.score_min !== undefined) {
        filtered = filtered.filter((l) => (l.score || 0) >= filters.score_min!);
      }

      if (filters?.score_max !== undefined) {
        filtered = filtered.filter((l) => (l.score || 0) <= filters.score_max!);
      }

      // Apply sorting
      if (sort_by) {
        filtered.sort((a, b) => {
          const aVal = (a as any)[sort_by] || '';
          const bVal = (b as any)[sort_by] || '';
          const comparison = typeof aVal === 'number' 
            ? aVal - bVal 
            : String(aVal).localeCompare(String(bVal));
          return sort_order === 'desc' ? -comparison : comparison;
        });
      }

      // Paginate
      const total = filtered.length;
      const start = (page - 1) * page_size;
      const end = start + page_size;
      const data = filtered.slice(start, end);

      return {
        data,
        total,
        page,
        page_size,
        total_pages: Math.ceil(total / page_size),
      };
    },
    {
      staleTime: 30 * 1000,
      keepPreviousData: true,
    }
  );
};

// Query leads grouped by status for Kanban view
export const useLeadsByStatusQuery = () => {
  return useQuery<Record<LeadStatus, Lead[]>>(
    ['leads-by-status'],
    async () => {
      await delay(200);
      initMockLeads();

      const grouped: Record<LeadStatus, Lead[]> = {
        new: [],
        contacted: [],
        qualified: [],
        unqualified: [],
        converted: [],
      };

      mockLeads.forEach((lead) => {
        grouped[lead.status].push(lead);
      });

      // Sort each column by score (highest first)
      Object.keys(grouped).forEach((status) => {
        grouped[status as LeadStatus].sort((a, b) => (b.score || 0) - (a.score || 0));
      });

      return grouped;
    },
    {
      staleTime: 30 * 1000,
    }
  );
};

export const useLeadQuery = (leadId: string) => {
  return useQuery<Lead | null>(
    ['lead', leadId],
    async () => {
      await delay(200);
      initMockLeads();
      return mockLeads.find((l) => l.id === leadId) || null;
    },
    {
      enabled: !!leadId,
      staleTime: 60 * 1000,
    }
  );
};

export const useCreateLeadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Lead, Error, CreateLeadRequest>(
    async (data) => {
      await delay(400);

      const newLead: Lead = {
        id: `lead_${generateId()}`,
        organization_id: 'org_mock',
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        job_title: data.job_title,
        website: data.website,
        source: data.source,
        status: data.status || 'new',
        score: Math.floor(Math.random() * 30 + 20), // Initial score
        priority: data.priority || 'medium',
        estimated_value: data.estimated_value,
        currency: data.currency || 'USD',
        assigned_to: data.assigned_to,
        notes: data.notes,
        tags: data.tags || [],
        custom_fields: data.custom_fields,
        created_by: 'user_1',
        created_by_name: 'Current User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockLeads.unshift(newLead);
      saveMockLeads();
      return newLead;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['leads']);
        queryClient.invalidateQueries(['leads-by-status']);
        queryClient.invalidateQueries(['lead-stats']);
      },
    }
  );
};

export const useUpdateLeadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Lead, Error, UpdateLeadRequest>(
    async (data) => {
      await delay(300);

      const index = mockLeads.findIndex((l) => l.id === data.id);
      if (index === -1) throw new Error('Lead not found');

      mockLeads[index] = {
        ...mockLeads[index],
        ...data,
        updated_at: new Date().toISOString(),
      };

      saveMockLeads();
      return mockLeads[index];
    },
    {
      onSuccess: (lead) => {
        queryClient.invalidateQueries(['leads']);
        queryClient.invalidateQueries(['leads-by-status']);
        queryClient.invalidateQueries(['lead', lead.id]);
        queryClient.invalidateQueries(['lead-stats']);
      },
    }
  );
};

export const useUpdateLeadStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Lead, Error, { id: string; status: LeadStatus }>(
    async ({ id, status }) => {
      await delay(200);

      const index = mockLeads.findIndex((l) => l.id === id);
      if (index === -1) throw new Error('Lead not found');

      mockLeads[index] = {
        ...mockLeads[index],
        status,
        updated_at: new Date().toISOString(),
        ...(status === 'converted' ? { converted_at: new Date().toISOString() } : {}),
      };

      saveMockLeads();
      return mockLeads[index];
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['leads']);
        queryClient.invalidateQueries(['leads-by-status']);
        queryClient.invalidateQueries(['lead-stats']);
      },
    }
  );
};

export const useDeleteLeadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>(
    async (leadId) => {
      await delay(200);

      const index = mockLeads.findIndex((l) => l.id === leadId);
      if (index === -1) throw new Error('Lead not found');

      mockLeads.splice(index, 1);
      saveMockLeads();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['leads']);
        queryClient.invalidateQueries(['leads-by-status']);
        queryClient.invalidateQueries(['lead-stats']);
      },
    }
  );
};

// ============================================
// STATS QUERIES
// ============================================

export const useLeadStatsQuery = () => {
  return useQuery<LeadStats>(
    ['lead-stats'],
    async () => {
      await delay(200);
      initMockLeads();

      const by_status: Record<LeadStatus, number> = {
        new: 0,
        contacted: 0,
        qualified: 0,
        unqualified: 0,
        converted: 0,
      };

      const by_source: Record<string, number> = {};
      const by_priority: Record<Priority, number> = {
        low: 0,
        medium: 0,
        high: 0,
        urgent: 0,
      };

      let totalScore = 0;
      let totalValue = 0;
      let scoreCount = 0;

      mockLeads.forEach((l) => {
        by_status[l.status]++;
        by_source[l.source] = (by_source[l.source] || 0) + 1;
        by_priority[l.priority]++;

        if (l.score !== undefined) {
          totalScore += l.score;
          scoreCount++;
        }
        if (l.estimated_value) {
          totalValue += l.estimated_value;
        }
      });

      const total = mockLeads.length;
      const converted = by_status.converted;
      const conversion_rate = total > 0 ? (converted / total) * 100 : 0;
      const average_score = scoreCount > 0 ? totalScore / scoreCount : 0;

      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const recent_count = mockLeads.filter(
        (l) => new Date(l.created_at).getTime() > thirtyDaysAgo
      ).length;

      return {
        total,
        by_status,
        by_source: by_source as any,
        by_priority,
        conversion_rate,
        average_score,
        total_estimated_value: totalValue,
        recent_count,
      };
    },
    {
      staleTime: 60 * 1000,
    }
  );
};

