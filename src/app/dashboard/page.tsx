'use client';

import { Typography, Button, Card, Row, Col, Space, Spin, Alert } from 'antd';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useLogoutMutation, useProfileQuery } from '@/services/queries/auth';
import { LogoutOutlined } from '@ant-design/icons';
import Sidebar from '@/components/shared/Sidebar';

const { Title, Text } = Typography;

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logoutMutation = useLogoutMutation();
  
  // Fetch profile data when dashboard loads
  const { data: profileData, isLoading, error } = useProfileQuery();

  // Update store with fresh profile data
  if (profileData && profileData !== user) {
    setUser(profileData);
  }
  console.log(profileData)

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    router.push('/login');
  };

  // Show loading state while fetching profile
  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Spin size="large" tip="Loading your profile..." />
      </div>
    );
  }

  // Show error if profile fetch failed
  if (error) {
    return (
      <div style={{ padding: '24px', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', paddingTop: 64 }}>
          <Alert
            message="Error Loading Profile"
            description="Failed to load your profile. Please try again."
            type="error"
            showIcon
            action={
              <Button size="small" danger onClick={() => window.location.reload()}>
                Retry
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const displayUser = profileData || user;

  return (
    <div style={{ padding: '24px', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Sidebar/>
            <Title level={2}>Welcome, {displayUser?.first_name}!</Title>
            <Text type="secondary">This is your CRM dashboard</Text>
          </div>
          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            loading={logoutMutation.isLoading}
          >
            Logout
          </Button>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={24} md={8}>
            <Card>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>User Email</Text>
                <Text>{displayUser?.email}</Text>
              </Space>
            </Card>
          </Col>

          <Col xs={24} sm={24} md={8}>
            <Card>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Full Name</Text>
                <Text>{displayUser?.first_name} {displayUser?.last_name}</Text>
              </Space>
            </Card>
          </Col>

          <Col xs={24} sm={24} md={8}>
            <Card>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Account Status</Text>
                <Text type={displayUser?.is_active ? "success" : "danger"}>
                  {displayUser?.is_active ? 'Active' : 'Inactive'}
                </Text>
              </Space>
            </Card>
          </Col>

          <Col xs={24}>
            <Card title="User Information">
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div>
                  <Text type="secondary">User ID: </Text>
                  <Text strong>{displayUser?.id}</Text>
                </div>
                <div>
                  <Text type="secondary">Account Created: </Text>
                  <Text strong>
                    {displayUser?.created_at 
                      ? new Date(displayUser.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'N/A'
                    }
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}