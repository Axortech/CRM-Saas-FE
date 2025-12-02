'use client';

import React from 'react';
import { Form, Input, Select, Button, Typography, message } from 'antd';
import { BankOutlined, GlobalOutlined, TeamOutlined } from '@ant-design/icons';
import { useCreateOrganizationMutation } from '@/services/queries/organization';
import { Industry, OrganizationSize, CreateOrganizationRequest } from '@/types/organization';

const { Title, Text } = Typography;

interface OrganizationStepProps {
  onNext: () => void;
}

const industries: { value: Industry; label: string }[] = [
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance & Banking' },
  { value: 'retail', label: 'Retail & E-commerce' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'education', label: 'Education' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'marketing', label: 'Marketing & Advertising' },
  { value: 'legal', label: 'Legal Services' },
  { value: 'other', label: 'Other' },
];

const companySizes: { value: OrganizationSize; label: string }[] = [
  { value: 'solo', label: 'Just me' },
  { value: '2-10', label: '2-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' },
];

export default function OrganizationStep({ onNext }: OrganizationStepProps) {
  const [form] = Form.useForm();
  const createOrgMutation = useCreateOrganizationMutation();

  const handleSubmit = async (values: CreateOrganizationRequest) => {
    try {
      await createOrgMutation.mutateAsync(values);
      message.success('Organization created successfully!');
      onNext();
    } catch (error) {
      message.error('Failed to create organization. Please try again.');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <Title level={4} style={{ marginBottom: 8 }}>
          Create Your Organization
        </Title>
        <Text type="secondary">
          Tell us about your company to personalize your CRM experience
        </Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        size="large"
      >
        <Form.Item
          name="name"
          label="Organization Name"
          rules={[
            { required: true, message: 'Please enter your organization name' },
            { min: 2, message: 'Name must be at least 2 characters' },
          ]}
        >
          <Input
            prefix={<BankOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="e.g., Acme Corporation"
          />
        </Form.Item>

        <Form.Item
          name="industry"
          label="Industry"
          rules={[{ required: true, message: 'Please select your industry' }]}
        >
          <Select placeholder="Select your industry" options={industries} />
        </Form.Item>

        <Form.Item
          name="size"
          label="Company Size"
          rules={[{ required: true, message: 'Please select your company size' }]}
        >
          <Select
            placeholder="Select company size"
            options={companySizes}
            suffixIcon={<TeamOutlined />}
          />
        </Form.Item>

        <Form.Item name="website" label="Website (optional)">
          <Input
            prefix={<GlobalOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="https://www.example.com"
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={createOrgMutation.isLoading}
            style={{
              height: 48,
              fontSize: 16,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
            }}
          >
            Continue
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

