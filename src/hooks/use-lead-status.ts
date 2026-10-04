import { useEffect, useState } from "react";
import { fetchMyLeadStatus, type LeadStatus } from "@/lib/lead-quota";
import { fetchMyLeadSummary, type LeadSummary } from "@/lib/lead-review";

/** Loads the signed-in supplier's free-enquiry usage once `enabled` is true. */
export function useLeadStatus(enabled: boolean) {
  const [leadStatus, setLeadStatus] = useState<LeadStatus | null>(null);
  const [summary, setSummary] = useState<LeadSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    fetchMyLeadStatus()
      .then((s) => active && setLeadStatus(s))
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "Couldn't load enquiry usage.");
      });
    fetchMyLeadSummary()
      .then((s) => active && setSummary(s))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [enabled]);

  return { leadStatus, summary, error };
}
