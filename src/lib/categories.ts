import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type CategoryRow = Tables<"tb_category">;

export type CategoryNode = CategoryRow & { children: CategoryNode[] };

/** Every category, flat. Public — no auth required. */
export async function fetchAllCategories(): Promise<CategoryRow[]> {
  const { data, error } = await supabase
    .from("tb_category")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Categories arranged into a parent/child tree, top-level first. */
export function buildCategoryTree(flat: CategoryRow[]): CategoryNode[] {
  const byId = new Map<number, CategoryNode>(
    flat.map((c) => [c.category_id, { ...c, children: [] }]),
  );
  const roots: CategoryNode[] = [];
  for (const node of byId.values()) {
    if (node.parent_category_id && byId.has(node.parent_category_id)) {
      byId.get(node.parent_category_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Admin-only via RLS. */
export async function createCategory(
  name: string,
  parentCategoryId: number | null,
): Promise<CategoryRow> {
  const { data, error } = await supabase
    .from("tb_category")
    .insert({ name: name.trim(), slug: slugify(name), parent_category_id: parentCategoryId })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateCategory(
  categoryId: number,
  name: string,
  parentCategoryId: number | null,
): Promise<void> {
  const { error } = await supabase
    .from("tb_category")
    .update({ name: name.trim(), slug: slugify(name), parent_category_id: parentCategoryId })
    .eq("category_id", categoryId);
  if (error) throw error;
}

/**
 * Deletes a category. Blocked by the database if any supplier profile
 * references it, or if it has child categories (both are FK constraints
 * with ON DELETE RESTRICT) — this surfaces those as a friendly error
 * rather than a raw Postgres message.
 */
export async function deleteCategory(categoryId: number): Promise<void> {
  const { error } = await supabase.from("tb_category").delete().eq("category_id", categoryId);
  if (error) {
    if (error.code === "23503") {
      throw new Error(
        "This category is still in use — remove any subcategories or supplier profiles using it first.",
      );
    }
    throw error;
  }
}
