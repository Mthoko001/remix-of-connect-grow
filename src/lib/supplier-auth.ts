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
