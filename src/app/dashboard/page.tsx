'use client';

import React, { useEffect } from 'react';
import {
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Button,
  List,
  Avatar,
  Tag,
  Space,
  Progress,
  Spin,
} from 'antd';
import {
  UserOutlined,
  RocketOutlined,
  DollarOutlined,
  RiseOutlined,
  PlusOutlined,
  ArrowRightOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useOrganizationStore } from '@/store/organizationStore';
import { useProfileQuery } from '@/services/queries/auth';
import { useContactStatsQuery, useContactsQuery } from '@/services/queries/contacts';
import { useLeadStatsQuery, useLeadsQuery } from '@/services/queries/leads';

const { Title, Text } = Typography;

const statusColors: Record<string, string> = {
  new: 'blue',
  contacted: 'orange',
  qualified: 'green',
  unqualified: 'red',
  converted: 'purple',
};

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const currentOrg = useOrganizationStore((state) => state.currentOrganization);
  const initializeOrganization = useOrganizationStore((state) => state.initializeOrganization);

  useEffect(() => {
    initializeOrganization();
  }, [initializeOrganization]);

  // Fetch profile data
  const { data: profileData, isLoading: profileLoading } = useProfileQuery();

  // Fetch CRM stats
  const { data: contactStats, isLoading: contactStatsLoading } = useContactStatsQuery();
  const { data: leadStats, isLoading: leadStatsLoading } = useLeadStatsQuery();

  // Fetch recent data
  const { data: recentContacts } = useContactsQuery({ page: 1, page_size: 5 });
  const { data: recentLeads } = useLeadsQuery({ page: 1, page_size: 5 });

  // Update store with fresh profile data
  useEffect(() => {
    if (profileData && profileData !== user) {
      setUser(profileData);
    }
  }, [profileData, user, setUser]);

  const displayUser = profileData || user;
  const isLoading = profileLoading || contactStatsLoading || leadStatsLoading;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Spin size="large" tip="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div style={{ padding: 24, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ margin: 0 }}>
          Welcome back, {displayUser?.first_name}!
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          {currentOrg?.name ? `${currentOrg.name} Dashboard` : 'Your CRM Dashboard'}
        </Text>
      </div>

      {/* Quick Actions */}
      <Card size="small" style={{ marginBottom: 24 }}>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/contacts/new')}
          >
            New Contact
          </Button>
          <Button icon={<RocketOutlined />} onClick={() => router.push('/leads/new')}>
            New Lead
          </Button>
          <Button icon={<TeamOutlined />} onClick={() => router.push('/organization/members')}>
            Invite Team
          </Button>
        </Space>
      </Card>

      {/* Stats Overview */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Contacts"
              value={contactStats?.total || 0}
              prefix={<UserOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff' }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {contactStats?.active || 0} active
              </Text>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Leads"
              value={leadStats?.total || 0}
              prefix={<RocketOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {leadStats?.by_status?.qualified || 0} qualified
              </Text>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pipeline Value"
              value={leadStats?.total_estimated_value || 0}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
              formatter={(value) => `$${Number(value).toLocaleString()}`}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Estimated revenue
              </Text>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title="Conversion Rate"
              value={leadStats?.conversion_rate || 0}
              prefix={<RiseOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
              precision={1}
              suffix="%"
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Leads to customers
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Lead Pipeline & Recent Activity */}
      <Row gutter={[24, 24]}>
        {/* Lead Pipeline */}
        <Col xs={24} lg={12}>
          <Card
            title="Lead Pipeline"
            extra={
              <Button type="link" onClick={() => router.push('/leads')}>
                View All <ArrowRightOutlined />
              </Button>
            }
          >
            <div style={{ marginBottom: 16 }}>
              {['new', 'contacted', 'qualified', 'converted'].map((status) => {
                const count = leadStats?.by_status?.[status as keyof typeof leadStats.by_status] || 0;
                const total = leadStats?.total || 1;
                const percent = Math.round((count / total) * 100);
                return (
                  <div key={status} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Space>
                        <Tag color={statusColors[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Tag>
                      </Space>
                      <Text>{count} leads</Text>
                    </div>
                    <Progress
                      percent={percent}
                      strokeColor={statusColors[status] === 'blue' ? '#1677ff' : 
                        statusColors[status] === 'orange' ? '#fa8c16' :
                        statusColors[status] === 'green' ? '#52c41a' : '#722ed1'}
                      showInfo={false}
                      size="small"
                    />
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>

        {/* Recent Leads */}
        <Col xs={24} lg={12}>
          <Card
            title="Recent Leads"
            extra={
              <Button type="link" onClick={() => router.push('/leads')}>
                View All <ArrowRightOutlined />
              </Button>
            }
          >
            <List
              itemLayout="horizontal"
              dataSource={recentLeads?.data || []}
              renderItem={(lead) => (
                <List.Item
                  style={{ cursor: 'pointer' }}
                  onClick={() => router.push(`/leads/${lead.id}`)}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{ backgroundColor: '#722ed1' }}>
                        {lead.name.charAt(0)}
                      </Avatar>
                    }
                    title={
                      <Space>
                        <span>{lead.name}</span>
                        <Tag color={statusColors[lead.status]} style={{ fontSize: 11 }}>
                          {lead.status}
                        </Tag>
                      </Space>
                    }
                    description={lead.company || lead.email}
                  />
                  {lead.estimated_value && (
                    <Text strong>${lead.estimated_value.toLocaleString()}</Text>
                  )}
                </List.Item>
              )}
              locale={{ emptyText: 'No leads yet' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Contacts */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card
            title="Recent Contacts"
            extra={
              <Button type="link" onClick={() => router.push('/contacts')}>
                View All <ArrowRightOutlined />
              </Button>
            }
          >
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
              dataSource={recentContacts?.data || []}
              renderItem={(contact) => (
                <List.Item>
                  <Card
                    size="small"
                    hoverable
                    onClick={() => router.push(`/contacts/${contact.id}`)}
                    style={{ textAlign: 'center' }}
                  >
                    <Avatar
                      size={48}
                      src={contact.avatar_url}
                      style={{ backgroundColor: '#1677ff', marginBottom: 8 }}
                    >
                      {!contact.avatar_url && `${contact.first_name?.charAt(0)}${contact.last_name?.charAt(0)}`}
                    </Avatar>
                    <div style={{ fontWeight: 500 }}>
                      {contact.first_name} {contact.last_name}
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {contact.company || contact.email}
                    </Text>
                  </Card>
                </List.Item>
              )}
              locale={{ emptyText: 'No contacts yet' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
