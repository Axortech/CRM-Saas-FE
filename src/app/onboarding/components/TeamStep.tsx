'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, List, Tag, Space, ColorPicker } from 'antd';
import { PlusOutlined, DeleteOutlined, TeamOutlined } from '@ant-design/icons';
import { useCreateTeamMutation, useTeamsQuery } from '@/services/queries/organization';
import { useOrganizationStore } from '@/store/organizationStore';
import { CreateTeamRequest } from '@/types/organization';
import type { Color } from 'antd/es/color-picker';

const { Title, Text } = Typography;

interface TeamStepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const defaultColors = ['#1677ff', '#52c41a', '#faad14', '#eb2f96', '#722ed1', '#13c2c2'];

export default function TeamStep({ onNext, onBack, onSkip }: TeamStepProps) {
  const [form] = Form.useForm();
  const [selectedColor, setSelectedColor] = useState(defaultColors[0]);

  const currentOrg = useOrganizationStore((state) => state.currentOrganization);
  const createTeamMutation = useCreateTeamMutation();
  const { data: teams = [], refetch } = useTeamsQuery(currentOrg?.id || '');

  const handleAddTeam = async (values: { name: string; description?: string }) => {
    if (!currentOrg) return;

    try {
      await createTeamMutation.mutateAsync({
        name: values.name,
        description: values.description,
        color: selectedColor,
      });
      message.success('Team created!');
      form.resetFields();
      setSelectedColor(defaultColors[teams.length % defaultColors.length]);
      refetch();
    } catch (error) {
      message.error('Failed to create team');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <Title level={4} style={{ marginBottom: 8 }}>
          Create Teams (Optional)
        </Title>
        <Text type="secondary">
          Organize your organization into teams like Sales, Marketing, Support, etc.
        </Text>
      </div>

      {/* Team Creation Form */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleAddTeam}
        requiredMark={false}
      >
        <div style={{ display: 'flex', gap: 12 }}>
          <Form.Item
            name="name"
            style={{ flex: 1, marginBottom: 12 }}
            rules={[{ required: true, message: 'Enter team name' }]}
          >
            <Input
              prefix={<TeamOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Team name (e.g., Sales)"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 12 }}>
            <ColorPicker
              value={selectedColor}
              onChange={(color: Color) => setSelectedColor(color.toHexString())}
              presets={[{ label: 'Preset', colors: defaultColors }]}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 12 }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<PlusOutlined />}
              loading={createTeamMutation.isLoading}
            >
              Add
            </Button>
          </Form.Item>
        </div>

        <Form.Item name="description" style={{ marginBottom: 16 }}>
          <Input.TextArea
            placeholder="Team description (optional)"
            autoSize={{ minRows: 1, maxRows: 2 }}
          />
        </Form.Item>
      </Form>

      {/* Teams List */}
      {teams.length > 0 && (
        <div
          style={{
            background: '#f5f5f5',
            borderRadius: 8,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <Text strong style={{ marginBottom: 12, display: 'block' }}>
            Created Teams ({teams.length})
          </Text>
          <List
            dataSource={teams}
            renderItem={(team) => (
              <List.Item style={{ padding: '8px 0' }}>
                <Space>
                  <Tag color={team.color}>{team.name}</Tag>
                  {team.description && (
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      {team.description}
                    </Text>
                  )}
                </Space>
              </List.Item>
            )}
          />
        </div>
      )}

      {teams.length === 0 && (
        <div
          style={{
            background: '#f5f5f5',
            borderRadius: 8,
            padding: 24,
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          <TeamOutlined style={{ fontSize: 32, color: '#bfbfbf', marginBottom: 8 }} />
          <div>
            <Text type="secondary">No teams created yet</Text>
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
          onClick={onNext}
          style={{
            flex: 2,
            height: 44,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
          }}
        >
          {teams.length > 0 ? 'Continue' : 'Skip & Continue'}
        </Button>
      </div>
    </div>
  );
}



