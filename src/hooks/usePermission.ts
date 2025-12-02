import { useCallback } from 'react';
import { useOrganizationStore } from '@/store/organizationStore';
import { Module, Permission } from '@/types/permissions';

/**
 * Hook to check if the current user has a specific permission for a module
 */
export const usePermission = () => {
  const currentMember = useOrganizationStore((state) => state.currentMember);

  /**
   * Check if user has a specific permission for a module
   */
  const hasPermission = useCallback(
    (module: Module, permission: Permission): boolean => {
      if (!currentMember?.role) {
        // If no member data, check if we're in mock mode and assume full access
        if (typeof window !== 'undefined') {
          const mockMode = localStorage.getItem('mock_organizations');
          // In mock mode without member data, grant access for demo purposes
          if (mockMode) return true;
        }
        return false;
      }

      const modulePermissions = currentMember.role.permissions[module] || [];
      return modulePermissions.includes(permission) || modulePermissions.includes('admin');
    },
    [currentMember]
  );

  /**
   * Check if user has any of the specified permissions for a module
   */
  const hasAnyPermission = useCallback(
    (module: Module, permissions: Permission[]): boolean => {
      return permissions.some((permission) => hasPermission(module, permission));
    },
    [hasPermission]
  );

  /**
   * Check if user has all of the specified permissions for a module
   */
  const hasAllPermissions = useCallback(
    (module: Module, permissions: Permission[]): boolean => {
      return permissions.every((permission) => hasPermission(module, permission));
    },
    [hasPermission]
  );

  /**
   * Check if user can view a module
   */
  const canView = useCallback(
    (module: Module): boolean => hasPermission(module, 'view'),
    [hasPermission]
  );

  /**
   * Check if user can create in a module
   */
  const canCreate = useCallback(
    (module: Module): boolean => hasPermission(module, 'create'),
    [hasPermission]
  );

  /**
   * Check if user can edit in a module
   */
  const canEdit = useCallback(
    (module: Module): boolean => hasPermission(module, 'edit'),
    [hasPermission]
  );

  /**
   * Check if user can delete in a module
   */
  const canDelete = useCallback(
    (module: Module): boolean => hasPermission(module, 'delete'),
    [hasPermission]
  );

  /**
   * Check if user can export from a module
   */
  const canExport = useCallback(
    (module: Module): boolean => hasPermission(module, 'export'),
    [hasPermission]
  );

  /**
   * Check if user has admin access to a module
   */
  const isAdmin = useCallback(
    (module: Module): boolean => hasPermission(module, 'admin'),
    [hasPermission]
  );

  /**
   * Get all permissions for a module
   */
  const getModulePermissions = useCallback(
    (module: Module): Permission[] => {
      if (!currentMember?.role) return [];
      return currentMember.role.permissions[module] || [];
    },
    [currentMember]
  );

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canExport,
    isAdmin,
    getModulePermissions,
    currentRole: currentMember?.role || null,
  };
};

export default usePermission;

