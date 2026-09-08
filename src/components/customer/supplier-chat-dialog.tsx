import { useState } from "react";
import { Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ChatMessage = {
  id: string;
  from: "customer" | "supplier";
  text: string;
  time: string;
};

/**
 * DUMMY UI ONLY — messages live in local component state and reset when the
 * dialog closes. No backend, no persistence. Stands in for the real in-app
 * chat feature until that's built.
 */
export function SupplierChatDialog({
  open,
  onOpenChange,
  supplierName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierName: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "seed-1",
      from: "supplier",
      text: `Hi! Thanks for reaching out to ${supplierName}. How can we help?`,
      time: "09:14",
    },
  ]);
  const [draft, setDraft] = useState("");

  function handleSend() {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        from: "customer",
        text,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setDraft("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] flex-col sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chat with {supplierName}</DialogTitle>
          <DialogDescription>Usually replies within a few hours.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-3 overflow-y-auto py-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.from === "customer" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                  m.from === "customer"
                    ? "bg-brand text-brand-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <p>{m.text}</p>
                <p
                  className={`mt-1 text-[10px] ${
                    m.from === "customer" ? "text-brand-foreground/70" : "text-muted-foreground"
                  }`}
                >
                  {m.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 border-t border-border pt-3"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message…"
            className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          />
          <Button type="submit" size="icon" disabled={!draft.trim()} aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
