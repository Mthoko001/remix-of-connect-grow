import { useEffect, useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";

type TurnstileOptions = {
  sitekey: string;
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
};

type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileOptions) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SITE_KEY = import.meta.env["VITE_TURNSTILE_SITE_KEY"]?.trim();
const SCRIPT_ID = "cloudflare-turnstile-api";
let scriptLoad: Promise<void> | undefined;

function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (scriptLoad) return scriptLoad;

  scriptLoad = new Promise<void>((resolve, reject) => {
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
    }

    script.addEventListener(
      "load",
      () => {
        if (window.turnstile) resolve();
        else reject(new Error("Turnstile loaded without its verification API."));
      },
      { once: true },
    );
    script.addEventListener(
      "error",
      () => reject(new Error("Turnstile could not be loaded. Check your connection and retry.")),
      { once: true },
    );

    if (!script.isConnected) document.head.append(script);
  }).catch((error: unknown) => {
    document.getElementById(SCRIPT_ID)?.remove();
    scriptLoad = undefined;
    throw error;
  });

  return scriptLoad;
}

export function TurnstileWidget({
  onTokenChange,
  resetKey,
}: {
  onTokenChange: (token: string) => void;
  resetKey: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "verified" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!SITE_KEY || !containerRef.current) return;
    let cancelled = false;
    let widgetId: string | undefined;
    setStatus("loading");
    setErrorMessage("");
    onTokenChange("");

    void loadTurnstile()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        widgetId = window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          callback: (token) => {
            onTokenChange(token);
            setStatus("verified");
            setErrorMessage("");
          },
          "expired-callback": () => {
            onTokenChange("");
            setStatus("ready");
            setErrorMessage("Verification expired. Please verify again.");
          },
          "error-callback": () => {
            onTokenChange("");
            setStatus("error");
            setErrorMessage("Verification failed. Please try again.");
          },
        });
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "Turnstile could not be loaded.");
      });

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [onTokenChange, resetKey]);

  if (!SITE_KEY) {
    return (
      <p role="alert" className="text-sm text-destructive">
        Sign-up verification is not configured. Please contact the site administrator.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="min-h-[65px]" />
      {status === "loading" && (
        <p role="status" className="text-xs text-muted-foreground">
          Loading bot protection…
        </p>
      )}
      {status === "verified" && (
        <p role="status" className="flex items-center gap-1.5 text-xs text-verified">
          <ShieldCheck className="h-4 w-4" />
          Verification complete
        </p>
      )}
      {errorMessage && (
        <p role="alert" className="text-xs text-destructive">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
