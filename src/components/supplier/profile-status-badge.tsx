import type { SupplierProfileStatus } from "@/lib/supplier-profile";
import { cn } from "@/lib/utils";

const STATUS_META: Record<SupplierProfileStatus, { label: string; className: string; dot: string }> = {
  draft: { label: "Draft", className: "border-border bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
  pending_verification: {
    label: "Under Review",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  validated: {
    label: "Approved",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  rejected: {
    label: "Rejected",
    className: "border-destructive/30 bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
};

/** Shows where the supplier is in the approval process. */
export function ProfileStatusBadge({ status }: { status: SupplierProfileStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.draft;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        meta.className,
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
      Profile: {meta.label}
    </span>
  );
}
