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
  Empty,
  Checkbox,
  Card,
  Divider,
  Tooltip,
} from 'antd';
import { PlusOutlined, EditOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useOrganizationStore } from '@/store/organizationStore';
import { useRolesQuery, useCreateRoleMutation } from '@/services/queries/organization';
import { Role, Module, Permission, DEFAULT_PERMISSIONS } from '@/types/permissions';

const { Title, Text } = Typography;

const MODULES: { key: Module; label: string; description: string }[] = [
  { key: 'contacts', label: 'Contacts', description: 'Manage customer contacts' },
  { key: 'leads', label: 'Leads', description: 'Manage sales leads' },
  { key: 'deals', label: 'Deals', description: 'Manage sales deals' },
  { key: 'tasks', label: 'Tasks', description: 'Manage tasks and activities' },
  { key: 'reports', label: 'Reports', description: 'View and create reports' },
  { key: 'team', label: 'Team', description: 'Manage team members' },
  { key: 'settings', label: 'Settings', description: 'Organization settings' },
  { key: 'organization', label: 'Organization', description: 'Organization management' },
];

const PERMISSIONS: { key: Permission; label: string }[] = [
  { key: 'view', label: 'View' },
  { key: 'create', label: 'Create' },
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete' },
  { key: 'export', label: 'Export' },
  { key: 'admin', label: 'Admin' },
];

export default function RolesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Record<Module, Permission[]>>(
    {} as Record<Module, Permission[]>
  );
  const [form] = Form.useForm();

  const currentOrg = useOrganizationStore((state) => state.currentOrganization);
  const { data: roles = [], isLoading, refetch } = useRolesQuery(currentOrg?.id || '');
  const createRoleMutation = useCreateRoleMutation();

  const handleOpenModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setPermissions(role.permissions);
      form.setFieldsValue({
        name: role.name,
        description: role.description,
      });
    } else {
      setEditingRole(null);
      // Initialize with member permissions as default
      setPermissions(DEFAULT_PERMISSIONS.member);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
    form.resetFields();
  };

  const handlePermissionChange = (module: Module, permission: Permission, checked: boolean) => {
    setPermissions((prev) => {
      const current = prev[module] || [];
      if (checked) {
        return { ...prev, [module]: [...current, permission] };
      } else {
        return { ...prev, [module]: current.filter((p) => p !== permission) };
      }
    });
  };

  const handleSubmit = async (values: { name: string; description: string }) => {
    try {
      await createRoleMutation.mutateAsync({
        name: values.name,
        description: values.description,
        permissions,
        is_default: false,
        is_system: false,
      });
      message.success('Role created successfully!');
      handleCloseModal();
      refetch();
    } catch (error) {
      message.error('Failed to create role');
    }
  };

  const columns = [
    {
      title: 'Role',
      key: 'role',
      render: (_: any, record: Role) => (
        <div>
          <Space>
            <Text strong>{record.name}</Text>
            {record.is_system && <Tag>System</Tag>}
            {record.is_default && <Tag color="blue">Default</Tag>}
          </Space>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.description}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Permissions',
      key: 'permissions',
      render: (_: any, record: Role) => {
        const permissionCount = Object.values(record.permissions).flat().length;
        const maxPermissions = MODULES.length * PERMISSIONS.length;
        return (
          <Tooltip
            title={
              <div>
                {MODULES.map((mod) => {
                  const perms = record.permissions[mod.key] || [];
                  if (perms.length === 0) return null;
                  return (
                    <div key={mod.key}>
                      <strong>{mod.label}:</strong> {perms.join(', ')}
                    </div>
                  );
                })}
              </div>
            }
          >
            <Tag color={permissionCount === maxPermissions ? 'green' : 'default'}>
              {permissionCount} / {maxPermissions} permissions
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_: any, record: Role) =>
        !record.is_system && (
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          />
        ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Roles & Permissions
          </Title>
          <Text type="secondary">
            Define what each role can do in your organization
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Create Role
        </Button>
      </div>

      {roles.length === 0 && !isLoading ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No roles defined"
          style={{ padding: '60px 0' }}
        />
      ) : (
        <Table
          columns={columns}
          dataSource={roles}
          rowKey="id"
          loading={isLoading}
          pagination={false}
        />
      )}

      {/* Create/Edit Modal */}
      <Modal
        title={editingRole ? 'Edit Role' : 'Create Role'}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={700}
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
            label="Role Name"
            rules={[{ required: true, message: 'Please enter role name' }]}
          >
            <Input placeholder="e.g., Sales Manager" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea placeholder="What can this role do?" rows={2} />
          </Form.Item>

          <Divider>Permissions</Divider>

          <div style={{ maxHeight: 400, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>
                    Module
                  </th>
                  {PERMISSIONS.map((perm) => (
                    <th
                      key={perm.key}
                      style={{
                        textAlign: 'center',
                        padding: '8px',
                        borderBottom: '1px solid #f0f0f0',
                        fontSize: 12,
                      }}
                    >
                      {perm.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODULES.map((mod) => (
                  <tr key={mod.key}>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f0f0f0' }}>
                      <div style={{ fontWeight: 500 }}>{mod.label}</div>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>{mod.description}</div>
                    </td>
                    {PERMISSIONS.map((perm) => (
                      <td
                        key={perm.key}
                        style={{
                          textAlign: 'center',
                          padding: '8px',
                          borderBottom: '1px solid #f0f0f0',
                        }}
                      >
                        <Checkbox
                          checked={(permissions[mod.key] || []).includes(perm.key)}
                          onChange={(e) =>
                            handlePermissionChange(mod.key, perm.key, e.target.checked)
                          }
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={handleCloseModal}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createRoleMutation.isLoading}
              >
                {editingRole ? 'Save Changes' : 'Create Role'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

