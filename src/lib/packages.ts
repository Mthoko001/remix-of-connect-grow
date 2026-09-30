import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type PackageRow = Tables<"tb_package">;

export type SubscriptionPackage = {
  packageId: number;
  name: string;
  description: string;
  price: number;
  durationMonths: number;
  benefits: string[];
  isActive: boolean;
  sortOrder: number;
  dateCreated: string;
  dateUpdated: string;
  createdBy: string | null;
  updatedBy: string | null;
};

export type PackageInput = {
  name: string;
  description: string;
  price: number;
  durationMonths: number;
  benefits: string[];
  isActive: boolean;
  sortOrder: number;
};

function toPackage(row: PackageRow): SubscriptionPackage {
  return {
    packageId: row.package_id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    durationMonths: row.duration_months,
    benefits: Array.isArray(row.benefits) ? row.benefits.map(String) : [],
    isActive: row.is_active,
    sortOrder: row.sort_order,
    dateCreated: row.date_created,
    dateUpdated: row.date_updated,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
  };
}

function toRow(input: PackageInput) {
  return {
    name: input.name,
    description: input.description,
    price: input.price,
    duration_months: input.durationMonths,
    benefits: input.benefits,
    is_active: input.isActive,
    sort_order: input.sortOrder,
  };
}

/** Active packages, in display order. Public. */
export async function fetchActivePackages(): Promise<SubscriptionPackage[]> {
  const { data, error } = await supabase
    .from("tb_package")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")
    .order("package_id");
  if (error) throw error;
  return (data ?? []).map(toPackage);
}

/** All packages including inactive. RLS only returns inactive ones to admins. */
export async function fetchAllPackages(): Promise<SubscriptionPackage[]> {
  const { data, error } = await supabase
    .from("tb_package")
    .select("*")
    .order("sort_order")
    .order("package_id");
  if (error) throw error;
  return (data ?? []).map(toPackage);
}

export async function createPackage(input: PackageInput): Promise<void> {
  const { error } = await supabase.from("tb_package").insert(toRow(input));
  if (error) throw error;
}

export async function updatePackage(packageId: number, input: PackageInput): Promise<void> {
  const { error } = await supabase
    .from("tb_package")
    .update(toRow(input))
    .eq("package_id", packageId);
  if (error) throw error;
}

export function formatRand(amount: number): string {
  return `R${amount.toLocaleString("en-ZA", { minimumFractionDigits: amount % 1 ? 2 : 0 })}`;
}

export function formatDuration(months: number): string {
  if (months === 12) return "year";
  if (months % 12 === 0) return `${months / 12} years`;
  return months === 1 ? "month" : `${months} months`;
}
