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
  message,
  Typography,
  Popconfirm,
  Empty,
  ColorPicker,
  Avatar,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined } from '@ant-design/icons';
import { useOrganizationStore } from '@/store/organizationStore';
import {
  useTeamsQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
} from '@/services/queries/organization';
import { Team, CreateTeamRequest, UpdateTeamRequest } from '@/types/organization';
import type { Color } from 'antd/es/color-picker';

const { Title, Text } = Typography;

export default function TeamsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [selectedColor, setSelectedColor] = useState('#1677ff');
  const [form] = Form.useForm();

  const currentOrg = useOrganizationStore((state) => state.currentOrganization);
  const { data: teams = [], isLoading, refetch } = useTeamsQuery(currentOrg?.id || '');
  const createTeamMutation = useCreateTeamMutation();
  const updateTeamMutation = useUpdateTeamMutation();
  const deleteTeamMutation = useDeleteTeamMutation();

  const handleOpenModal = (team?: Team) => {
    if (team) {
      setEditingTeam(team);
      setSelectedColor(team.color || '#1677ff');
      form.setFieldsValue({
        name: team.name,
        description: team.description,
      });
    } else {
      setEditingTeam(null);
      setSelectedColor('#1677ff');
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTeam(null);
    form.resetFields();
  };

  const handleSubmit = async (values: { name: string; description?: string }) => {
    try {
      if (editingTeam) {
        await updateTeamMutation.mutateAsync({
          id: editingTeam.id,
          data: {
            name: values.name,
            description: values.description,
            color: selectedColor,
          },
        });
        message.success('Team updated successfully!');
      } else {
        await createTeamMutation.mutateAsync({
          name: values.name,
          description: values.description,
          color: selectedColor,
        });
        message.success('Team created successfully!');
      }
      handleCloseModal();
      refetch();
    } catch (error) {
      message.error('Operation failed. Please try again.');
    }
  };

  const handleDelete = async (teamId: string) => {
    try {
      await deleteTeamMutation.mutateAsync(teamId);
      message.success('Team deleted successfully!');
      refetch();
    } catch (error) {
      message.error('Failed to delete team');
    }
  };

  const columns = [
    {
      title: 'Team',
      key: 'team',
      render: (_: any, record: Team) => (
        <Space>
          <Avatar
            size={32}
            style={{ backgroundColor: record.color }}
            icon={<TeamOutlined />}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            {record.description && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.description}
              </Text>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: 'Members',
      dataIndex: 'member_count',
      key: 'member_count',
      width: 100,
      render: (count: number) => <Tag>{count} members</Tag>,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
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
      width: 120,
      render: (_: any, record: Team) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          />
          <Popconfirm
            title="Delete team?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          Teams
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Add Team
        </Button>
      </div>

      {teams.length === 0 && !isLoading ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No teams created yet"
          style={{ padding: '60px 0' }}
        >
          <Button type="primary" onClick={() => handleOpenModal()}>
            Create Your First Team
          </Button>
        </Empty>
      ) : (
        <Table
          columns={columns}
          dataSource={teams}
          rowKey="id"
          loading={isLoading}
          pagination={false}
        />
      )}

      {/* Create/Edit Modal */}
      <Modal
        title={editingTeam ? 'Edit Team' : 'Create Team'}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={480}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="name"
            label="Team Name"
            rules={[{ required: true, message: 'Please enter team name' }]}
          >
            <Input placeholder="e.g., Sales Team" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea
              placeholder="Brief description of this team"
              rows={2}
            />
          </Form.Item>

          <Form.Item label="Team Color">
            <ColorPicker
              value={selectedColor}
              onChange={(color: Color) => setSelectedColor(color.toHexString())}
              showText
              presets={[
                {
                  label: 'Preset Colors',
                  colors: ['#1677ff', '#52c41a', '#faad14', '#eb2f96', '#722ed1', '#13c2c2', '#fa541c', '#2f54eb'],
                },
              ]}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={handleCloseModal}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createTeamMutation.isLoading || updateTeamMutation.isLoading}
              >
                {editingTeam ? 'Save Changes' : 'Create Team'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

