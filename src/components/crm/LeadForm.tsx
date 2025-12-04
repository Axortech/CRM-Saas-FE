'use client';

import React from 'react';
import { Form, Input, Select, Button, Space, Divider, Row, Col, InputNumber } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  BankOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { CreateLeadRequest, Lead, LeadStatus, LeadSource, Priority } from '@/types/crm';

interface LeadFormProps {
  initialValues?: Partial<Lead>;
  onSubmit: (values: CreateLeadRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const statusOptions: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'unqualified', label: 'Unqualified' },
  { value: 'converted', label: 'Converted' },
];

const sourceOptions: { value: LeadSource; label: string }[] = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'social', label: 'Social Media' },
  { value: 'campaign', label: 'Campaign' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'event', label: 'Event' },
  { value: 'other', label: 'Other' },
];

const priorityOptions: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const tagOptions = [
  'Enterprise',
  'SMB',
  'Hot Lead',
  'Demo Requested',
  'Follow Up',
  'Budget Confirmed',
  'Decision Maker',
  'Competitor User',
];

export default function LeadForm({
  initialValues,
  onSubmit,
  onCancel,
  isLoading,
}: LeadFormProps) {
  const [form] = Form.useForm();

  const handleFinish = async (values: any) => {
    const leadData: CreateLeadRequest = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      company: values.company,
      job_title: values.job_title,
      website: values.website,
      source: values.source,
      status: values.status,
      priority: values.priority,
      estimated_value: values.estimated_value,
      currency: values.currency,
      notes: values.notes,
      tags: values.tags,
    };

    await onSubmit(leadData);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{
        status: 'new',
        priority: 'medium',
        source: 'website',
        currency: 'USD',
        ...initialValues,
      }}
      requiredMark={false}
    >
      {/* Basic Information */}
      <Divider orientation="left" style={{ marginTop: 0 }}>
        Basic Information
      </Divider>

      <Form.Item
        name="name"
        label="Lead Name"
        rules={[{ required: true, message: 'Please enter lead name' }]}
      >
        <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} placeholder="Full name" />
      </Form.Item>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item name="phone" label="Phone">
            <Input prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item name="company" label="Company">
            <Input prefix={<BankOutlined style={{ color: '#bfbfbf' }} />} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item name="job_title" label="Job Title">
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="website" label="Website">
        <Input prefix={<GlobalOutlined style={{ color: '#bfbfbf' }} />} placeholder="https://" />
      </Form.Item>

      {/* Classification */}
      <Divider orientation="left">Classification</Divider>

      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Form.Item
            name="source"
            label="Source"
            rules={[{ required: true, message: 'Please select source' }]}
          >
            <Select options={sourceOptions} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item name="status" label="Status">
            <Select options={statusOptions} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item name="priority" label="Priority">
            <Select options={priorityOptions} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="tags" label="Tags">
        <Select
          mode="tags"
          placeholder="Add tags"
          options={tagOptions.map((t) => ({ value: t, label: t }))}
        />
      </Form.Item>

      {/* Value */}
      <Divider orientation="left">Deal Value</Divider>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item name="estimated_value" label="Estimated Value">
            <InputNumber
              prefix={<DollarOutlined style={{ color: '#bfbfbf' }} />}
              style={{ width: '100%' }}
              min={0}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item name="currency" label="Currency">
            <Select
              options={[
                { value: 'USD', label: 'USD ($)' },
                { value: 'EUR', label: 'EUR (€)' },
                { value: 'GBP', label: 'GBP (£)' },
                { value: 'INR', label: 'INR (₹)' },
              ]}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Notes */}
      <Divider orientation="left">Additional Information</Divider>

      <Form.Item name="notes" label="Notes">
        <Input.TextArea rows={4} placeholder="Add any additional notes about this lead..." />
      </Form.Item>

      {/* Actions */}
      <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            {initialValues ? 'Save Changes' : 'Create Lead'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}



