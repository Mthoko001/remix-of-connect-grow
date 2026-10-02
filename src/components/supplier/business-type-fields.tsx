import { useState } from "react";
import { X } from "lucide-react";
import { Panel } from "@/components/supplier/dashboard-shell";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SERVICE_CATEGORIES, type SupplierProfileDraft } from "@/lib/supplier-profile";

type Props = {
  draft: SupplierProfileDraft;
  updateField: <K extends keyof SupplierProfileDraft>(key: K, value: SupplierProfileDraft[K]) => void;
};

/** Business type, services, products and business hours section of the supplier profile. */
export function BusinessTypeFields({ draft, updateField }: Props) {
  const [productInput, setProductInput] = useState("");

  function toggleService(name: string, checked: boolean) {
    const next = checked
      ? [...draft.service_categories, name]
      : draft.service_categories.filter((c) => c !== name);
    updateField("service_categories", next);
  }

  function addProducts() {
    const items = productInput
      .split(",")
      .map((p) => p.trim().slice(0, 60))
      .filter(Boolean);
    if (items.length === 0) return;
    const existing = new Set(draft.products_offered.map((p) => p.toLowerCase()));
    const fresh = items.filter((p) => !existing.has(p.toLowerCase()));
    if (fresh.length) updateField("products_offered", [...draft.products_offered, ...fresh].slice(0, 50));
    setProductInput("");
  }

  return (
    <Panel title="Business type">
      <div className="space-y-5">
        <div>
          <p className="mb-2 text-sm text-muted-foreground">Select at least one. You can choose both.</p>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Checkbox
                checked={draft.is_service_provider}
                onCheckedChange={(v) => updateField("is_service_provider", v === true)}
              />
              Service Provider
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Checkbox
                checked={draft.is_product_seller}
                onCheckedChange={(v) => updateField("is_product_seller", v === true)}
              />
              Product Seller
            </label>
          </div>
        </div>

        {draft.is_service_provider && (
          <div className="space-y-2">
            <Label>Service Categories</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {SERVICE_CATEGORIES.map((name) => (
                <label key={name} className="flex items-center gap-2 text-sm text-foreground">
                  <Checkbox
                    checked={draft.service_categories.includes(name)}
                    onCheckedChange={(v) => toggleService(name, v === true)}
                  />
                  {name}
                </label>
              ))}
            </div>
            {draft.service_categories.includes("Other") && (
              <div className="space-y-1.5 pt-1">
                <Label htmlFor="other_service">Specify Service</Label>
                <Input
                  id="other_service"
                  maxLength={100}
                  placeholder="e.g. Solar Installation"
                  value={draft.other_service}
                  onChange={(e) => updateField("other_service", e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        {draft.is_product_seller && (
          <div className="space-y-2">
            <Label htmlFor="product_input">Products Offered</Label>
            <div className="flex gap-2">
              <Input
                id="product_input"
                placeholder="Type a product and press Enter, e.g. Potatoes"
                value={productInput}
                maxLength={200}
                onChange={(e) => setProductInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addProducts();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addProducts}>
                Add
              </Button>
            </div>
            {draft.products_offered.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {draft.products_offered.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
                  >
                    {p}
                    <button
                      type="button"
                      aria-label={`Remove ${p}`}
                      onClick={() =>
                        updateField(
                          "products_offered",
                          draft.products_offered.filter((x) => x !== p),
                        )
                      }
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="opening_time">Opening Time</Label>
            <Input
              id="opening_time"
              type="time"
              value={draft.opening_time}
              onChange={(e) => updateField("opening_time", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="closing_time">Closing Time</Label>
            <Input
              id="closing_time"
              type="time"
              value={draft.closing_time}
              onChange={(e) => updateField("closing_time", e.target.value)}
            />
          </div>
        </div>
      </div>
    </Panel>
  );
}
