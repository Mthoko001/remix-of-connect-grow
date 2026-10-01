import { cn } from "@/lib/utils";

type CompanyLogoProps = {
  src?: string | null;
  name: string;
  initials?: string;
  fallbackClassName?: string;
};

/** Consistent, uncropped company-logo presentation across the app. */
export function CompanyLogo({
  src,
  name,
  initials,
  fallbackClassName,
}: CompanyLogoProps) {
  return (
    <span
      className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-logo-surface"
    >
      {src ? (
        <img
          src={src}
          alt={`${name} logo`}
          loading="lazy"
          className="h-full w-full object-contain p-1"
        />
      ) : (
        <span
          aria-label={`${name} logo placeholder`}
          className={cn(
            "grid h-full w-full place-items-center text-lg font-bold text-white",
            fallbackClassName,
          )}
        >
          {initials}
        </span>
      )}
    </span>
  );
}