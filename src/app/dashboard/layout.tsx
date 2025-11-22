'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}