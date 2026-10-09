/** Current legal policy versions. Bump when the text of a policy changes. */
export const TERMS_VERSION = "1.0";
export const PRIVACY_VERSION = "1.0";
export const POLICIES_LAST_UPDATED = "6 October 2026";
export const SUPPORT_EMAIL = "support@growmeonline.co.za";

export type PasswordCheck = { label: string; ok: boolean; error: string };

/** Password strength rules used on sign-up and reset. */
export function passwordChecks(pw: string): PasswordCheck[] {
  return [
    {
      label: "At least 8 characters",
      ok: pw.length >= 8,
      error: "Password must be at least 8 characters long.",
    },
    {
      label: "Contains uppercase letter",
      ok: /[A-Z]/.test(pw),
      error: "Password must contain at least one uppercase letter.",
    },
    {
      label: "Contains lowercase letter",
      ok: /[a-z]/.test(pw),
      error: "Password must contain at least one lowercase letter.",
    },
    {
      label: "Contains number",
      ok: /\d/.test(pw),
      error: "Password must contain at least one number.",
    },
    {
      label: "Contains special character",
      ok: /[^A-Za-z0-9]/.test(pw),
      error: "Password must contain at least one special character (e.g. !@#$%^&*).",
    },
  ];
}

export function isStrongPassword(pw: string): boolean {
  return passwordChecks(pw).every((c) => c.ok);
}

/** First unmet rule's friendly message, or null when the password is valid. */
export function firstPasswordError(pw: string): string | null {
  return passwordChecks(pw).find((c) => !c.ok)?.error ?? null;
}

export type PasswordStrength = "weak" | "medium" | "strong";

/** Weak: ≤2 rules met; Medium: 3–4; Strong: all 5. */
export function passwordStrength(pw: string): PasswordStrength {
  const met = passwordChecks(pw).filter((c) => c.ok).length;
  if (met === 5) return "strong";
  if (met >= 3) return "medium";
  return "weak";
}
