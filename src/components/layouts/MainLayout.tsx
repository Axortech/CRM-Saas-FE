'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/shared/Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main
        style={{
          marginLeft: collapsed ? '64px' : '240px',
          flex: 1,
          backgroundColor: '#f0f2f5',
          transition: 'margin-left 0.3s ease',
          width: '100%',
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default MainLayout;