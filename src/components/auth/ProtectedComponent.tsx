'use client';

import React from 'react';
import { Tooltip } from 'antd';
import { usePermission } from '@/hooks/usePermission';
import { Module, Permission } from '@/types/permissions';

interface ProtectedComponentProps {
  children: React.ReactNode;
  module: Module;
  permission: Permission | Permission[];
  requireAll?: boolean; // If true, requires all permissions; if false, requires any
  fallback?: React.ReactNode;
  hideOnUnauthorized?: boolean;
  showTooltip?: boolean;
  tooltipMessage?: string;
}

/**
 * Component that conditionally renders children based on user permissions
 */
export const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
  children,
  module,
  permission,
  requireAll = false,
  fallback = null,
  hideOnUnauthorized = true,
  showTooltip = false,
  tooltipMessage = "You don't have permission to perform this action",
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();

  const permissions = Array.isArray(permission) ? permission : [permission];

  const hasAccess = requireAll
    ? hasAllPermissions(module, permissions)
    : hasAnyPermission(module, permissions);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (hideOnUnauthorized) {
    return <>{fallback}</>;
  }

  // If showTooltip is true, wrap children in a disabled state with tooltip
  if (showTooltip) {
    return (
      <Tooltip title={tooltipMessage}>
        <span style={{ cursor: 'not-allowed', opacity: 0.5 }}>{children}</span>
      </Tooltip>
    );
  }

  return <>{fallback}</>;
};

/**
 * HOC for protecting entire components/pages
 */
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  module: Module,
  permission: Permission | Permission[],
  options?: {
    requireAll?: boolean;
    fallback?: React.ReactNode;
  }
) {
  const { requireAll = false, fallback = null } = options || {};

  const WithPermissionComponent: React.FC<P> = (props) => {
    return (
      <ProtectedComponent
        module={module}
        permission={permission}
        requireAll={requireAll}
        fallback={fallback}
        hideOnUnauthorized={true}
      >
        <WrappedComponent {...props} />
      </ProtectedComponent>
    );
  };

  WithPermissionComponent.displayName = `withPermission(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return WithPermissionComponent;
}

/**
 * Component for rendering different content based on permissions
 */
interface PermissionSwitchProps {
  module: Module;
  cases: {
    permission: Permission | Permission[];
    requireAll?: boolean;
    render: React.ReactNode;
  }[];
  fallback?: React.ReactNode;
}

export const PermissionSwitch: React.FC<PermissionSwitchProps> = ({
  module,
  cases,
  fallback = null,
}) => {
  const { hasAnyPermission, hasAllPermissions } = usePermission();

  for (const caseItem of cases) {
    const permissions = Array.isArray(caseItem.permission)
      ? caseItem.permission
      : [caseItem.permission];
    
    const hasAccess = caseItem.requireAll
      ? hasAllPermissions(module, permissions)
      : hasAnyPermission(module, permissions);

    if (hasAccess) {
      return <>{caseItem.render}</>;
    }
  }

  return <>{fallback}</>;
};

export default ProtectedComponent;

