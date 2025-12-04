'use client';

import React, { useState } from 'react';
import {
  Button,
  Table,
  Tag,
  Space,
  Input,
  Select,
  Typography,
  Dropdown,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Segmented,
  Progress,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  TableOutlined,
  AppstoreOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import {
  useLeadsQuery,
  useDeleteLeadMutation,
  useLeadStatsQuery,
} from '@/services/queries/leads';
import { Lead, LeadFilters, LeadStatus, LeadSource, Priority } from '@/types/crm';
import LeadsKanban from '@/components/crm/LeadsKanban';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';

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

export default function LeadsPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<LeadFilters>({});
  const [searchValue, setSearchValue] = useState('');

  const { data: leadsData, isLoading, refetch } = useLeadsQuery({
    page,
    page_size: pageSize,
    filters,
  });
  const { data: stats } = useLeadStatsQuery();
  const deleteLeadMutation = useDeleteLeadMutation();

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setFilters((prev) => ({ ...prev, search: value }));
    setPage(1);
  };

  const handleStatusFilter = (status: LeadStatus[]) => {
    setFilters((prev) => ({ ...prev, status }));
    setPage(1);
  };

  const handleSourceFilter = (source: LeadSource[]) => {
    setFilters((prev) => ({ ...prev, source }));
    setPage(1);
  };

  const handleDelete = async (leadId: string) => {
    try {
      await deleteLeadMutation.mutateAsync(leadId);
      message.success('Lead deleted');
      refetch();
    } catch (error) {
      message.error('Failed to delete lead');
    }
  };

  const getMenuItems = (record: Lead): MenuProps['items'] => [
    {
      key: 'edit',
      label: 'Edit',
      icon: <EditOutlined />,
      onClick: () => router.push(`/leads/${record.id}`),
    },
    { type: 'divider' },
    {
      key: 'delete',
      label: 'Delete',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDelete(record.id),
    },
  ];

  const columns: ColumnsType<Lead> = [
    {
      title: 'Name',
      key: 'name',
      width: 200,
      render: (_, record) => (
        <div
          style={{ cursor: 'pointer' }}
          onClick={() => router.push(`/leads/${record.id}`)}
        >
          <div style={{ fontWeight: 500 }}>{record.name}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.company}
          </Text>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      render: (email) => (
        <a href={`mailto:${email}`} style={{ color: '#1677ff' }}>
          {email}
        </a>
      ),
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      width: 100,
      render: (score) => (
        <Progress
          percent={score}
          size="small"
          strokeColor={score >= 70 ? '#52c41a' : score >= 40 ? '#faad14' : '#ff4d4f'}
          format={(p) => p}
        />
      ),
      sorter: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: LeadStatus) => (
        <Tag color={statusColors[status]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 90,
      render: (priority: Priority) => (
        <Tag color={priorityColors[priority]}>
          {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      width: 100,
      render: (source: LeadSource) => source.charAt(0).toUpperCase() + source.slice(1),
    },
    {
      title: 'Value',
      dataIndex: 'estimated_value',
      key: 'estimated_value',
      width: 100,
      render: (value, record) =>
        value ? `$${value.toLocaleString()}` : '-',
      sorter: true,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 100,
      render: (date) =>
        new Date(date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      sorter: true,
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, record) => (
        <Dropdown menu={{ items: getMenuItems(record) }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Leads
            </Title>
            <Text type="secondary">Track and manage your sales leads</Text>
          </div>
          <Space>
            <Segmented
              value={viewMode}
              onChange={(v) => setViewMode(v as 'table' | 'kanban')}
              options={[
                { value: 'table', icon: <TableOutlined /> },
                { value: 'kanban', icon: <AppstoreOutlined /> },
              ]}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push('/leads/new')}
            >
              Add Lead
            </Button>
          </Space>
        </div>

        {/* Stats Cards */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Total Leads"
                value={stats?.total || 0}
                valueStyle={{ color: '#1677ff' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Qualified"
                value={stats?.by_status?.qualified || 0}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Conversion Rate"
                value={stats?.conversion_rate || 0}
                precision={1}
                suffix="%"
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Pipeline Value"
                value={stats?.total_estimated_value || 0}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {viewMode === 'table' ? (
        <>
          {/* Filters */}
          <Card size="small" style={{ marginBottom: 16 }}>
            <Space wrap>
              <Input
                placeholder="Search leads..."
                prefix={<SearchOutlined />}
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: 250 }}
                allowClear
              />
              <Select
                placeholder="Status"
                mode="multiple"
                style={{ minWidth: 180 }}
                allowClear
                onChange={handleStatusFilter}
                options={[
                  { value: 'new', label: 'New' },
                  { value: 'contacted', label: 'Contacted' },
                  { value: 'qualified', label: 'Qualified' },
                  { value: 'unqualified', label: 'Unqualified' },
                  { value: 'converted', label: 'Converted' },
                ]}
              />
              <Select
                placeholder="Source"
                mode="multiple"
                style={{ minWidth: 150 }}
                allowClear
                onChange={handleSourceFilter}
                options={[
                  { value: 'website', label: 'Website' },
                  { value: 'referral', label: 'Referral' },
                  { value: 'social', label: 'Social' },
                  { value: 'campaign', label: 'Campaign' },
                  { value: 'cold_call', label: 'Cold Call' },
                  { value: 'event', label: 'Event' },
                  { value: 'other', label: 'Other' },
                ]}
              />
            </Space>
          </Card>

          {/* Table */}
          <Card bodyStyle={{ padding: 0 }}>
            <Table
              columns={columns}
              dataSource={leadsData?.data || []}
              rowKey="id"
              loading={isLoading}
              scroll={{ x: 1100 }}
              pagination={{
                current: page,
                pageSize,
                total: leadsData?.total || 0,
                showSizeChanger: true,
                showTotal: (total) => `${total} leads`,
                onChange: (p, ps) => {
                  setPage(p);
                  setPageSize(ps);
                },
              }}
            />
          </Card>
        </>
      ) : (
        <LeadsKanban />
      )}
    </div>
  );
}



