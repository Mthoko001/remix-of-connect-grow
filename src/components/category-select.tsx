import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchActiveCategories, type CategoryRow } from "@/lib/categories";

/** Dropdown of admin-managed active categories. Keeps showing a currently assigned inactive one. */
export function CategorySelect({
  value,
  onChange,
  id,
  disabled,
}: {
  value: number | null;
  onChange: (categoryId: number) => void;
  id?: string;
  disabled?: boolean;
}) {
  const [options, setOptions] = useState<CategoryRow[]>([]);
  useEffect(() => {
    void fetchActiveCategories(value).then(setOptions).catch(() => setOptions([]));
  }, [value]);

  return (
    <Select
      value={value ? String(value) : undefined}
      onValueChange={(v) => onChange(Number(v))}
      disabled={disabled}
    >
      <SelectTrigger id={id}>
        <SelectValue placeholder="Select a category" />
      </SelectTrigger>
      <SelectContent>
        {options.map((c) => (
          <SelectItem key={c.category_id} value={String(c.category_id)}>
            {c.name}
            {!c.is_active && " (inactive)"}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
