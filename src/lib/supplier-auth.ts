import { supabase } from "@/integrations/supabase/client";
import { PRIVACY_VERSION, TERMS_VERSION } from "@/lib/policies";

export type SignUpWithEmailInput = {
  email: string;
  password: string;
};

/**
 * Signs a supplier up with email + password.
 * The public.tb_supplier_account row is created automatically by a
 * SECURITY DEFINER trigger on auth.users — no client-side insert needed.
 */
export async function signUpSupplierWithEmail({
  email,
  password,
}: SignUpWithEmailInput): Promise<{ needsEmailConfirmation: boolean }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/supplier/dashboard`,
      // Creating an account constitutes acceptance; the auth trigger records
      // these versions + timestamp on tb_supplier_account.
      data: { terms_version: TERMS_VERSION, privacy_version: PRIVACY_VERSION },
    },
  });

  if (error) throw error;

  return { needsEmailConfirmation: !data.session };
}

/** sessionStorage key holding the same-origin path to visit after OAuth returns. */
export const AUTH_NEXT_STORAGE_KEY = "gmo:auth-next";

/** Only allows same-origin relative paths (never "//evil.com" or absolute URLs). */
export function sanitizeNextPath(value: unknown): string | undefined {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : undefined;
}

/** Maps a Google sign-in failure to a safe, user-facing message. */
export function googleAuthErrorMessage(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err ?? "");
  if (/unsupported provider|provider.*(not enabled|disabled|not found)/i.test(message)) {
    return "Google sign-in isn't enabled yet. Please use email and password for now.";
  }
  return "Could not start Google sign-in. Please try again.";
}

/** Starts the Google OAuth flow for supplier sign-up / sign-in. */
export async function signInWithGoogle(nextPath?: string): Promise<void> {
  const next = sanitizeNextPath(nextPath);
  if (next) sessionStorage.setItem(AUTH_NEXT_STORAGE_KEY, next);
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    // Public same-origin callback route; it reads AUTH_NEXT_STORAGE_KEY and
    // navigates to the intended destination only after the session is set.
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
  if (error) throw error;
}

/**
 * Sends a password reset email. Always resolves without revealing whether
 * the email actually belongs to an account — Supabase itself behaves this
 * way (no error for an unknown email), which is the correct, safe default.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
}

/**
 * Sets a new password. Only works within the short-lived recovery session
 * created when the user follows the link from requestPasswordReset's email
 * — the reset-password page is responsible for confirming that session
 * exists before calling this.
 */
export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}
