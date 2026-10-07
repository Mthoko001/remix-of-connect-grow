import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, Save, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminMediaView } from "@/components/admin/admin-media-view";
import { CategorySelect } from "@/components/category-select";
import {
  adminUpdateSupplierProfile,
  adminUploadSupplierMedia,
  productImagePaths,
  type SupplierReviewProfile,
} from "@/lib/admin-review";
import { MAX_PRODUCT_IMAGES } from "@/lib/supplier-profile";

type Props = {
  supplierAccountId: string;
  profile: SupplierReviewProfile;
  onSaved: () => void;
};

const toList = (v: string) =>
  v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/** Lets an admin correct category, details and images before approving a supplier. */
export function AdminProfileEditor({ supplierAccountId, profile, onSaved }: Props) {
  const [categoryId, setCategoryId] = useState<number | null>(profile.category_id);
  const [cell, setCell] = useState(profile.cell_no ?? "");
  const [open, setOpen] = useState(profile.opening_time?.slice(0, 5) ?? "09:00");
  const [close, setClose] = useState(profile.closing_time?.slice(0, 5) ?? "17:00");
  const [services, setServices] = useState(profile.service_categories.join(", "));
  const [products, setProducts] = useState(profile.products_offered.join(", "));
  const [logo, setLogo] = useState(profile.business_logo);
  const [cover, setCover] = useState(profile.cover_image);
  const [images, setImages] = useState(productImagePaths(profile.product_images));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    setCategoryId(profile.category_id);
    setLogo(profile.business_logo);
    setCover(profile.cover_image);
    setImages(productImagePaths(profile.product_images));
  }, [profile]);

  async function upload(kind: "logo" | "cover" | "products", file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file.");
    if (file.size > 5 * 1024 * 1024) return toast.error("Images must be under 5 MB.");
    setUploading(kind);
    try {
      const path = await adminUploadSupplierMedia(supplierAccountId, file, kind);
      if (kind === "logo") setLogo(path);
      else if (kind === "cover") setCover(path);
      else setImages((prev) => [...prev, path].slice(0, MAX_PRODUCT_IMAGES));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(null);
    }
  }

  async function save() {
    setSaving(true);
    try {
      await adminUpdateSupplierProfile(supplierAccountId, {
        category_id: categoryId,
        cell_no: cell.trim() || null,
        opening_time: open,
        closing_time: close,
        service_categories: profile.is_service_provider ? toList(services) : [],
        products_offered: profile.is_product_seller ? toList(products) : [],
        business_logo: logo,
        cover_image: cover,
        product_images: images,
      });
      toast.success("Supplier profile updated.");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save changes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <p className="text-sm font-semibold text-foreground">Edit profile before approval</p>

      <div className="space-y-1.5">
        <Label htmlFor="admin_category">Category</Label>
        {profile.category_review_required && !categoryId && (
          <p className="text-xs font-medium text-destructive">Category Review Required</p>
        )}
        <CategorySelect id="admin_category" value={categoryId} onChange={setCategoryId} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="admin_cell">Cell number</Label>
          <Input id="admin_cell" value={cell} onChange={(e) => setCell(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="admin_open">Opens</Label>
          <Input id="admin_open" type="time" value={open} onChange={(e) => setOpen(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="admin_close">Closes</Label>
          <Input id="admin_close" type="time" value={close} onChange={(e) => setClose(e.target.value)} />
        </div>
      </div>

      {profile.is_service_provider && (
        <div className="space-y-1.5">
          <Label htmlFor="admin_services">Services offered (comma separated)</Label>
          <Input id="admin_services" value={services} onChange={(e) => setServices(e.target.value)} />
        </div>
      )}
      {profile.is_product_seller && (
        <div className="space-y-1.5">
          <Label htmlFor="admin_products">Products offered (comma separated)</Label>
          <Input id="admin_products" value={products} onChange={(e) => setProducts(e.target.value)} />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <ImageSlot
          label="Logo"
          path={logo}
          variant="logo"
          busy={uploading === "logo"}
          onPick={(f) => void upload("logo", f)}
          onRemove={() => setLogo(null)}
        />
        <ImageSlot
          label="Cover image"
          path={cover}
          busy={uploading === "cover"}
          onPick={(f) => void upload("cover", f)}
          onRemove={() => setCover(null)}
        />
      </div>

      <div className="space-y-1.5">
        <Label>
          Product images ({images.length}/{MAX_PRODUCT_IMAGES})
        </Label>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((path) => (
            <div key={path} className="relative">
              <AdminMediaView path={path} alt="Product" />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute right-1 top-1 h-7 w-7"
                aria-label="Remove image"
                onClick={() => setImages((prev) => prev.filter((p) => p !== path))}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          {images.length < MAX_PRODUCT_IMAGES && (
            <FilePick busy={uploading === "products"} onPick={(f) => void upload("products", f)}>
              <ImagePlus className="h-5 w-5" />
            </FilePick>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        New images are previewed here and only go live once you save.
      </p>
      <Button type="button" onClick={() => void save()} disabled={saving || !!uploading} className="gap-1.5">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save Profile Changes
      </Button>
    </div>
  );
}

function ImageSlot({
  label,
  path,
  variant = "image",
  busy,
  onPick,
  onRemove,
}: {
  label: string;
  path: string | null;
  variant?: "image" | "logo";
  busy: boolean;
  onPick: (f: File | undefined) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <div className={variant === "logo" ? "" : "w-28"}>
          {path ? (
            <AdminMediaView path={path} alt={label} variant={variant} />
          ) : (
            <div className="grid size-20 place-items-center rounded-lg border border-dashed text-xs text-muted-foreground">
              None
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <FilePick busy={busy} onPick={onPick} compact>
            <Upload className="h-4 w-4" /> Replace
          </FilePick>
          {path && (
            <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="text-destructive">
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function FilePick({
  busy,
  onPick,
  compact,
  children,
}: {
  busy: boolean;
  onPick: (f: File | undefined) => void;
  compact?: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          onPick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <Button
        type="button"
        variant="outline"
        size={compact ? "sm" : "default"}
        disabled={busy}
        onClick={() => ref.current?.click()}
        className={compact ? "gap-1.5" : "aspect-square h-auto w-full"}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
      </Button>
    </>
  );
}
