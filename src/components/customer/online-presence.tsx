import { Facebook, Instagram, Link2, Linkedin, Youtube } from "lucide-react";
import { detectPlatform, PLATFORM_LABEL, publicSocialLinks, type SocialPlatform } from "@/lib/online-presence";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.9 2H22l-7.6 8.7L23 22h-6.8l-5.3-6.9L4.8 22H1.7l8.1-9.3L1 2h6.9l4.8 6.4L18.9 2zm-1.2 18h1.9L6.4 3.9H4.4L17.7 20z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M16.6 2h-3.3v13.4a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.2a6.3 6.3 0 1 0 5.3 6.2V8.6a7.9 7.9 0 0 0 4.4 1.4V6.7A4.6 4.6 0 0 1 16.6 2z" />
    </svg>
  );
}

const ICONS: Record<SocialPlatform, React.ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  x: XIcon,
  youtube: Youtube,
  tiktok: TikTokIcon,
  other: Link2,
};

/** Public profiles expose supported social networks only, never supplier websites. */
export function OnlinePresence({ socials }: { socials: string[] }) {
  const links = publicSocialLinks(socials);
  if (links.length === 0) return null;
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {links.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-medium text-muted-foreground">Follow Us:</span>
          {links.map((url) => {
            const p = detectPlatform(url);
            const Icon = ICONS[p];
            return (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label={p === "other" ? url : PLATFORM_LABEL[p]}
                title={p === "other" ? url : PLATFORM_LABEL[p]}
                className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background text-foreground transition hover:-translate-y-0.5 hover:border-primary hover:text-primary"
              >
                <Icon className="h-4 w-4" />
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
