'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spin } from 'antd';
import { useAuthStore } from '@/store/authStore';
import { useOrganizationStore } from '@/store/organizationStore';
import MainLayout from '@/components/layouts/MainLayout';

interface LeadsLayoutProps {
  children: React.ReactNode;
}

export default function LeadsLayout({ children }: LeadsLayoutProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

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

  return <MainLayout>{children}</MainLayout>;
}

