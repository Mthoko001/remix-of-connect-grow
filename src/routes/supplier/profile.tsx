import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  Clock,
  ImagePlus,
  Loader2,
  LocateFixed,
  Send,
  Sparkles,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { useSupplierSession } from "@/hooks/use-supplier-session";
import { useSupplierProfile, type SaveState } from "@/hooks/use-supplier-profile";
import { DashboardShell, PageHeader, Panel } from "@/components/supplier/dashboard-shell";
import { MonetizationBadge } from "@/components/supplier/lead-status";
import { useLeadStatus } from "@/hooks/use-lead-status";
import { ProfileStatusBadge } from "@/components/supplier/profile-status-badge";
import { MediaThumb } from "@/components/supplier/media-thumb";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { suggestBusinessDescription } from "@/lib/admin-description-ai.functions";
import {
  MAX_PRODUCT_IMAGES,
  TOTAL_TRACKED_FIELDS,
  missingFields,
  removeSupplierMedia,
  uploadSupplierMedia,
} from "@/lib/supplier-profile";

export const Route = createFileRoute("/supplier/profile")({
  head: () => ({
    meta: [{ title: "Business Profile — GrowMeOnline" }, { name: "robots", content: "noindex" }],
  }),
  component: SupplierProfilePage,
});

function SupplierProfilePage() {
  const { checking } = useSupplierSession();
  const {
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
  } = useSupplierProfile();
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingProducts, setUploadingProducts] = useState(false);
  const [locating, setLocating] = useState(false);
  const [suggestingDescription, setSuggestingDescription] = useState(false);
  const [suggestedDescription, setSuggestedDescription] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const productsInputRef = useRef<HTMLInputElement>(null);

  if (checking || loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/30">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingLogo(true);
    try {
      const previousLogo = draft.business_logo;
      const path = await uploadSupplierMedia(file, "logo");
      updateField("business_logo", path);
      if (previousLogo) await removeSupplierMedia(previousLogo);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not upload logo.");
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleRemoveLogo() {
    const previousLogo = draft.business_logo;
    updateField("business_logo", null);
    if (previousLogo) await removeSupplierMedia(previousLogo);
  }

  async function handleProductImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    const remainingSlots = MAX_PRODUCT_IMAGES - draft.product_images.length;
    if (remainingSlots <= 0) {
      toast(`You can upload up to ${MAX_PRODUCT_IMAGES} product images.`);
      return;
    }
    const toUpload = files.slice(0, remainingSlots);
    setUploadingProducts(true);
    try {
      const uploaded: string[] = [];
      for (const file of toUpload) {
        uploaded.push(await uploadSupplierMedia(file, "products"));
      }
      updateField("product_images", [...draft.product_images, ...uploaded]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not upload image(s).");
    } finally {
      setUploadingProducts(false);
    }
  }

  async function handleRemoveProductImage(path: string) {
    updateField(
      "product_images",
      draft.product_images.filter((p) => p !== path),
    );
    await removeSupplierMedia(path);
  }

  async function handleSuggestDescription() {
    const description = draft.business_description.trim();
    if (!description) {
      toast.error("Add a business description before asking Gemini to improve it.");
      return;
    }

    setSuggestingDescription(true);
    try {
      const { data, error } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (error || !accessToken) {
        throw new Error("Your session has expired. Please sign in again.");
      }
      const suggestion = await suggestBusinessDescription({
        data: { accessToken, description },
      });
      setSuggestedDescription(suggestion);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Couldn't generate a description suggestion.",
      );
    } finally {
      setSuggestingDescription(false);
    }
  }

  function handleUseCurrentLocation() {
    if (!("geolocation" in navigator)) {
      toast.error("Location isn't available in this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            { headers: { Accept: "application/json" } },
          );
          if (!res.ok) throw new Error("Lookup failed");
          const data = (await res.json()) as { display_name?: string };
          if (!data.display_name) throw new Error("No address found for your location.");
          updateField("address", data.display_name);
          toast.success("Address filled from your current location.");
        } catch {
          toast.error("Couldn't determine an address for your location. Please enter it manually.");
        } finally {
          setLocating(false);
        }
      },
      (geoError) => {
        setLocating(false);
        if (geoError.code === geoError.PERMISSION_DENIED) {
          toast.error("Location permission was denied.");
        } else {
          toast.error("Couldn't get your current location.");
        }
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  return (
    <DashboardShell>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title="Business Profile"
          subtitle="This information appears on your public listing once you're verified."
        />
        <div className="flex items-center gap-3">
          <ProfileStatusBadge status={status} />
          <LeadStatusBadge />
          <SaveStatusLabel saveState={saveState} lastSavedAt={lastSavedAt} />
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {error}
        </p>
      )}

      <StatusBanner status={status} rejectionReason={rejectionReason} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Business details">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="business_name">Business Name</Label>
                <Input
                  id="business_name"
                  placeholder="e.g. Acme Plumbing Co."
                  value={draft.business_name}
                  onChange={(e) => updateField("business_name", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="business_description">Description</Label>
                <Textarea
                  id="business_description"
                  placeholder="Tell customers what you do and what makes you different."
                  value={draft.business_description}
                  onChange={(e) => {
                    updateField("business_description", e.target.value);
                    setSuggestedDescription("");
                  }}
                  maxLength={1000}
                  className="min-h-[100px]"
                  disabled={suggestingDescription}
                />
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    Gemini suggestions are based on your description. Review before applying.
                  </p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {draft.business_description.length}/1000
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleSuggestDescription()}
                  disabled={suggestingDescription || !draft.business_description.trim()}
                  className="mt-2 gap-1.5"
                >
                  {suggestingDescription ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {suggestingDescription ? "Generating…" : "Improve with Gemini"}
                </Button>
                {suggestedDescription && (
                  <div className="space-y-3 rounded-lg border border-brand/20 bg-brand/5 p-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Suggested description
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                        {suggestedDescription}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          updateField("business_description", suggestedDescription);
                          setSuggestedDescription("");
                        }}
                        disabled={suggestingDescription}
                      >
                        Use Suggestion
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSuggestedDescription("")}
                        disabled={suggestingDescription}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="address">Address</Label>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={locating}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline disabled:opacity-60"
                  >
                    {locating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <LocateFixed className="h-3.5 w-3.5" />
                    )}
                    {locating ? "Locating…" : "Use my current location"}
                  </button>
                </div>
                <Input
                  id="address"
                  placeholder="Street, suburb, city"
                  value={draft.address}
                  onChange={(e) => updateField("address", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cell_no">Cell Number</Label>
                <Input
                  id="cell_no"
                  placeholder="e.g. 082 123 4567"
                  value={draft.cell_no}
                  onChange={(e) => updateField("cell_no", e.target.value)}
                />
              </div>
            </div>
          </Panel>

          <div className="flex flex-wrap items-center justify-end gap-3">
            {(status === "draft" || status === "rejected") && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const missing = missingFields(draft);
                  if (missing.length > 0) {
                    toast.error("Please complete your profile before submitting.", {
                      description: `Still missing: ${missing.join(", ")}.`,
                    });
                    return;
                  }
                  void submitForReview().then((ok) => {
                    if (ok)
                      toast.success(
                        "Your profile has been submitted for review. You will be notified once the review process is complete.",
                      );
                    else toast.error("Could not submit your profile. Please try again.");
                  });
                }}
                disabled={submitting}
                className="gap-2"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {submitting
                  ? "Submitting…"
                  : status === "rejected"
                    ? "Resubmit for Review"
                    : "Submit for Review"}
              </Button>
            )}
            <Button
              type="button"
              onClick={() =>
                void saveNow().then((ok) => {
                  if (ok) toast.success("Draft saved successfully.");
                  else toast.error("Could not save your changes. Please try again.");
                })
              }
              disabled={saveState === "saving"}
              className="gap-2"
            >
              {saveState === "saving" && <Loader2 className="h-4 w-4 animate-spin" />}
              {saveState === "saving" ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Panel title="Business logo">
            {draft.business_logo ? (
              <div className="w-full max-w-[160px]">
                <MediaThumb
                  path={draft.business_logo}
                  alt="Business logo"
                  onRemove={handleRemoveLogo}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingLogo}
                className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 text-center transition-colors hover:bg-muted/50 disabled:opacity-60"
              >
                {uploadingLogo ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  <Upload className="h-6 w-6 text-muted-foreground" />
                )}
                <p className="px-4 text-xs text-muted-foreground">
                  {uploadingLogo ? "Uploading…" : "Drag and drop or click to upload"}
                </p>
              </button>
            )}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void handleLogoChange(e)}
            />
          </Panel>

          <Panel title="Product images">
            <div className="grid grid-cols-3 gap-2">
              {draft.product_images.map((path) => (
                <MediaThumb
                  key={path}
                  path={path}
                  alt="Product"
                  onRemove={() => void handleRemoveProductImage(path)}
                />
              ))}
              {draft.product_images.length < MAX_PRODUCT_IMAGES && (
                <button
                  type="button"
                  onClick={() => productsInputRef.current?.click()}
                  disabled={uploadingProducts}
                  className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 transition-colors hover:bg-muted/50 disabled:opacity-60"
                >
                  {uploadingProducts ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <ImagePlus className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              )}
            </div>
            <input
              ref={productsInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => void handleProductImagesChange(e)}
            />
            <p className="mt-3 text-xs text-muted-foreground">
              {draft.product_images.length}/{MAX_PRODUCT_IMAGES} images.
            </p>
          </Panel>
        </div>
      </div>
    </DashboardShell>
  );
}

function StatusBanner({
  status,
  rejectionReason,
}: {
  status: "draft" | "pending_verification" | "validated" | "rejected";
  rejectionReason: string | null;
}) {
  if (status === "pending_verification") {
    return (
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-brand/20 bg-brand/5 p-4">
        <Clock className="h-5 w-5 shrink-0 text-brand" />
        <p className="text-sm text-foreground">
          Under review — our team is checking your profile. We'll email you once it's approved. You can still edit your details below.
        </p>
      </div>
    );
  }
  if (status === "validated") {
    return (
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
        <p className="text-sm text-foreground">Your profile is verified.</p>
      </div>
    );
  }
  if (status === "rejected") {
    return (
      <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
        <p className="text-sm font-semibold text-foreground">Your profile wasn't approved</p>
        {rejectionReason && (
          <p className="mt-1 text-sm text-muted-foreground">Reason: {rejectionReason}</p>
        )}
      </div>
    );
  }
  return null;
}

function SaveStatusLabel({
  saveState,
  lastSavedAt,
}: {
  saveState: SaveState;
  lastSavedAt: Date | null;
}) {
  if (saveState === "saving") {
    return (
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" /> Saving…
      </p>
    );
  }
  if (saveState === "error") {
    return <p className="text-xs text-destructive">Couldn't save. Try again.</p>;
  }
  if (lastSavedAt) {
    return (
      <p className="text-xs text-muted-foreground">
        Saved {lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </p>
    );
  }
  return null;
}

function LeadStatusBadge() {
  const { leadStatus } = useLeadStatus(true);
  return leadStatus ? <MonetizationBadge status={leadStatus.status} /> : null;
}
