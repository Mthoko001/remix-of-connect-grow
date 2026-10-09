import { Check, X } from "lucide-react";
import { passwordChecks, passwordStrength } from "@/lib/policies";
import { cn } from "@/lib/utils";

const STRENGTH = {
  weak: { label: "Weak", bar: "w-1/3 bg-destructive", text: "text-destructive" },
  medium: { label: "Medium", bar: "w-2/3 bg-orange-500", text: "text-orange-600" },
  strong: { label: "Strong", bar: "w-full bg-verified", text: "text-verified" },
} as const;

export function PasswordRequirements({ password }: { password: string }) {
  const checks = passwordChecks(password);
  const s = STRENGTH[passwordStrength(password)];
  return (
    <div className="space-y-2 rounded-md border border-border bg-muted/30 p-3 text-xs" aria-live="polite">
      {password && (
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Strength</span>
            <span className={cn("font-semibold", s.text)}>{s.label}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className={cn("h-full rounded-full transition-all", s.bar)} />
          </div>
        </div>
      )}
      <p className="font-semibold text-foreground">Password Requirements</p>
      <ul className="space-y-1">
        {checks.map((c) => (
          <li key={c.label} className={cn("flex items-center gap-1.5", c.ok ? "text-verified" : "text-destructive")}>
            {c.ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
            {c.label}
          </li>
        ))}
      </ul>
      <p className="text-muted-foreground">
        Example: <span className="font-mono text-foreground">StrongPassword123!</span>
      </p>
    </div>
  );
}
