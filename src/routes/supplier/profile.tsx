import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ImagePlus, Loader2, LocateFixed, Upload } from "lucide-react";
import { toast } from "sonner";
import { useSupplierSession } from "@/hooks/use-supplier-session";
import { useSupplierProfile, type SaveState } from "@/hooks/use-supplier-profile";
import { DashboardShell, PageHeader, Panel } from "@/components/supplier/dashboard-shell";
import { MediaThumb } from "@/components/supplier/media-thumb";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  MAX_PRODUCT_IMAGES,
  removeSupplierMedia,
  uploadSupplierMedia,
} from "@/lib/supplier-profile";

export const Route = createFileRoute("/supplier/profile")({
  head: () => ({
    meta: [{ title: "Business Profile — LeadLink" }, { name: "robots", content: "noindex" }],
  }),
  component: SupplierProfilePage,
});

function SupplierProfilePage() {
  const { checking } = useSupplierSession();
  const { draft, loading, saveState, error, lastSavedAt, updateField, saveNow } =
    useSupplierProfile();
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingProducts, setUploadingProducts] = useState(false);
  const [locating, setLocating] = useState(false);
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
        <SaveStatusLabel saveState={saveState} lastSavedAt={lastSavedAt} />
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {error}
        </p>
      )}

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
                  onChange={(e) => updateField("business_description", e.target.value)}
                  className="min-h-[100px]"
                />
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

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => void saveNow()}
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
