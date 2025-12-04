import { useMutation, useQuery, useQueryClient } from 'react-query';
import { isFrontendOnlyMode } from '@/services/api/client';
import {
  Contact,
  CreateContactRequest,
  UpdateContactRequest,
  ContactFilters,
  ContactStats,
  Tag,
} from '@/types/crm';
import { PaginatedResponse } from '@/types/organization';
import { useOrganizationStore } from '@/store/organizationStore';

// ============================================
// MOCK DATA
// ============================================

const generateId = () => Math.random().toString(36).substring(2, 11);
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Sample data for realistic mock contacts
const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'William', 'Jennifer', 'James', 'Amanda', 'Chris', 'Maria', 'Daniel'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore'];
const companies = ['Acme Corp', 'TechStart Inc', 'Global Solutions', 'Innovate Labs', 'Digital First', 'Cloud Nine', 'Data Dynamics', 'Smart Systems', 'Future Forward', 'Peak Performance'];
const jobTitles = ['CEO', 'CTO', 'Marketing Director', 'Sales Manager', 'Product Manager', 'Software Engineer', 'Designer', 'Account Executive', 'VP of Sales', 'HR Manager'];
const tags = ['VIP', 'Hot Lead', 'Enterprise', 'SMB', 'Partner', 'Prospect', 'Customer', 'Churned'];

let mockContacts: Contact[] = [];
let mockTags: Tag[] = [];

// Initialize mock contacts
const initMockContacts = () => {
  if (typeof window !== 'undefined') {
    try {
      const contacts = localStorage.getItem('mock_contacts');
      const savedTags = localStorage.getItem('mock_contact_tags');

      if (contacts) {
        mockContacts = JSON.parse(contacts);
      } else {
        // Generate initial mock data
        mockContacts = generateMockContacts(25);
        localStorage.setItem('mock_contacts', JSON.stringify(mockContacts));
      }

      if (savedTags) {
        mockTags = JSON.parse(savedTags);
      } else {
        mockTags = tags.map((name, i) => ({
          id: `tag_${i}`,
          organization_id: 'org_mock',
          name,
          color: ['#1677ff', '#52c41a', '#faad14', '#eb2f96', '#722ed1', '#13c2c2', '#fa541c', '#2f54eb'][i % 8],
          usage_count: Math.floor(Math.random() * 20),
          created_at: new Date().toISOString(),
        }));
        localStorage.setItem('mock_contact_tags', JSON.stringify(mockTags));
      }
    } catch (e) {
      console.error('Error loading mock contacts:', e);
    }
  }
};

const generateMockContacts = (count: number): Contact[] => {
  return Array.from({ length: count }, (_, i) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const company = companies[Math.floor(Math.random() * companies.length)];
    const randomTags = tags
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3));

    return {
      id: `contact_${generateId()}`,
      organization_id: 'org_mock',
      first_name: firstName,
      last_name: lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
      phone: `+1 ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
      company,
      job_title: jobTitles[Math.floor(Math.random() * jobTitles.length)],
      status: Math.random() > 0.2 ? 'active' : 'inactive',
      tags: randomTags,
      source: ['website', 'referral', 'social', 'campaign', 'other'][Math.floor(Math.random() * 5)] as any,
      created_by: 'user_1',
      created_by_name: 'Current User',
      created_at: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)).toISOString(),
      updated_at: new Date().toISOString(),
    };
  });
};

const saveMockContacts = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mock_contacts', JSON.stringify(mockContacts));
    localStorage.setItem('mock_contact_tags', JSON.stringify(mockTags));
  }
};

// Initialize on module load
initMockContacts();

// ============================================
// CONTACTS QUERIES
// ============================================

export interface ContactsQueryParams {
  page?: number;
  page_size?: number;
  filters?: ContactFilters;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export const useContactsQuery = (params: ContactsQueryParams = {}) => {
  const { page = 1, page_size = 10, filters, sort_by, sort_order } = params;

  return useQuery<PaginatedResponse<Contact>>(
    ['contacts', page, page_size, filters, sort_by, sort_order],
    async () => {
      await delay(300);
      initMockContacts();

      let filtered = [...mockContacts];

      // Apply filters
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.first_name.toLowerCase().includes(search) ||
            c.last_name.toLowerCase().includes(search) ||
            c.email.toLowerCase().includes(search) ||
            c.company?.toLowerCase().includes(search)
        );
      }

      if (filters?.status?.length) {
        filtered = filtered.filter((c) => filters.status!.includes(c.status));
      }

      if (filters?.tags?.length) {
        filtered = filtered.filter((c) =>
          filters.tags!.some((tag) => c.tags.includes(tag))
        );
      }

      if (filters?.source?.length) {
        filtered = filtered.filter((c) => c.source && filters.source!.includes(c.source));
      }

      // Apply sorting
      if (sort_by) {
        filtered.sort((a, b) => {
          const aVal = (a as any)[sort_by] || '';
          const bVal = (b as any)[sort_by] || '';
          const comparison = String(aVal).localeCompare(String(bVal));
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
      staleTime: 30 * 1000, // 30 seconds
      keepPreviousData: true,
    }
  );
};

export const useContactQuery = (contactId: string) => {
  return useQuery<Contact | null>(
    ['contact', contactId],
    async () => {
      await delay(200);
      initMockContacts();
      return mockContacts.find((c) => c.id === contactId) || null;
    },
    {
      enabled: !!contactId,
      staleTime: 60 * 1000,
    }
  );
};

export const useCreateContactMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Contact, Error, CreateContactRequest>(
    async (data) => {
      await delay(400);

      const newContact: Contact = {
        id: `contact_${generateId()}`,
        organization_id: 'org_mock',
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        mobile: data.mobile,
        company: data.company,
        job_title: data.job_title,
        department: data.department,
        website: data.website,
        address: data.address,
        status: data.status || 'active',
        tags: data.tags || [],
        assigned_to: data.assigned_to,
        source: data.source,
        notes: data.notes,
        social_profiles: data.social_profiles,
        custom_fields: data.custom_fields,
        created_by: 'user_1',
        created_by_name: 'Current User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockContacts.unshift(newContact);
      saveMockContacts();
      return newContact;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['contacts']);
        queryClient.invalidateQueries(['contact-stats']);
      },
    }
  );
};

export const useUpdateContactMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Contact, Error, UpdateContactRequest>(
    async (data) => {
      await delay(300);

      const index = mockContacts.findIndex((c) => c.id === data.id);
      if (index === -1) throw new Error('Contact not found');

      mockContacts[index] = {
        ...mockContacts[index],
        ...data,
        updated_at: new Date().toISOString(),
      };

      saveMockContacts();
      return mockContacts[index];
    },
    {
      onSuccess: (contact) => {
        queryClient.invalidateQueries(['contacts']);
        queryClient.invalidateQueries(['contact', contact.id]);
        queryClient.invalidateQueries(['contact-stats']);
      },
    }
  );
};

export const useDeleteContactMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>(
    async (contactId) => {
      await delay(200);

      const index = mockContacts.findIndex((c) => c.id === contactId);
      if (index === -1) throw new Error('Contact not found');

      mockContacts.splice(index, 1);
      saveMockContacts();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['contacts']);
        queryClient.invalidateQueries(['contact-stats']);
      },
    }
  );
};

export const useBulkDeleteContactsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string[]>(
    async (contactIds) => {
      await delay(300);

      mockContacts = mockContacts.filter((c) => !contactIds.includes(c.id));
      saveMockContacts();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['contacts']);
        queryClient.invalidateQueries(['contact-stats']);
      },
    }
  );
};

// ============================================
// TAGS QUERIES
// ============================================

export const useContactTagsQuery = () => {
  return useQuery<Tag[]>(
    ['contact-tags'],
    async () => {
      await delay(100);
      initMockContacts();
      return mockTags;
    },
    {
      staleTime: 5 * 60 * 1000,
    }
  );
};

// ============================================
// STATS QUERIES
// ============================================

export const useContactStatsQuery = () => {
  return useQuery<ContactStats>(
    ['contact-stats'],
    async () => {
      await delay(200);
      initMockContacts();

      const total = mockContacts.length;
      const active = mockContacts.filter((c) => c.status === 'active').length;
      const inactive = total - active;

      const by_source: Record<string, number> = {};
      const by_tag: Record<string, number> = {};

      mockContacts.forEach((c) => {
        if (c.source) {
          by_source[c.source] = (by_source[c.source] || 0) + 1;
        }
        c.tags.forEach((tag) => {
          by_tag[tag] = (by_tag[tag] || 0) + 1;
        });
      });

      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const recent_count = mockContacts.filter(
        (c) => new Date(c.created_at).getTime() > thirtyDaysAgo
      ).length;

      return {
        total,
        active,
        inactive,
        by_source: by_source as any,
        by_tag,
        recent_count,
      };
    },
    {
      staleTime: 60 * 1000,
    }
  );
};



