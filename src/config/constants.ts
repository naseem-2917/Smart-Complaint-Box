// Admin Panel Configuration
// Only this email address can access the admin panel
export const SUPER_ADMIN_EMAIL = 'khannaseem1704@gmail.com';

// Check if an email is the super admin
export const isSuperAdmin = (email: string | null | undefined): boolean => {
    return email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
};
