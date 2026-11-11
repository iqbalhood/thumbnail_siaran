export interface UserDialogPermission {
  email: string;
  name?: string;
  allowAll: boolean;
  allowedDialogIds: string[];
  note?: string;
  updatedAt?: string;
}

/**
 * Extracts the user permissions array from branding_settings object
 */
export const extractUserPermissions = (branding: any): UserDialogPermission[] => {
  if (!branding) return [];
  if (Array.isArray(branding.user_permissions)) {
    return branding.user_permissions;
  }
  if (Array.isArray(branding.thumbnail_settings?.user_permissions)) {
    return branding.thumbnail_settings.user_permissions;
  }
  return [];
};

/**
 * Gets the specific dialog permission for a user by email
 */
export const getUserDialogPermission = (
  user: any,
  permissionsList: UserDialogPermission[] = []
): UserDialogPermission | null => {
  if (!user || !user.email) return null;
  const userEmail = (user.email || '').toLowerCase().trim();
  return (
    permissionsList.find(
      (p) => (p.email || '').toLowerCase().trim() === userEmail
    ) || null
  );
};

/**
 * Filters dialogs array based on user's permission.
 * - Admins always get all dialogs.
 * - Users with allowAll = true get all dialogs.
 * - Users not listed in permissionsList get all dialogs (default unrestricted) unless restricted.
 * - Users with specific allowedDialogIds only get those matching dialogs.
 */
export const filterDialogsForUser = (
  dialogs: any[],
  user: any,
  isAdmin: boolean,
  permissionsList: UserDialogPermission[] = []
): any[] => {
  if (!dialogs || dialogs.length === 0) return [];
  if (isAdmin || !user) return dialogs;

  const permission = getUserDialogPermission(user, permissionsList);
  if (!permission) return dialogs; // Unregistered user defaults to all dialogs
  if (permission.allowAll) return dialogs;

  const allowedSet = new Set(permission.allowedDialogIds || []);
  return dialogs.filter((d) => allowedSet.has(d.id));
};

