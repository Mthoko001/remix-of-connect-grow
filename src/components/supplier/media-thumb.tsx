import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getSignedMediaUrl } from "@/lib/supplier-profile";

type MediaThumbProps = {
  path: string;
  alt: string;
  onRemove: () => void;
};

/** Renders a private storage object via a short-lived signed URL. */
export function MediaThumb({ path, alt, onRemove }: MediaThumbProps) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void getSignedMediaUrl(path).then((signed) => {
      if (active) setUrl(signed);
    });
    return () => {
      active = false;
    };
  }, [path]);

  return (
    <div className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
      {url ? (
        <img src={url} alt={alt} loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full animate-pulse bg-muted" />
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${alt}`}
        className="absolute right-1 top-1 rounded-full bg-background/90 p-1 text-foreground shadow transition hover:bg-destructive hover:text-destructive-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
