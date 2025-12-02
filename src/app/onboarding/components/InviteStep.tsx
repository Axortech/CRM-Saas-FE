'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, List, Tag, Select, Space } from 'antd';
import { PlusOutlined, MailOutlined, UserOutlined, CloseOutlined } from '@ant-design/icons';
import { useInviteMemberMutation, useRolesQuery, useInvitationsQuery } from '@/services/queries/organization';
import { useOrganizationStore } from '@/store/organizationStore';

const { Title, Text } = Typography;

interface InviteStepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

interface PendingInvite {
  email: string;
  role_id: string;
  role_name: string;
}

export default function InviteStep({ onNext, onBack, onSkip }: InviteStepProps) {
  const [form] = Form.useForm();
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [isSending, setIsSending] = useState(false);

  const currentOrg = useOrganizationStore((state) => state.currentOrganization);
  const inviteMemberMutation = useInviteMemberMutation();
  const { data: roles = [] } = useRolesQuery(currentOrg?.id || '');
  const { data: existingInvitations = [] } = useInvitationsQuery(currentOrg?.id || '');

  // Filter out system roles that shouldn't be assignable
  const assignableRoles = roles.filter((r) => r.name !== 'Owner');

  const handleAddToList = (values: { email: string; role_id: string }) => {
    const role = roles.find((r) => r.id === values.role_id);
    if (!role) return;

    // Check for duplicates
    if (pendingInvites.some((i) => i.email === values.email)) {
      message.warning('This email is already in the list');
      return;
    }

    setPendingInvites((prev) => [
      ...prev,
      {
        email: values.email,
        role_id: values.role_id,
        role_name: role.name,
      },
    ]);
    form.resetFields(['email']);
  };

  const handleRemoveFromList = (email: string) => {
    setPendingInvites((prev) => prev.filter((i) => i.email !== email));
  };

  const handleSendInvitations = async () => {
    if (pendingInvites.length === 0) {
      onNext();
      return;
    }

    setIsSending(true);
    try {
      for (const invite of pendingInvites) {
        await inviteMemberMutation.mutateAsync({
          email: invite.email,
          role_id: invite.role_id,
        });
      }
      message.success(`${pendingInvites.length} invitation(s) sent!`);
      setPendingInvites([]);
      onNext();
    } catch (error) {
      message.error('Failed to send some invitations');
    } finally {
      setIsSending(false);
    }
  };

  const defaultRoleId = roles.find((r) => r.is_default)?.id || roles[0]?.id;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <Title level={4} style={{ marginBottom: 8 }}>
          Invite Team Members (Optional)
        </Title>
        <Text type="secondary">
          Invite your colleagues to collaborate in the CRM
        </Text>
      </div>

      {/* Invite Form */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleAddToList}
        requiredMark={false}
        initialValues={{ role_id: defaultRoleId }}
      >
        <div style={{ display: 'flex', gap: 12 }}>
          <Form.Item
            name="email"
            style={{ flex: 2, marginBottom: 16 }}
            rules={[
              { required: true, message: 'Enter email' },
              { type: 'email', message: 'Enter a valid email' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="colleague@company.com"
            />
          </Form.Item>

          <Form.Item
            name="role_id"
            style={{ flex: 1, marginBottom: 16 }}
            rules={[{ required: true, message: 'Select role' }]}
          >
            <Select
              placeholder="Role"
              options={assignableRoles.map((r) => ({
                value: r.id,
                label: r.name,
              }))}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
              Add
            </Button>
          </Form.Item>
        </div>
      </Form>

      {/* Pending Invites List */}
      {pendingInvites.length > 0 && (
        <div
          style={{
            background: '#f5f5f5',
            borderRadius: 8,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <Text strong style={{ marginBottom: 12, display: 'block' }}>
            Pending Invitations ({pendingInvites.length})
          </Text>
          <List
            dataSource={pendingInvites}
            renderItem={(invite) => (
              <List.Item
                style={{ padding: '8px 0' }}
                actions={[
                  <Button
                    key="remove"
                    type="text"
                    size="small"
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => handleRemoveFromList(invite.email)}
                  />,
                ]}
              >
                <Space>
                  <UserOutlined style={{ color: '#8c8c8c' }} />
                  <Text>{invite.email}</Text>
                  <Tag color="blue">{invite.role_name}</Tag>
                </Space>
              </List.Item>
            )}
          />
        </div>
      )}

      {pendingInvites.length === 0 && existingInvitations.length === 0 && (
        <div
          style={{
            background: '#f5f5f5',
            borderRadius: 8,
            padding: 24,
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          <MailOutlined style={{ fontSize: 32, color: '#bfbfbf', marginBottom: 8 }} />
          <div>
            <Text type="secondary">No invitations added yet</Text>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
        <Button onClick={onBack} style={{ flex: 1, height: 44 }}>
          Back
        </Button>
        <Button onClick={onSkip} style={{ flex: 1, height: 44 }}>
          Skip for Now
        </Button>
        <Button
          type="primary"
          onClick={handleSendInvitations}
          loading={isSending}
          style={{
            flex: 2,
            height: 44,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
          }}
        >
          {pendingInvites.length > 0
            ? `Send ${pendingInvites.length} Invitation(s)`
            : 'Continue'}
        </Button>
      </div>
    </div>
  );
}

