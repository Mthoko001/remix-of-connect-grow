import { useEffect, useState } from "react";
import { getSignedMediaUrl } from "@/lib/supplier-profile";
import { CompanyLogo } from "@/components/company-logo";

/** Read-only preview of a private storage object, via a short-lived signed URL. */
export function AdminMediaView({
  path,
  alt,
  variant = "image",
}: {
  path: string;
  alt: string;
  variant?: "image" | "logo";
}) {
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

  if (variant === "logo") {
    return url ? (
      <CompanyLogo src={url} name={alt} />
    ) : (
      <div className="size-20 animate-pulse rounded-lg bg-muted" />
    );
  }

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
