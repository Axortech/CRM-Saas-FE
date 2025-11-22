import React, { useState } from 'react';
import {
  HomeOutlined,
  RocketOutlined,
  CalendarOutlined,
  FileTextOutlined,
  TeamOutlined,
  LineChartOutlined,
  SettingOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activePath, setActivePath] = useState('/dashboard');

  const menuItems = [
    { icon: <HomeOutlined />, label: 'Dashboard', path: '/dashboard' },
    { icon: <RocketOutlined />, label: 'Campaign', path: '/campaign' },
    { icon: <CalendarOutlined />, label: 'Calendar', path: '/calendar' },
    { icon: <FileTextOutlined />, label: 'Documents', path: '/documents' },
    { icon: <TeamOutlined />, label: 'Team', path: '/team' },
    { icon: <LineChartOutlined />, label: 'Analytics', path: '/analytics' },
  ];

  const bottomItems = [
    { icon: <BellOutlined />, label: 'Notifications', path: '/notifications' },
    { icon: <SettingOutlined />, label: 'Settings', path: '/settings' },
  ];

  const handleNavigation = (path: string) => {
    setActivePath(path);
  };

  const sidebarWidth = collapsed ? '80px' : '100px';

  return (
    <div
      style={{
        width: sidebarWidth,
        height: '100vh',
        backgroundColor: '#fafafa',
        borderRight: '1px solid #e8e8e8',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 8px',
          borderBottom: '1px solid #e8e8e8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '64px',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            backgroundColor: '#1a1a1a',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          In
        </div>
      </div>

      {/* Collapse Button */}
      <div
        style={{
          padding: '8px',
          borderBottom: '1px solid #e8e8e8',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            width: '44px',
            height: '44px',
            padding: '0',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
            fontSize: '16px',
            color: '#595959',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>

      {/* Main Menu Items */}
      <div
        style={{
          flex: 1,
          padding: '12px 8px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {menuItems.map((item, index) => {
          const isActive = activePath === item.path;
          return (
            <div
              key={index}
              onClick={() => handleNavigation(item.path)}
              style={{
                padding: '12px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                borderRadius: '8px',
                backgroundColor: isActive ? '#e6f4ff' : 'transparent',
                color: isActive ? '#1890ff' : '#8c8c8c',
                transition: 'all 0.2s ease',
                textAlign: 'center',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = '#f5f5f5';
                e.currentTarget.style.color = isActive ? '#1890ff' : '#262626';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = isActive ? '#1890ff' : '#8c8c8c';
              }}
            >
              <span style={{ fontSize: '20px', display: 'flex', alignItems: 'center' }}>
                {item.icon}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: isActive ? '500' : '400',
                  lineHeight: '1.2',
                  maxWidth: '80px',
                  wordBreak: 'break-word',
                }}
              >
                {item.label}
              </span>
              {isActive && (
                <div
                  style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor: '#1890ff',
                    position: 'absolute',
                    bottom: '4px',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Menu Items */}
      <div
        style={{
          padding: '12px 8px',
          borderTop: '1px solid #e8e8e8',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {bottomItems.map((item, index) => {
          const isActive = activePath === item.path;
          return (
            <div
              key={index}
              onClick={() => handleNavigation(item.path)}
              style={{
                padding: '12px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                borderRadius: '8px',
                backgroundColor: isActive ? '#e6f4ff' : 'transparent',
                color: isActive ? '#1890ff' : '#8c8c8c',
                transition: 'all 0.2s ease',
                textAlign: 'center',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = '#f5f5f5';
                e.currentTarget.style.color = isActive ? '#1890ff' : '#262626';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = isActive ? '#1890ff' : '#8c8c8c';
              }}
            >
              <span style={{ fontSize: '20px', display: 'flex', alignItems: 'center' }}>
                {item.icon}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: isActive ? '500' : '400',
                  lineHeight: '1.2',
                  maxWidth: '80px',
                  wordBreak: 'break-word',
                }}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* User Profile */}
      <div
        style={{
          padding: '12px 8px',
          borderTop: '1px solid #e8e8e8',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: '600',
            color: '#595959',
          }}
        >
          U
        </div>
      </div>
    </div>
  );
};

export default Sidebar;