import { Facebook, Link2, Linkedin, MessageCircle, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Props = { url: string; name: string };

/** Share links for a public supplier profile. */
export function ShareBusiness({ url, name }: Props) {
  const u = encodeURIComponent(url);
  const text = encodeURIComponent(`Check out ${name} on GrowMeOnline: ${url}`);
  const links = [
    { label: "WhatsApp", icon: MessageCircle, href: `https://wa.me/?text=${text}` },
    { label: "Facebook", icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { label: "LinkedIn", icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    {
      label: "X",
      icon: XIcon,
      href: `https://twitter.com/intent/tweet?url=${u}&text=${encodeURIComponent(`${name} on GrowMeOnline`)}`,
    },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Profile link copied successfully.");
    } catch {
      toast.error("Could not copy the link.");
    }
  };

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
        <Share2 className="h-4 w-4 text-primary" />
        Share This Business
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={copy} className="col-span-2">
          <Link2 className="h-4 w-4" />
          Copy Link
        </Button>
        {links.map(({ label, icon: Icon, href }) => (
          <Button key={label} variant="outline" asChild>
            <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`Share on ${label}`}>
              <Icon className="h-4 w-4" />
              {label}
            </a>
          </Button>
        ))}
      </div>
    </section>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M18.9 2H22l-7.6 8.7L23 22h-6.8l-5.3-6.9L4.8 22H1.7l8.1-9.3L1 2h7l4.8 6.3L18.9 2Zm-1.2 18h1.7L6.4 3.9H4.6L17.7 20Z" />
    </svg>
  );
}
