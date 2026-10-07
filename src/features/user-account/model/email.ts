/** A valid address: something, one `@`, a domain with a dot, no spaces (design.md D2). */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The email-format check the account forms run before sending (design.md D2). */
export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}
