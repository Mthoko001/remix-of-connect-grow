import { useEffect, useState } from "react";
import { fetchMyLeadStatus, type LeadStatus } from "@/lib/lead-quota";

/** Loads the signed-in supplier's free-enquiry usage once `enabled` is true. */
export function useLeadStatus(enabled: boolean) {
  const [leadStatus, setLeadStatus] = useState<LeadStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    fetchMyLeadStatus()
      .then((s) => active && setLeadStatus(s))
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "Couldn't load enquiry usage.");
      });
    return () => {
      active = false;
    };
  }, [enabled]);

  return { leadStatus, error };
}
