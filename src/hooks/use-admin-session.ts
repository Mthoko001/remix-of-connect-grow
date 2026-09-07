import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * Guards an /admin/* route: redirects to /admin/login when there is no
 * active session, and redirects to / with a toast when the signed-in user
 * has no matching tb_admin_account row. Keeps reacting to auth state
 * changes (e.g. logout in another tab).
 */
export function useAdminSession() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function verifyAdmin(userId: string, userEmail: string | null) {
      const { data, error } = await supabase
        .from("tb_admin_account")
        .select("admin_account_id")
        .eq("admin_account_id", userId)
        .maybeSingle();

      if (!mounted) return;

      if (error || !data) {
        toast.error("You're not authorized to view the admin area.");
        navigate({ to: "/", replace: true });
        return;
      }

      setEmail(userEmail);
      setChecking(false);
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (!data.session) {
        navigate({ to: "/admin/login", replace: true });
        return;
      }
      void verifyAdmin(data.session.user.id, data.session.user.email ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (!session) {
        navigate({ to: "/admin/login", replace: true });
        return;
      }
      void verifyAdmin(session.user.id, session.user.email ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  return { email, checking };
}
