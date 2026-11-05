import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Mail, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CONTACT_SUBJECTS, contactSchema } from "@/lib/contact-schema";
import { submitContactMessage } from "@/lib/contact.functions";
import { openLiveChat } from "@/components/live-chat";

const EMPTY = { fullName: "", email: "", phone: "", subject: "General Enquiry", message: "" };

export function ContactSection() {
  const send = useServerFn(submitContactMessage);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof EMPTY) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const i of parsed.error.issues) errs[String(i.path[0])] ??= i.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      await send({ data: parsed.data });
      setDone(true);
      setForm(EMPTY);
    } catch {
      toast.error("Could not send your message. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const err = (k: string) => errors[k] && <p className="mt-1 text-xs text-destructive">{errors[k]}</p>;

  return (
    <section id="contact-form" className="scroll-mt-20 border-t border-border bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-5 lg:px-8">
        <div className="lg:col-span-2">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Get in touch</h2>
          <p className="mt-3 text-muted-foreground">
            Have a question about GrowMeOnline? Send us a message and our team will reply by email.
          </p>
          <div className="mt-6 space-y-3 text-sm">
            <a href="mailto:info@growmeonline.co.za" className="flex items-center gap-2 text-foreground hover:text-brand">
              <Mail className="h-4 w-4 text-brand" /> info@growmeonline.co.za
            </a>
            <button type="button" onClick={openLiveChat} className="flex items-center gap-2 text-foreground hover:text-brand">
              <MessageCircle className="h-4 w-4 text-brand" /> Chat with us live
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-3">
          {done ? (
            <div className="py-10 text-center">
              <h3 className="text-xl font-semibold text-foreground">Thank you!</h3>
              <p className="mt-2 text-muted-foreground">Your message has been sent. We'll get back to you soon.</p>
              <Button variant="outline" className="mt-6" onClick={() => setDone(false)}>Send another message</Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="c-name">Full name *</Label>
                <Input id="c-name" value={form.fullName} onChange={set("fullName")} maxLength={100} />
                {err("fullName")}
              </div>
              <div>
                <Label htmlFor="c-email">Email *</Label>
                <Input id="c-email" type="email" value={form.email} onChange={set("email")} maxLength={255} />
                {err("email")}
              </div>
              <div>
                <Label htmlFor="c-phone">Phone (optional)</Label>
                <Input id="c-phone" type="tel" value={form.phone} onChange={set("phone")} maxLength={20} />
                {err("phone")}
              </div>
              <div>
                <Label htmlFor="c-subject">Subject *</Label>
                <select
                  id="c-subject"
                  value={form.subject}
                  onChange={set("subject")}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-foreground"
                >
                  {CONTACT_SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="c-message">Message *</Label>
                <Textarea id="c-message" rows={5} value={form.message} onChange={set("message")} maxLength={2000} />
                {err("message")}
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={busy} className="w-full sm:w-auto">
                  <Send className="mr-2 h-4 w-4" /> {busy ? "Sending..." : "Send message"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
