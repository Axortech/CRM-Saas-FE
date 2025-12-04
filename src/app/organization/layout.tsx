'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, Spin } from 'antd';
import {
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';
import { useOrganizationStore } from '@/store/organizationStore';
import MainLayout from '@/components/layouts/MainLayout';

interface OrganizationLayoutProps {
  children: React.ReactNode;
}

export default function OrganizationLayout({ children }: OrganizationLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  const currentOrg = useOrganizationStore((state) => state.currentOrganization);
  const initializeOrganization = useOrganizationStore((state) => state.initializeOrganization);
  const isOrgHydrated = useOrganizationStore((state) => state.isHydrated);

  useEffect(() => {
    initializeAuth();
    initializeOrganization();
  }, [initializeAuth, initializeOrganization]);

  useEffect(() => {
    if (isHydrated && isOrgHydrated) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      setIsLoading(false);
    }
  }, [isAuthenticated, isHydrated, isOrgHydrated, router]);

  const menuItems = [
    {
      key: '/organization/settings',
      icon: <SettingOutlined />,
      label: 'General Settings',
    },
    {
      key: '/organization/teams',
      icon: <TeamOutlined />,
      label: 'Teams',
    },
    {
      key: '/organization/members',
      icon: <UserOutlined />,
      label: 'Members',
    },
    {
      key: '/organization/roles',
      icon: <SafetyOutlined />,
      label: 'Roles & Permissions',
    },
  ];

  const handleMenuClick = (e: { key: string }) => {
    router.push(e.key);
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <MainLayout>
      <div style={{ padding: 24, minHeight: '100vh' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>
            Organization Settings
          </h1>
          <p style={{ margin: '8px 0 0', color: '#8c8c8c' }}>
            {currentOrg?.name || 'Manage your organization'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 24 }}>
          {/* Sidebar Menu */}
          <div style={{ width: 240, flexShrink: 0 }}>
            <Menu
              mode="inline"
              selectedKeys={[pathname]}
              items={menuItems}
              onClick={handleMenuClick}
              style={{
                background: '#fff',
                borderRadius: 8,
                border: '1px solid #f0f0f0',
              }}
            />
          </div>

          {/* Content Area */}
          <div
            style={{
              flex: 1,
              background: '#fff',
              borderRadius: 8,
              border: '1px solid #f0f0f0',
              padding: 24,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}



