/**
 * TripMandi - Dual Identification System Detector & Validator
 * Validates and detects whether an input string is an Email or an E.164 Mobile Number.
 */

export interface IdentifierTypeResult {
  type: 'email' | 'mobile';
  normalizedIdentifier: string;
  isValid: boolean;
  countryCode?: string;
  formattedDisplay: string;
}

/**
 * Validates email format using RFC 5322 regex pattern
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates international E.164 phone numbers (e.g. +919876543210, +12025550123)
 */
export function isValidMobileNumber(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  // E.164 international format regex or 10-digit Indian mobile
  const mobileRegex = /^\+?[1-9]\d{7,14}$/;
  return mobileRegex.test(cleaned);
}

/**
 * Detects type of identifier, normalizes format, and validates correctness
 */
export function parseAndValidateIdentifier(input: string): IdentifierTypeResult {
  const raw = input.trim();

  // 1. Check Email
  if (raw.includes('@')) {
    const valid = isValidEmail(raw);
    const normalized = raw.toLowerCase();
    return {
      type: 'email',
      normalizedIdentifier: normalized,
      isValid: valid,
      formattedDisplay: normalized,
    };
  }

  // 2. Check Mobile Number
  const cleaned = raw.replace(/[\s\-\(\)]/g, '');
  
  // If 10-digit Indian mobile without country code, prefix +91
  let normalizedMobile = cleaned;
  if (/^[6-9]\d{9}$/.test(cleaned)) {
    normalizedMobile = `+91${cleaned}`;
  } else if (!normalizedMobile.startsWith('+')) {
    normalizedMobile = `+${normalizedMobile}`;
  }

  const valid = isValidMobileNumber(normalizedMobile);
  const countryCode = normalizedMobile.substring(0, normalizedMobile.length - 10);

  return {
    type: 'mobile',
    normalizedIdentifier: normalizedMobile,
    isValid: valid,
    countryCode,
    formattedDisplay: normalizedMobile,
  };
}
