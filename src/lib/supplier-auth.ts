import { supabase } from "@/integrations/supabase/client";

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
    },
  });

  if (error) throw error;

  return { needsEmailConfirmation: !data.session };
}

/** Starts the Google OAuth flow for supplier sign-up / sign-in. */
export async function signUpSupplierWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/supplier/dashboard` },
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
