'use client';

import React from 'react';
import { Card, Tag, Typography, Progress, Space, Spin, Empty, message } from 'antd';
import { DollarOutlined, UserOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useLeadsByStatusQuery, useUpdateLeadStatusMutation } from '@/services/queries/leads';
import { Lead, LeadStatus, Priority } from '@/types/crm';

const { Text } = Typography;

const statusConfig: Record<LeadStatus, { title: string; color: string; bgColor: string }> = {
  new: { title: 'New', color: '#1677ff', bgColor: '#e6f4ff' },
  contacted: { title: 'Contacted', color: '#fa8c16', bgColor: '#fff7e6' },
  qualified: { title: 'Qualified', color: '#52c41a', bgColor: '#f6ffed' },
  unqualified: { title: 'Unqualified', color: '#ff4d4f', bgColor: '#fff2f0' },
  converted: { title: 'Converted', color: '#722ed1', bgColor: '#f9f0ff' },
};

const priorityColors: Record<Priority, string> = {
  low: 'default',
  medium: 'blue',
  high: 'orange',
  urgent: 'red',
};

interface LeadCardProps {
  lead: Lead;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, lead: Lead) => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onClick, onDragStart }) => {
  return (
    <Card
      size="small"
      style={{
        marginBottom: 8,
        cursor: 'pointer',
        border: '1px solid #f0f0f0',
        borderRadius: 8,
      }}
      bodyStyle={{ padding: 12 }}
      onClick={onClick}
      draggable
      onDragStart={(e) => onDragStart(e, lead)}
    >
      <div style={{ marginBottom: 8 }}>
        <Text strong style={{ fontSize: 14 }}>{lead.name}</Text>
      </div>
      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
        {lead.company}
      </Text>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Progress
          percent={lead.score || 0}
          size="small"
          style={{ width: 80 }}
          strokeColor={
            (lead.score || 0) >= 70 ? '#52c41a' : (lead.score || 0) >= 40 ? '#faad14' : '#ff4d4f'
          }
          format={(p) => <span style={{ fontSize: 11 }}>{p}</span>}
        />
        <Tag color={priorityColors[lead.priority]} style={{ fontSize: 11, margin: 0 }}>
          {lead.priority}
        </Tag>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space size={4}>
          {lead.estimated_value && (
            <Tag icon={<DollarOutlined />} style={{ fontSize: 11 }}>
              {lead.estimated_value.toLocaleString()}
            </Tag>
          )}
        </Space>
        <Text type="secondary" style={{ fontSize: 11 }}>
          {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </Text>
      </div>
    </Card>
  );
};

interface KanbanColumnProps {
  status: LeadStatus;
  leads: Lead[];
  onCardClick: (lead: Lead) => void;
  onDragStart: (e: React.DragEvent, lead: Lead) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: LeadStatus) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  leads,
  onCardClick,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const config = statusConfig[status];
  const totalValue = leads.reduce((sum, l) => sum + (l.estimated_value || 0), 0);

  return (
    <div
      style={{
        flex: 1,
        minWidth: 280,
        maxWidth: 320,
        display: 'flex',
        flexDirection: 'column',
      }}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
    >
      {/* Column Header */}
      <div
        style={{
          background: config.bgColor,
          padding: '12px 16px',
          borderRadius: '8px 8px 0 0',
          borderBottom: `2px solid ${config.color}`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Text strong style={{ color: config.color }}>{config.title}</Text>
            <Tag style={{ borderRadius: 10 }}>{leads.length}</Tag>
          </Space>
          {totalValue > 0 && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              ${totalValue.toLocaleString()}
            </Text>
          )}
        </div>
      </div>

      {/* Column Content */}
      <div
        style={{
          flex: 1,
          background: '#fafafa',
          padding: 8,
          borderRadius: '0 0 8px 8px',
          minHeight: 400,
          maxHeight: 'calc(100vh - 400px)',
          overflowY: 'auto',
        }}
      >
        {leads.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>No leads</Text>
          </div>
        ) : (
          leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onClick={() => onCardClick(lead)}
              onDragStart={onDragStart}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default function LeadsKanban() {
  const router = useRouter();
  const { data: leadsByStatus, isLoading, refetch } = useLeadsByStatusQuery();
  const updateStatusMutation = useUpdateLeadStatusMutation();

  const handleCardClick = (lead: Lead) => {
    router.push(`/leads/${lead.id}`);
  };

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    e.dataTransfer.setData('leadId', lead.id);
    e.dataTransfer.setData('currentStatus', lead.status);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, newStatus: LeadStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    const currentStatus = e.dataTransfer.getData('currentStatus') as LeadStatus;

    if (currentStatus === newStatus) return;

    try {
      await updateStatusMutation.mutateAsync({ id: leadId, status: newStatus });
      message.success(`Lead moved to ${statusConfig[newStatus].title}`);
      refetch();
    } catch (error) {
      message.error('Failed to update lead status');
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!leadsByStatus) {
    return <Empty description="No leads found" />;
  }

  const statuses: LeadStatus[] = ['new', 'contacted', 'qualified', 'unqualified', 'converted'];

  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        overflowX: 'auto',
        paddingBottom: 16,
      }}
    >
      {statuses.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          leads={leadsByStatus[status] || []}
          onCardClick={handleCardClick}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
}

