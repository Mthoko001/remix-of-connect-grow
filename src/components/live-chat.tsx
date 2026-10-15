import { useEffect } from "react";

// Chatwoot "Website" inbox. The website token is public (safe in the browser).
// TODO: paste the token from Chatwoot → Settings → Inboxes → (Website inbox) → Configuration.
const CHATWOOT_BASE_URL = "http://node27307-chatwoot.jnb1.cloudlet.cloud:11109";
const CHATWOOT_WEBSITE_TOKEN = "";

type ChatwootWindow = Window & {
  chatwootSettings?: Record<string, unknown>;
  chatwootSDK?: { run: (o: { websiteToken: string; baseUrl: string }) => void };
  $chatwoot?: { toggle: (s?: "open" | "close") => void };
};

/** Opens the live chat if loaded, otherwise falls back to email. */
export function openLiveChat() {
  const w = window as ChatwootWindow;
  if (w.$chatwoot) w.$chatwoot.toggle("open");
  else window.location.href = "mailto:info@growmeonline.co.za";
}

/** Loads the Chatwoot live-chat bubble on public pages (client only). */
export function LiveChat() {
  useEffect(() => {
    if (!CHATWOOT_WEBSITE_TOKEN || window.location.pathname.startsWith("/admin")) return;
    const w = window as ChatwootWindow;
    if (document.getElementById("chatwoot-sdk")) return;
    w.chatwootSettings = { position: "right", type: "standard", launcherTitle: "Chat with GrowMeOnline" };
    const s = document.createElement("script");
    s.id = "chatwoot-sdk";
    s.src = `${CHATWOOT_BASE_URL}/packs/js/sdk.js`;
    s.async = true;
    s.onload = () => w.chatwootSDK?.run({ websiteToken: CHATWOOT_WEBSITE_TOKEN, baseUrl: CHATWOOT_BASE_URL });
    document.body.appendChild(s);
  }, []);
  return null;
}
