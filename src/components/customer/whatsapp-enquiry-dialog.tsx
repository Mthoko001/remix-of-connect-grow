import { useRef, useState } from "react";
import { Loader2, MessageCircle, Paperclip, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { buildWhatsAppEnquiryMessage, buildWhatsAppUrl } from "@/lib/contact";
import { submitEnquiry } from "@/lib/enquiries";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormErrors = { name?: string; email?: string; cell?: string; issue?: string };

export function WhatsAppEnquiryDialog({
  open,
  onOpenChange,
  supplierAccountId,
  supplierName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierAccountId: string;
  supplierName: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cell, setCell] = useState("");
  const [issue, setIssue] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setName("");
    setEmail("");
    setCell("");
    setIssue("");
    setImage(null);
    setErrors({});
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fieldErrors: FormErrors = {};
    if (!name.trim()) fieldErrors.name = "Enter your name.";
    if (!EMAIL_RE.test(email)) fieldErrors.email = "Enter a valid email address.";
    if (!cell.trim()) fieldErrors.cell = "Enter your cell number.";
    if (!issue.trim()) fieldErrors.issue = "Describe what you need help with.";
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setSubmitting(true);

    // Best-effort: WhatsApp is the primary path the customer expects to
    // work, so a storage failure shouldn't block it — just log it.
    try {
      await submitEnquiry({
        supplierAccountId,
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerCell: cell.trim(),
        message: issue.trim(),
        channel: "whatsapp",
        image,
      });
    } catch (err) {
      console.error("Could not save enquiry record:", err);
    }

    const message = buildWhatsAppEnquiryMessage({
      supplierName,
      customerName: name.trim(),
      email: email.trim(),
      cell: cell.trim(),
      issue: issue.trim(),
      hasImage: !!image,
    });
    window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer");
    setSubmitting(false);
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Message {supplierName} on WhatsApp</DialogTitle>
          <DialogDescription>
            Tell us a bit about your enquiry — we'll open WhatsApp with everything prefilled.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="wa_name">Your Name</Label>
            <Input
              id="wa_name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Thabo Nkosi"
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="wa_email">Email</Label>
              <Input
                id="wa_email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wa_cell">Cell Number</Label>
              <Input
                id="wa_cell"
                value={cell}
                onChange={(e) => setCell(e.target.value)}
                placeholder="082 123 4567"
                aria-invalid={!!errors.cell}
              />
              {errors.cell && <p className="text-sm text-destructive">{errors.cell}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wa_issue">What do you need help with?</Label>
            <Textarea
              id="wa_issue"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="Describe your issue or what you're looking for…"
              className="min-h-[90px]"
              aria-invalid={!!errors.issue}
            />
            {errors.issue && <p className="text-sm text-destructive">{errors.issue}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Photo (optional)</Label>
            {image ? (
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
                <span className="flex min-w-0 items-center gap-2 truncate">
                  <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{image.name}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  aria-label="Remove image"
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/50"
              >
                <Paperclip className="h-4 w-4" />
                Attach a photo
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            />
            {image && (
              <p className="text-xs text-muted-foreground">
                WhatsApp can't accept attachments through this link — once it opens, tap the
                paperclip there to attach this photo yourself.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={submitting} className="w-full gap-2 sm:w-auto">
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageCircle className="h-4 w-4" />
              )}
              {submitting ? "Opening…" : "Continue to WhatsApp"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
