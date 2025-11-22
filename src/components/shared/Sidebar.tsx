'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Tooltip, Avatar, Spin } from 'antd';
import { useProfileQuery } from '@/services/queries/auth';
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
  MenuUnfoldOutlined,
  UserOutlined
} from '@ant-design/icons';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: profileData, isLoading } = useProfileQuery();
  const [isMounted, setIsMounted] = React.useState(false);

  // Type assertion to handle avatar_url that exists in API but not in type
  const user = profileData as typeof profileData & { avatar_url?: string };

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

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
    router.push(path);
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (user?.first_name) {
      const firstInitial = user.first_name.charAt(0).toUpperCase();
      const lastInitial = user.last_name ? user.last_name.charAt(0).toUpperCase() : '';
      return firstInitial + lastInitial;
    }
    return 'U';
  };

  // Get full name for tooltip
  const getFullName = () => {
    const firstName = user?.first_name || '';
    const lastName = user?.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'User';
  };

  return (
    <div
      style={{
        width: collapsed ? '80px' : '240px',
        height: '100vh',
        backgroundColor: '#fff',
        borderRight: '1px solid #f0f0f0',
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
          padding: '16px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight: '64px',
        }}
      >
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#000',
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
            <span style={{ fontSize: '18px', fontWeight: '600' }}>Influmo</span>
          </div>
        )}
        {collapsed && (
          <div
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#000',
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
        )}
      </div>

      {/* Collapse Button */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: '8px',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#595959',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>

      {/* Main Menu Items */}
      <div style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
        {menuItems.map((item, index) => {
          const isActive = pathname === item.path;
          return (
            <Tooltip 
              key={index} 
              title={collapsed ? item.label : ''} 
              placement="right"
            >
              <div
                onClick={() => handleNavigation(item.path)}
                style={{
                  padding: collapsed ? '12px 8px' : '12px 16px',
                  margin: collapsed ? '4px 8px' : '4px 12px',
                  display: 'flex',
                  flexDirection: collapsed ? 'column' : 'row',
                  alignItems: 'center',
                  gap: collapsed ? '4px' : '12px',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  backgroundColor: isActive ? '#e6f4ff' : 'transparent',
                  color: isActive ? '#1677ff' : '#595959',
                  fontSize: '13px',
                  fontWeight: isActive ? '500' : '400',
                  transition: 'all 0.2s ease',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = '#f5f5f5';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span 
                  style={{ 
                    fontSize: '20px', 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {item.icon}
                </span>
                <span 
                  style={{ 
                    fontSize: collapsed ? '10px' : '14px',
                    textAlign: collapsed ? 'center' : 'left',
                    lineHeight: collapsed ? '1.2' : '1.5',
                    whiteSpace: collapsed ? 'normal' : 'nowrap',
                    width: collapsed ? '100%' : 'auto'
                  }}
                >
                  {item.label}
                </span>
                {isActive && !collapsed && (
                  <div
                    style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      backgroundColor: '#1677ff',
                      marginLeft: 'auto',
                    }}
                  />
                )}
              </div>
            </Tooltip>
          );
        })}
      </div>

      {/* Bottom Menu Items */}
      <div style={{ padding: '16px 0', borderTop: '1px solid #f0f0f0' }}>
        {bottomItems.map((item, index) => {
          const isActive = pathname === item.path;
          return (
            <Tooltip 
              key={index} 
              title={collapsed ? item.label : ''} 
              placement="right"
            >
              <div
                onClick={() => handleNavigation(item.path)}
                style={{
                  padding: collapsed ? '12px 8px' : '12px 16px',
                  margin: collapsed ? '4px 8px' : '4px 12px',
                  display: 'flex',
                  flexDirection: collapsed ? 'column' : 'row',
                  alignItems: 'center',
                  gap: collapsed ? '4px' : '12px',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  backgroundColor: isActive ? '#e6f4ff' : 'transparent',
                  color: isActive ? '#1677ff' : '#595959',
                  fontSize: '13px',
                  fontWeight: isActive ? '500' : '400',
                  transition: 'all 0.2s ease',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = '#f5f5f5';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span 
                  style={{ 
                    fontSize: '20px', 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {item.icon}
                </span>
                <span 
                  style={{ 
                    fontSize: collapsed ? '10px' : '14px',
                    textAlign: collapsed ? 'center' : 'left',
                    lineHeight: collapsed ? '1.2' : '1.5',
                    whiteSpace: collapsed ? 'normal' : 'nowrap',
                    width: collapsed ? '100%' : 'auto'
                  }}
                >
                  {item.label}
                </span>
              </div>
            </Tooltip>
          );
        })}
      </div>

      {/* User Profile */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid #f0f0f0',
        }}
      >
        {!isMounted || isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '48px' }}>
            <Spin size="small" />
          </div>
        ) : (
          <Tooltip
            title={
              collapsed ? (
                <div>
                  <div style={{ fontWeight: 500 }}>{getFullName()}</div>
                  <div style={{ fontSize: '12px', opacity: 0.85 }}>{user?.email || 'user@example.com'}</div>
                </div>
              ) : null
            }
            placement="right"
          >
            <div
              onClick={() => handleNavigation('/profile')}
              style={{
                display: 'flex',
                flexDirection: collapsed ? 'column' : 'row',
                alignItems: 'center',
                gap: collapsed ? '6px' : '10px',
                cursor: 'pointer',
                padding: collapsed ? '8px 4px' : '8px',
                borderRadius: '8px',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Avatar
                size={collapsed ? 36 : 40}
                src={user?.avatar_url}
                icon={!user?.avatar_url && <UserOutlined />}
                style={{
                  backgroundColor: user?.avatar_url ? 'transparent' : '#1677ff',
                  flexShrink: 0,
                }}
              >
                {!user?.avatar_url && getUserInitials()}
              </Avatar>
              {!collapsed && (
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: '#262626',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {getFullName()}
                  </div>
                  <div 
                    style={{ 
                      fontSize: '12px', 
                      color: '#8c8c8c', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap' 
                    }}
                  >
                    {user?.email || 'user@example.com'}
                  </div>
                </div>
              )}
              {collapsed && (
                <div 
                  style={{ 
                    fontSize: '10px', 
                    color: '#595959',
                    textAlign: 'center',
                    lineHeight: '1.2',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Profile
                </div>
              )}
            </div>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default Sidebar;