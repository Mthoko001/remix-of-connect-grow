import { useEffect, useState } from "react";
import { getSignedMediaUrl } from "@/lib/supplier-profile";

/** Read-only preview of a private storage object, via a short-lived signed URL. */
export function AdminMediaView({ path, alt }: { path: string; alt: string }) {
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
    <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
      {url ? (
        <img src={url} alt={alt} loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full animate-pulse bg-muted" />
      )}
    </div>
  );
}
