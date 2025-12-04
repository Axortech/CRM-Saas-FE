'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, Typography, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import ContactForm from '@/components/crm/ContactForm';
import { useCreateContactMutation } from '@/services/queries/contacts';
import { CreateContactRequest } from '@/types/crm';

const { Title } = Typography;

export default function NewContactPage() {
  const router = useRouter();
  const createContactMutation = useCreateContactMutation();

  const handleSubmit = async (values: CreateContactRequest) => {
    try {
      const contact = await createContactMutation.mutateAsync(values);
      message.success('Contact created successfully!');
      router.push(`/contacts/${contact.id}`);
    } catch (error) {
      message.error('Failed to create contact');
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <a
          onClick={() => router.back()}
          style={{ color: '#1677ff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <ArrowLeftOutlined /> Back to Contacts
        </a>
      </div>

      <Card>
        <Title level={4} style={{ marginBottom: 24 }}>
          Add New Contact
        </Title>

        <ContactForm
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          isLoading={createContactMutation.isLoading}
        />
      </Card>
    </div>
  );
}



