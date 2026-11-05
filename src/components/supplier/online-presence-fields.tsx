import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeUrl } from "@/lib/online-presence";

type Props = {
  idPrefix: string;
  socials: string[];
  onSocialsChange: (v: string[]) => void;
} & ({ website: string; onWebsiteChange: (v: string) => void } | { website?: never; onWebsiteChange?: never });

function invalid(v: string) {
  return v.trim() !== "" && !normalizeUrl(v);
}

/** Website + dynamic social media link inputs, shared by supplier and admin editors. */
export function OnlinePresenceFields({ idPrefix, website, socials, onWebsiteChange, onSocialsChange }: Props) {
  return (
    <div className="space-y-4">
      {website !== undefined && onWebsiteChange && <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}_website`}>Website (optional)</Label>
        <Input
          id={`${idPrefix}_website`}
          type="url"
          inputMode="url"
          placeholder="https://www.yourbusiness.co.za"
          value={website}
          onChange={(e) => onWebsiteChange(e.target.value)}
          aria-invalid={invalid(website)}
        />
        {invalid(website) && <p className="text-xs text-destructive">Enter a valid website address.</p>}
      </div>}
      <div className="space-y-2">
        <Label>Social Media Links (optional)</Label>
        {socials.map((link, i) => (
          <div key={i} className="space-y-1">
            <div className="flex gap-2">
              <Input
                type="url"
                inputMode="url"
                aria-label={`Social media link ${i + 1}`}
                placeholder="https://facebook.com/businessname"
                value={link}
                onChange={(e) => onSocialsChange(socials.map((s, j) => (j === i ? e.target.value : s)))}
                aria-invalid={invalid(link)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove link"
                onClick={() => onSocialsChange(socials.filter((_, j) => j !== i))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            {invalid(link) && <p className="text-xs text-destructive">Enter a valid link.</p>}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => onSocialsChange([...socials, ""])}>
          <Plus className="h-4 w-4" /> Add Social Media Link
        </Button>
        <p className="text-xs text-muted-foreground">
          Shown only on your full profile page, not on supplier listings.
        </p>
      </div>
    </div>
  );
}
