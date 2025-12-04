'use client';

import React from 'react';
import { Form, Input, Select, Button, Space, Divider, Row, Col } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { CreateContactRequest, Contact, ContactStatus, LeadSource } from '@/types/crm';
import { useContactTagsQuery } from '@/services/queries/contacts';

interface ContactFormProps {
  initialValues?: Partial<Contact>;
  onSubmit: (values: CreateContactRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const statusOptions: { value: ContactStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
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

export default function ContactForm({
  initialValues,
  onSubmit,
  onCancel,
  isLoading,
}: ContactFormProps) {
  const [form] = Form.useForm();
  const { data: tags = [] } = useContactTagsQuery();

  const handleFinish = async (values: any) => {
    const contactData: CreateContactRequest = {
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      phone: values.phone,
      mobile: values.mobile,
      company: values.company,
      job_title: values.job_title,
      department: values.department,
      website: values.website,
      status: values.status,
      tags: values.tags,
      source: values.source,
      notes: values.notes,
      address: {
        street: values.street,
        city: values.city,
        state: values.state,
        postal_code: values.postal_code,
        country: values.country,
      },
    };

    await onSubmit(contactData);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{
        status: 'active',
        ...initialValues,
        street: initialValues?.address?.street,
        city: initialValues?.address?.city,
        state: initialValues?.address?.state,
        postal_code: initialValues?.address?.postal_code,
        country: initialValues?.address?.country,
      }}
      requiredMark={false}
    >
      {/* Basic Information */}
      <Divider orientation="left" style={{ marginTop: 0 }}>
        Basic Information
      </Divider>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="first_name"
            label="First Name"
            rules={[{ required: true, message: 'Please enter first name' }]}
          >
            <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="last_name"
            label="Last Name"
            rules={[{ required: true, message: 'Please enter last name' }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>

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

      <Form.Item name="mobile" label="Mobile">
        <Input prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />} />
      </Form.Item>

      {/* Company Information */}
      <Divider orientation="left">Company Information</Divider>

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

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item name="department" label="Department">
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item name="website" label="Website">
            <Input prefix={<GlobalOutlined style={{ color: '#bfbfbf' }} />} />
          </Form.Item>
        </Col>
      </Row>

      {/* Address */}
      <Divider orientation="left">Address</Divider>

      <Form.Item name="street" label="Street Address">
        <Input />
      </Form.Item>

      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Form.Item name="city" label="City">
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item name="state" label="State/Province">
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item name="postal_code" label="Postal Code">
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="country" label="Country">
        <Input />
      </Form.Item>

      {/* Classification */}
      <Divider orientation="left">Classification</Divider>

      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Form.Item name="status" label="Status">
            <Select options={statusOptions} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item name="source" label="Source">
            <Select options={sourceOptions} allowClear placeholder="Select source" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item name="tags" label="Tags">
            <Select
              mode="tags"
              placeholder="Add tags"
              options={tags.map((t) => ({ value: t.name, label: t.name }))}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Notes */}
      <Divider orientation="left">Additional Information</Divider>

      <Form.Item name="notes" label="Notes">
        <Input.TextArea rows={4} placeholder="Add any additional notes about this contact..." />
      </Form.Item>

      {/* Actions */}
      <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            {initialValues ? 'Save Changes' : 'Create Contact'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}



