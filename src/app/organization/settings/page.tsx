'use client';

import React, { useEffect } from 'react';
import { Form, Input, Select, Button, message, Divider, Typography, Upload, Avatar, Space } from 'antd';
import { BankOutlined, GlobalOutlined, UploadOutlined } from '@ant-design/icons';
import { useOrganizationStore } from '@/store/organizationStore';
import { useUpdateOrganizationMutation } from '@/services/queries/organization';
import { Industry, OrganizationSize } from '@/types/organization';

const { Title, Text } = Typography;

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

const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Asia/Shanghai', label: 'Shanghai' },
  { value: 'Asia/Kolkata', label: 'Mumbai' },
];

const currencies = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'JPY', label: 'JPY (¥)' },
  { value: 'INR', label: 'INR (₹)' },
  { value: 'AUD', label: 'AUD ($)' },
  { value: 'CAD', label: 'CAD ($)' },
];

export default function OrganizationSettingsPage() {
  const [form] = Form.useForm();
  const currentOrg = useOrganizationStore((state) => state.currentOrganization);
  const updateOrgMutation = useUpdateOrganizationMutation();

  useEffect(() => {
    if (currentOrg) {
      form.setFieldsValue({
        name: currentOrg.name,
        industry: currentOrg.industry,
        size: currentOrg.size,
        website: currentOrg.website,
        description: currentOrg.description,
        timezone: currentOrg.settings?.timezone || 'UTC',
        currency: currentOrg.settings?.currency || 'USD',
        date_format: currentOrg.settings?.date_format || 'MM/DD/YYYY',
      });
    }
  }, [currentOrg, form]);

  const handleSubmit = async (values: any) => {
    if (!currentOrg) return;

    try {
      await updateOrgMutation.mutateAsync({
        id: currentOrg.id,
        data: {
          name: values.name,
          industry: values.industry,
          size: values.size,
          website: values.website,
          description: values.description,
          settings: {
            ...currentOrg.settings,
            timezone: values.timezone,
            currency: values.currency,
            date_format: values.date_format,
          },
        },
      });
      message.success('Settings saved successfully!');
    } catch (error) {
      message.error('Failed to save settings');
    }
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>
        General Settings
      </Title>

      {/* Logo Section */}
      <div style={{ marginBottom: 32 }}>
        <Text strong style={{ display: 'block', marginBottom: 12 }}>
          Organization Logo
        </Text>
        <Space align="center" size={16}>
          <Avatar
            size={80}
            src={currentOrg?.logo_url}
            style={{ backgroundColor: '#667eea' }}
          >
            {currentOrg?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <Upload
              showUploadList={false}
              beforeUpload={() => {
                message.info('Logo upload will be available with backend integration');
                return false;
              }}
            >
              <Button icon={<UploadOutlined />}>Upload Logo</Button>
            </Upload>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Recommended: 200x200px, PNG or JPG
              </Text>
            </div>
          </div>
        </Space>
      </div>

      <Divider />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        {/* Basic Info */}
        <Title level={5} style={{ marginBottom: 16 }}>
          Basic Information
        </Title>

        <Form.Item
          name="name"
          label="Organization Name"
          rules={[{ required: true, message: 'Please enter organization name' }]}
        >
          <Input prefix={<BankOutlined style={{ color: '#bfbfbf' }} />} />
        </Form.Item>

        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item name="industry" label="Industry" style={{ flex: 1 }}>
            <Select options={industries} />
          </Form.Item>

          <Form.Item name="size" label="Company Size" style={{ flex: 1 }}>
            <Select options={companySizes} />
          </Form.Item>
        </div>

        <Form.Item name="website" label="Website">
          <Input prefix={<GlobalOutlined style={{ color: '#bfbfbf' }} />} />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} placeholder="Brief description of your organization" />
        </Form.Item>

        <Divider />

        {/* Preferences */}
        <Title level={5} style={{ marginBottom: 16 }}>
          Preferences
        </Title>

        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item name="timezone" label="Timezone" style={{ flex: 1 }}>
            <Select options={timezones} showSearch />
          </Form.Item>

          <Form.Item name="currency" label="Currency" style={{ flex: 1 }}>
            <Select options={currencies} />
          </Form.Item>

          <Form.Item name="date_format" label="Date Format" style={{ flex: 1 }}>
            <Select
              options={[
                { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
              ]}
            />
          </Form.Item>
        </div>

        <Divider />

        <Form.Item style={{ marginBottom: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={updateOrgMutation.isLoading}
            style={{ minWidth: 120 }}
          >
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}



