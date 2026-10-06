/** Current legal policy versions. Bump when the text of a policy changes. */
export const TERMS_VERSION = "1.0";
export const PRIVACY_VERSION = "1.0";
export const POLICIES_LAST_UPDATED = "6 October 2026";
export const SUPPORT_EMAIL = "support@growmeonline.co.za";

export type PasswordCheck = { label: string; ok: boolean };

/** Password strength rules used on sign-up and reset. */
export function passwordChecks(pw: string): PasswordCheck[] {
  return [
    { label: "At least 8 characters", ok: pw.length >= 8 },
    { label: "An uppercase letter", ok: /[A-Z]/.test(pw) },
    { label: "A lowercase letter", ok: /[a-z]/.test(pw) },
    { label: "A number", ok: /\d/.test(pw) },
  ];
}

export function isStrongPassword(pw: string): boolean {
  return passwordChecks(pw).every((c) => c.ok);
}
