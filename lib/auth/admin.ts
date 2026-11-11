export const SUPER_ADMIN_EMAILS = [
  'iqbalrri25@gmail.com',
];

/**
 * Checks if a given Supabase auth user has Administrator privileges.
 *
 * @param user The authenticated user object from supabase.auth.getUser()
 * @param customAdminEmails Optional list of admin emails configured in database (e.g. from branding_settings.admin_emails or thumbnail_settings.admin_emails)
 */
export const checkIsUserAdmin = (user: any, customAdminEmails: string[] = []): boolean => {
  if (!user) return false;
  const email = (user.email || '').toLowerCase().trim();
  const userMeta = (user.user_metadata || {}) as any;
  const appMeta = (user.app_metadata || {}) as any;

  // Normalized list of custom admin emails
  const normalizedCustom = customAdminEmails.map((e) => (e || '').toLowerCase().trim()).filter(Boolean);

  return (
    SUPER_ADMIN_EMAILS.includes(email) ||
    normalizedCustom.includes(email) ||
    email.includes('admin') ||
    userMeta.role === 'admin' ||
    appMeta.role === 'admin' ||
    userMeta.is_admin === true
  );
};

