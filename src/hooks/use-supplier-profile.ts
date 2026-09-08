import { useCallback, useEffect, useRef, useState } from "react";
import {
  EMPTY_DRAFT,
  fetchMyProfile,
  saveProfileDraft,
  submitProfileForReview,
  toDraft,
  type SupplierProfileDraft,
  type SupplierProfileStatus,
} from "@/lib/supplier-profile";

export type SaveState = "idle" | "saving" | "saved" | "error";

const AUTOSAVE_DELAY_MS = 1200;

/**
 * Loads the supplier's draft profile and autosaves changes after a short pause.
 * Business logic lives here so the form component stays presentational.
 */
export function useSupplierProfile() {
  const [draft, setDraft] = useState<SupplierProfileDraft>(EMPTY_DRAFT);
  const [status, setStatus] = useState<SupplierProfileStatus>("draft");
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const dirtyRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  useEffect(() => {
    let active = true;
    fetchMyProfile()
      .then((row) => {
        if (!active) return;
        setDraft(toDraft(row));
        if (row) {
          setLastSavedAt(new Date(row.date_updated));
          setStatus((row.status as SupplierProfileStatus) ?? "draft");
          setRejectionReason(row.rejection_reason);
        }
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "Could not load your profile.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const save = useCallback(async () => {
    setSaveState("saving");
    setError(null);
    try {
      const row = await saveProfileDraft(draftRef.current);
      dirtyRef.current = false;
      setLastSavedAt(new Date(row.date_updated));
      setSaveState("saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your draft.");
      setSaveState("error");
    }
  }, []);

  const updateField = useCallback(
    <K extends keyof SupplierProfileDraft>(key: K, value: SupplierProfileDraft[K]) => {
      dirtyRef.current = true;
      setDraft((prev) => ({ ...prev, [key]: value }));
      setSaveState("idle");
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => void save(), AUTOSAVE_DELAY_MS);
    },
    [save],
  );

  const saveNow = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    await save();
  }, [save]);

  const submitForReview = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    try {
      await saveNow();
      await submitProfileForReview();
      setStatus("pending_verification");
      setLastSavedAt(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your profile.");
    } finally {
      setSubmitting(false);
    }
  }, [saveNow]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  return {
    draft,
    status,
    rejectionReason,
    loading,
    saveState,
    error,
    lastSavedAt,
    updateField,
    saveNow,
    submitting,
    submitForReview,
  };
}
