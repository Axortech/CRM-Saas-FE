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
  Avatar,
  Dropdown,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import {
  useContactsQuery,
  useDeleteContactMutation,
  useBulkDeleteContactsMutation,
  useContactTagsQuery,
  useContactStatsQuery,
} from '@/services/queries/contacts';
import { Contact, ContactFilters, ContactStatus } from '@/types/crm';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';

const { Title, Text } = Typography;

export default function ContactsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [filters, setFilters] = useState<ContactFilters>({});
  const [searchValue, setSearchValue] = useState('');

  const { data: contactsData, isLoading, refetch } = useContactsQuery({
    page,
    page_size: pageSize,
    filters,
  });
  const { data: tags = [] } = useContactTagsQuery();
  const { data: stats } = useContactStatsQuery();
  const deleteContactMutation = useDeleteContactMutation();
  const bulkDeleteMutation = useBulkDeleteContactsMutation();

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setFilters((prev) => ({ ...prev, search: value }));
    setPage(1);
  };

  const handleStatusFilter = (status: ContactStatus[]) => {
    setFilters((prev) => ({ ...prev, status }));
    setPage(1);
  };

  const handleTagFilter = (selectedTags: string[]) => {
    setFilters((prev) => ({ ...prev, tags: selectedTags }));
    setPage(1);
  };

  const handleDelete = async (contactId: string) => {
    try {
      await deleteContactMutation.mutateAsync(contactId);
      message.success('Contact deleted');
      refetch();
    } catch (error) {
      message.error('Failed to delete contact');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) return;
    try {
      await bulkDeleteMutation.mutateAsync(selectedRowKeys);
      message.success(`${selectedRowKeys.length} contacts deleted`);
      setSelectedRowKeys([]);
      refetch();
    } catch (error) {
      message.error('Failed to delete contacts');
    }
  };

  const getMenuItems = (record: Contact): MenuProps['items'] => [
    {
      key: 'edit',
      label: 'Edit',
      icon: <EditOutlined />,
      onClick: () => router.push(`/contacts/${record.id}`),
    },
    {
      key: 'email',
      label: 'Send Email',
      icon: <MailOutlined />,
      onClick: () => window.open(`mailto:${record.email}`),
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

  const columns: ColumnsType<Contact> = [
    {
      title: 'Name',
      key: 'name',
      fixed: 'left',
      width: 250,
      render: (_, record) => (
        <Space
          style={{ cursor: 'pointer' }}
          onClick={() => router.push(`/contacts/${record.id}`)}
        >
          <Avatar
            size={36}
            src={record.avatar_url}
            style={{ backgroundColor: !record.avatar_url ? '#1677ff' : undefined }}
          >
            {!record.avatar_url && `${record.first_name?.charAt(0)}${record.last_name?.charAt(0)}`}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.first_name} {record.last_name}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.job_title}
            </Text>
          </div>
        </Space>
      ),
      sorter: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 220,
      render: (email) => (
        <a href={`mailto:${email}`} style={{ color: '#1677ff' }}>
          {email}
        </a>
      ),
    },
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
      width: 150,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
      render: (phone) =>
        phone ? (
          <a href={`tel:${phone}`} style={{ color: '#1677ff' }}>
            {phone}
          </a>
        ) : (
          '-'
        ),
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      width: 200,
      render: (tags: string[]) => (
        <Space wrap size={4}>
          {tags.slice(0, 2).map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
          {tags.length > 2 && <Tag>+{tags.length - 2}</Tag>}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: ContactStatus) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 110,
      render: (date) =>
        new Date(date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      sorter: true,
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown menu={{ items: getMenuItems(record) }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as string[]),
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Contacts
            </Title>
            <Text type="secondary">Manage your customer contacts</Text>
          </div>
          <Space>
            <Button icon={<ExportOutlined />}>Export</Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push('/contacts/new')}
            >
              Add Contact
            </Button>
          </Space>
        </div>

        {/* Stats Cards */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Total Contacts"
                value={stats?.total || 0}
                valueStyle={{ color: '#1677ff' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Active"
                value={stats?.active || 0}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Inactive"
                value={stats?.inactive || 0}
                valueStyle={{ color: '#8c8c8c' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="This Month"
                value={stats?.recent_count || 0}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Filters */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="Search contacts..."
            prefix={<SearchOutlined />}
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            placeholder="Status"
            mode="multiple"
            style={{ minWidth: 150 }}
            allowClear
            onChange={handleStatusFilter}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
          <Select
            placeholder="Tags"
            mode="multiple"
            style={{ minWidth: 200 }}
            allowClear
            onChange={handleTagFilter}
            options={tags.map((t) => ({ value: t.name, label: t.name }))}
          />
          {selectedRowKeys.length > 0 && (
            <Popconfirm
              title={`Delete ${selectedRowKeys.length} contacts?`}
              onConfirm={handleBulkDelete}
              okText="Delete"
              okButtonProps={{ danger: true }}
            >
              <Button danger>
                Delete Selected ({selectedRowKeys.length})
              </Button>
            </Popconfirm>
          )}
        </Space>
      </Card>

      {/* Table */}
      <Card bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={contactsData?.data || []}
          rowKey="id"
          loading={isLoading}
          rowSelection={rowSelection}
          scroll={{ x: 1200 }}
          pagination={{
            current: page,
            pageSize,
            total: contactsData?.total || 0,
            showSizeChanger: true,
            showTotal: (total) => `${total} contacts`,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />
      </Card>
    </div>
  );
}



