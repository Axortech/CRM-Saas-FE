'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Card,
  Typography,
  Descriptions,
  Tag,
  Button,
  Space,
  Spin,
  message,
  Tabs,
  Divider,
  Empty,
  Modal,
  Progress,
  Timeline,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  MailOutlined,
  PhoneOutlined,
  DollarOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import {
  useLeadQuery,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
  useUpdateLeadStatusMutation,
} from '@/services/queries/leads';
import LeadForm from '@/components/crm/LeadForm';
import { CreateLeadRequest, LeadStatus, Priority } from '@/types/crm';

const { Title, Text } = Typography;

const statusColors: Record<LeadStatus, string> = {
  new: 'blue',
  contacted: 'orange',
  qualified: 'green',
  unqualified: 'red',
  converted: 'purple',
};

const priorityColors: Record<Priority, string> = {
  low: 'default',
  medium: 'blue',
  high: 'orange',
  urgent: 'red',
};

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params.id as string;

  const [isEditing, setIsEditing] = useState(false);

  const { data: lead, isLoading, refetch } = useLeadQuery(leadId);
  const updateLeadMutation = useUpdateLeadMutation();
  const deleteLeadMutation = useDeleteLeadMutation();
  const updateStatusMutation = useUpdateLeadStatusMutation();

  const handleUpdate = async (values: CreateLeadRequest) => {
    try {
      await updateLeadMutation.mutateAsync({ id: leadId, ...values });
      message.success('Lead updated successfully!');
      setIsEditing(false);
      refetch();
    } catch (error) {
      message.error('Failed to update lead');
    }
  };

  const handleStatusChange = async (newStatus: LeadStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id: leadId, status: newStatus });
      message.success('Status updated!');
      refetch();
    } catch (error) {
      message.error('Failed to update status');
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Delete Lead',
      content: 'Are you sure you want to delete this lead? This action cannot be undone.',
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteLeadMutation.mutateAsync(leadId);
          message.success('Lead deleted');
          router.push('/leads');
        } catch (error) {
          message.error('Failed to delete lead');
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div style={{ padding: 24, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div style={{ padding: 24 }}>
        <Empty description="Lead not found" />
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button onClick={() => router.push('/leads')}>Back to Leads</Button>
        </div>
      </div>
    );
  }

  const statusSteps: LeadStatus[] = ['new', 'contacted', 'qualified', 'converted'];
  const currentStepIndex = statusSteps.indexOf(lead.status);

  const tabItems = [
    {
      key: 'details',
      label: 'Details',
      children: (
        <div>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Email">
              <a href={`mailto:${lead.email}`}>{lead.email}</a>
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {lead.phone ? <a href={`tel:${lead.phone}`}>{lead.phone}</a> : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Company">{lead.company || '-'}</Descriptions.Item>
            <Descriptions.Item label="Job Title">{lead.job_title || '-'}</Descriptions.Item>
            <Descriptions.Item label="Source">
              {lead.source.charAt(0).toUpperCase() + lead.source.slice(1)}
            </Descriptions.Item>
            <Descriptions.Item label="Website">
              {lead.website ? (
                <a href={lead.website} target="_blank" rel="noopener noreferrer">
                  {lead.website}
                </a>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Estimated Value">
              {lead.estimated_value ? `$${lead.estimated_value.toLocaleString()}` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Currency">{lead.currency || 'USD'}</Descriptions.Item>
            <Descriptions.Item label="Tags" span={2}>
              {lead.tags.length > 0 ? (
                <Space wrap>
                  {lead.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </Space>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Notes" span={2}>
              {lead.notes || '-'}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <Descriptions column={2} size="small" title="System Information">
            <Descriptions.Item label="Created By">{lead.created_by_name || '-'}</Descriptions.Item>
            <Descriptions.Item label="Created At">
              {new Date(lead.created_at).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated">
              {new Date(lead.updated_at).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Assigned To">{lead.assigned_to_name || 'Unassigned'}</Descriptions.Item>
          </Descriptions>
        </div>
      ),
    },
    {
      key: 'activity',
      label: 'Activity',
      children: (
        <Timeline
          items={[
            {
              color: 'green',
              children: (
                <>
                  <Text strong>Lead Created</Text>
                  <br />
                  <Text type="secondary">{new Date(lead.created_at).toLocaleString()}</Text>
                </>
              ),
            },
            {
              color: 'blue',
              children: (
                <>
                  <Text strong>Status: {lead.status}</Text>
                  <br />
                  <Text type="secondary">Current status</Text>
                </>
              ),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Back Button */}
      <div style={{ marginBottom: 24 }}>
        <a
          onClick={() => router.push('/leads')}
          style={{ color: '#1677ff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <ArrowLeftOutlined /> Back to Leads
        </a>
      </div>

      {isEditing ? (
        <Card>
          <Title level={4} style={{ marginBottom: 24 }}>
            Edit Lead
          </Title>
          <LeadForm
            initialValues={lead}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
            isLoading={updateLeadMutation.isLoading}
          />
        </Card>
      ) : (
        <>
          {/* Header Card */}
          <Card style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  {lead.name}
                </Title>
                <Text type="secondary" style={{ fontSize: 16 }}>
                  {lead.job_title} {lead.company && `at ${lead.company}`}
                </Text>
                <div style={{ marginTop: 12 }}>
                  <Space size={12}>
                    <Tag color={statusColors[lead.status]} style={{ fontSize: 13 }}>
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </Tag>
                    <Tag color={priorityColors[lead.priority]}>
                      {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)} Priority
                    </Tag>
                    {lead.estimated_value && (
                      <Tag icon={<DollarOutlined />} color="gold">
                        ${lead.estimated_value.toLocaleString()}
                      </Tag>
                    )}
                  </Space>
                </div>
              </div>
              <Space>
                <Button icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
                <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
                  Delete
                </Button>
              </Space>
            </div>

            <Divider />

            {/* Lead Score */}
            <div style={{ marginBottom: 24 }}>
              <Text strong style={{ marginBottom: 8, display: 'block' }}>Lead Score</Text>
              <Progress
                percent={lead.score || 0}
                strokeColor={
                  (lead.score || 0) >= 70 ? '#52c41a' : (lead.score || 0) >= 40 ? '#faad14' : '#ff4d4f'
                }
                style={{ maxWidth: 300 }}
              />
            </div>

            {/* Status Pipeline */}
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ marginBottom: 12, display: 'block' }}>Pipeline Progress</Text>
              <Space>
                {statusSteps.map((status, index) => (
                  <Button
                    key={status}
                    type={lead.status === status ? 'primary' : 'default'}
                    icon={index < currentStepIndex || (lead.status === 'converted' && status === 'converted') ? <CheckCircleOutlined /> : null}
                    onClick={() => handleStatusChange(status)}
                    disabled={lead.status === 'unqualified'}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
                {lead.status !== 'unqualified' && lead.status !== 'converted' && (
                  <Button danger onClick={() => handleStatusChange('unqualified')}>
                    Mark Unqualified
                  </Button>
                )}
              </Space>
            </div>

            <Divider />

            {/* Quick Actions */}
            <Space size={24}>
              <a href={`mailto:${lead.email}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MailOutlined /> {lead.email}
              </a>
              {lead.phone && (
                <a href={`tel:${lead.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PhoneOutlined /> {lead.phone}
                </a>
              )}
            </Space>
          </Card>

          {/* Tabs */}
          <Card>
            <Tabs items={tabItems} />
          </Card>
        </>
      )}
    </div>
  );
}

