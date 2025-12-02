'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, Typography, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import LeadForm from '@/components/crm/LeadForm';
import { useCreateLeadMutation } from '@/services/queries/leads';
import { CreateLeadRequest } from '@/types/crm';

const { Title } = Typography;

export default function NewLeadPage() {
  const router = useRouter();
  const createLeadMutation = useCreateLeadMutation();

  const handleSubmit = async (values: CreateLeadRequest) => {
    try {
      const lead = await createLeadMutation.mutateAsync(values);
      message.success('Lead created successfully!');
      router.push(`/leads/${lead.id}`);
    } catch (error) {
      message.error('Failed to create lead');
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <a
          onClick={() => router.back()}
          style={{ color: '#1677ff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <ArrowLeftOutlined /> Back to Leads
        </a>
      </div>

      <Card>
        <Title level={4} style={{ marginBottom: 24 }}>
          Add New Lead
        </Title>

        <LeadForm
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          isLoading={createLeadMutation.isLoading}
        />
      </Card>
    </div>
  );
}

