import { useCallback, useEffect, useState } from "react";
import { fetchActivePackages, fetchAllPackages, type SubscriptionPackage } from "@/lib/packages";

/** Loads packages from the database. `all` includes inactive ones (admins only). */
export function usePackages({ all = false, enabled = true } = {}) {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPackages(await (all ? fetchAllPackages() : fetchActivePackages()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load packages.");
    } finally {
      setLoading(false);
    }
  }, [all]);

  useEffect(() => {
    if (enabled) void reload();
  }, [enabled, reload]);

  return { packages, loading, error, reload };
}
