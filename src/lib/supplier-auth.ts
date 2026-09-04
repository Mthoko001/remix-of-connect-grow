import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

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
      emailRedirectTo: `${window.location.origin}/supplier/onboarding`,
    },
  });

  if (error) throw error;

  return { needsEmailConfirmation: !data.session };
}

/** Starts the Google OAuth flow for supplier sign-up / sign-in. */
export async function signUpSupplierWithGoogle(): Promise<void> {
  await lovable.auth.signInWithOAuth("google", {
    redirect_uri: window.location.origin,
  });
}
