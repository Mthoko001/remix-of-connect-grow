import { useRef, useState } from "react";
import { CheckCircle2, Loader2, Paperclip, Send, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { submitEnquiry } from "@/lib/enquiries";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormErrors = { name?: string; email?: string; cell?: string; issue?: string };

export function InAppEnquiryDialog({
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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setName("");
    setEmail("");
    setCell("");
    setIssue("");
    setImage(null);
    setErrors({});
    setSubmitError(null);
    setSent(false);
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
    setSubmitError(null);
    try {
      await submitEnquiry({
        supplierAccountId,
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerCell: cell.trim(),
        message: issue.trim(),
        channel: "in_app",
        image,
      });
      setSent(true);
    } catch {
      setSubmitError("Couldn't send your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        {sent ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">Your message has been sent</p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                We've let {supplierName} know — please wait for their response. They'll reach out
                using the email or cell number you provided.
              </p>
            </div>
            <Button onClick={() => handleOpenChange(false)} className="mt-2 w-full">
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Message {supplierName}</DialogTitle>
              <DialogDescription>
                Send your enquiry directly — {supplierName} will respond to you here on LeadLink.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="ia_name">Your Name</Label>
                <Input
                  id="ia_name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Thabo Nkosi"
                  aria-invalid={!!errors.name}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="ia_email">Email</Label>
                  <Input
                    id="ia_email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ia_cell">Cell Number</Label>
                  <Input
                    id="ia_cell"
                    value={cell}
                    onChange={(e) => setCell(e.target.value)}
                    placeholder="082 123 4567"
                    aria-invalid={!!errors.cell}
                  />
                  {errors.cell && <p className="text-sm text-destructive">{errors.cell}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ia_issue">What do you need help with?</Label>
                <Textarea
                  id="ia_issue"
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
              </div>

              {submitError && <p className="text-sm text-destructive">{submitError}</p>}

              <Button type="submit" disabled={submitting} className="w-full gap-2">
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {submitting ? "Sending…" : "Send Message"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
