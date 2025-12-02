'use client';

import React, { useState } from 'react';
import {
  Button,
  Table,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Typography,
  Popconfirm,
  Empty,
  Avatar,
  Tabs,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  UserOutlined,
  MailOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useOrganizationStore } from '@/store/organizationStore';
import {
  useMembersQuery,
  useInviteMemberMutation,
  useRemoveMemberMutation,
  useUpdateMemberMutation,
  useRolesQuery,
  useInvitationsQuery,
  useCancelInvitationMutation,
} from '@/services/queries/organization';
import { OrganizationMember, Invitation } from '@/types/organization';

const { Title, Text } = Typography;

export default function MembersPage() {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [form] = Form.useForm();

  const currentOrg = useOrganizationStore((state) => state.currentOrganization);
  const { data: members = [], isLoading: membersLoading, refetch: refetchMembers } = useMembersQuery(currentOrg?.id || '');
  const { data: roles = [] } = useRolesQuery(currentOrg?.id || '');
  const { data: invitations = [], refetch: refetchInvitations } = useInvitationsQuery(currentOrg?.id || '');
  
  const inviteMemberMutation = useInviteMemberMutation();
  const removeMemberMutation = useRemoveMemberMutation();
  const updateMemberMutation = useUpdateMemberMutation();
  const cancelInvitationMutation = useCancelInvitationMutation();

  const assignableRoles = roles.filter((r) => r.name !== 'Owner');
  const pendingInvitations = invitations.filter((i) => i.status === 'pending');

  const handleInvite = async (values: { email: string; role_id: string }) => {
    try {
      await inviteMemberMutation.mutateAsync(values);
      message.success('Invitation sent!');
      setIsInviteModalOpen(false);
      form.resetFields();
      refetchInvitations();
    } catch (error) {
      message.error('Failed to send invitation');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMemberMutation.mutateAsync(memberId);
      message.success('Member removed');
      refetchMembers();
    } catch (error) {
      message.error('Failed to remove member');
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await cancelInvitationMutation.mutateAsync(invitationId);
      message.success('Invitation cancelled');
      refetchInvitations();
    } catch (error) {
      message.error('Failed to cancel invitation');
    }
  };

  const handleRoleChange = async (memberId: string, roleId: string) => {
    try {
      await updateMemberMutation.mutateAsync({
        id: memberId,
        data: { role_id: roleId },
      });
      message.success('Role updated');
      refetchMembers();
    } catch (error) {
      message.error('Failed to update role');
    }
  };

  const memberColumns = [
    {
      title: 'Member',
      key: 'member',
      render: (_: any, record: OrganizationMember) => (
        <Space>
          <Avatar
            size={36}
            src={record.avatar_url}
            icon={!record.avatar_url && <UserOutlined />}
            style={{ backgroundColor: !record.avatar_url ? '#1677ff' : undefined }}
          >
            {!record.avatar_url && `${record.first_name?.charAt(0)}${record.last_name?.charAt(0)}`}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.first_name} {record.last_name}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      key: 'role',
      width: 180,
      render: (_: any, record: OrganizationMember) => {
        const isOwner = record.role?.name === 'Owner';
        return isOwner ? (
          <Tag color="gold">{record.role?.name}</Tag>
        ) : (
          <Select
            value={record.role?.id}
            onChange={(value) => handleRoleChange(record.id, value)}
            style={{ width: 140 }}
            size="small"
            options={assignableRoles.map((r) => ({
              value: r.id,
              label: r.name,
            }))}
          />
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'orange'}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'joined_at',
      key: 'joined_at',
      width: 120,
      render: (date: string) =>
        new Date(date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_: any, record: OrganizationMember) => {
        const isOwner = record.role?.name === 'Owner';
        return isOwner ? null : (
          <Popconfirm
            title="Remove member?"
            description="This member will lose access to the organization."
            onConfirm={() => handleRemoveMember(record.id)}
            okText="Remove"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        );
      },
    },
  ];

  const invitationColumns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => (
        <Space>
          <MailOutlined style={{ color: '#8c8c8c' }} />
          <Text>{email}</Text>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role_id',
      key: 'role_id',
      width: 120,
      render: (roleId: string) => {
        const role = roles.find((r) => r.id === roleId);
        return <Tag>{role?.name || 'Unknown'}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'pending' ? 'processing' : 'default'}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Sent',
      dataIndex: 'invited_at',
      key: 'invited_at',
      width: 120,
      render: (date: string) =>
        new Date(date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_: any, record: Invitation) =>
        record.status === 'pending' && (
          <Popconfirm
            title="Cancel invitation?"
            onConfirm={() => handleCancelInvitation(record.id)}
            okText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        ),
    },
  ];

  const defaultRoleId = roles.find((r) => r.is_default)?.id || assignableRoles[0]?.id;

  const tabItems = [
    {
      key: 'members',
      label: `Members (${members.length})`,
      children: members.length === 0 && !membersLoading ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No members yet"
          style={{ padding: '60px 0' }}
        />
      ) : (
        <Table
          columns={memberColumns}
          dataSource={members}
          rowKey="id"
          loading={membersLoading}
          pagination={false}
        />
      ),
    },
    {
      key: 'invitations',
      label: (
        <Space>
          Pending Invitations
          {pendingInvitations.length > 0 && (
            <Badge count={pendingInvitations.length} />
          )}
        </Space>
      ),
      children: pendingInvitations.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No pending invitations"
          style={{ padding: '60px 0' }}
        />
      ) : (
        <Table
          columns={invitationColumns}
          dataSource={pendingInvitations}
          rowKey="id"
          pagination={false}
        />
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          Members
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsInviteModalOpen(true)}
        >
          Invite Member
        </Button>
      </div>

      <Tabs items={tabItems} />

      {/* Invite Modal */}
      <Modal
        title="Invite Team Member"
        open={isInviteModalOpen}
        onCancel={() => {
          setIsInviteModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={420}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleInvite}
          requiredMark={false}
          initialValues={{ role_id: defaultRoleId }}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="colleague@company.com"
            />
          </Form.Item>

          <Form.Item
            name="role_id"
            label="Role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select
              options={assignableRoles.map((r) => ({
                value: r.id,
                label: (
                  <div>
                    <div>{r.name}</div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>{r.description}</div>
                  </div>
                ),
              }))}
              optionLabelProp="label"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setIsInviteModalOpen(false)}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={inviteMemberMutation.isLoading}
              >
                Send Invitation
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

