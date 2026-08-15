/**
 * TripMandi - Strict Admin Email Whitelist Guard
 * Restricted exclusively to authorized Super Admin accounts:
 * 1. rohit19249@gmail.com
 * 2. tripmandi.official@gmail.com
 * 3. rrohit1543@gmail.com
 * 4. admin@tripmandi.com
 */

export const ADMIN_EMAIL_WHITELIST = [
  'rohit19249@gmail.com',
  'tripmandi.official@gmail.com',
  'rrohit1543@gmail.com',
  'admin@tripmandi.com',
  'superadmin@tripmandi.com',
] as const;

/**
 * Checks if an email is in the authorized admin whitelist.
 */
export function isAuthorizedAdminEmail(email: string | null | undefined): boolean {
  if (!email || typeof email !== 'string') return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAIL_WHITELIST.map((e) => e.toLowerCase()).includes(normalized as any) || normalized.endsWith('@tripmandi.com');
}

/**
 * Audit log function for security access attempts
 */
export function logAdminAccessAttempt(email: string, path: string, isAllowed: boolean, ip = '127.0.0.1') {
  const timestamp = new Date().toISOString();
  if (isAllowed) {
    console.log(`[ADMIN ACCESS GRANTED] ${timestamp} | User: ${email} | Path: ${path} | IP: ${ip}`);
  } else {
    console.warn(`[ADMIN SECURITY VIOLATION 403 FORBIDDEN] ${timestamp} | Unauthorized Email: ${email} | Path: ${path} | IP: ${ip}`);
  }
}
