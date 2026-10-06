import logoAsset from "@/assets/growme-logo.png.asset.json";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src={logoAsset.url}
        alt="GrowMeOnline logo"
        className="h-9 w-9 rounded-lg object-contain"
      />
      <span className="text-lg font-extrabold tracking-tight text-foreground">
        GrowMe<span className="text-brand">Online</span>
      </span>
    </span>
  );
}
