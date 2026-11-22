import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { parseFaqs, type SupplierFaq } from "@/lib/supplier-faq";

/** Admin add/edit/delete for the questions & answers shown on a public supplier profile. */
export function AdminFaqEditor({ supplierAccountId }: { supplierAccountId: string }) {
  const [items, setItems] = useState<SupplierFaq[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void supabase
      .from("tb_supplier_profile")
      .select("faq")
      .eq("supplier_account_id", supplierAccountId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) toast.error("Couldn't load questions & answers.");
        setItems(parseFaqs(data?.faq));
        setDirty(false);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [supplierAccountId]);

  function update(i: number, patch: Partial<SupplierFaq>) {
    setItems((cur) => cur.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
    setDirty(true);
  }

  async function save() {
    const cleaned = items
      .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }))
      .filter((f) => f.question || f.answer);
    if (cleaned.some((f) => !f.question || !f.answer)) {
      toast.error("Every question needs an answer (and every answer a question).");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("tb_supplier_profile")
      .update({ faq: cleaned })
      .eq("supplier_account_id", supplierAccountId);
    setSaving(false);
    if (error) {
      toast.error(`Couldn't save: ${error.message}`);
      return;
    }
    setItems(cleaned);
    setDirty(false);
    toast.success("Questions & answers saved.");
  }

  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Questions & Answers ({items.length})
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1"
          disabled={loading || saving}
          onClick={() => {
            setItems((cur) => [...cur, { question: "", answer: "" }]);
            setDirty(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add question
        </Button>
      </div>

      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No questions yet.</p>
      ) : (
        items.map((f, i) => (
          <div key={i} className="space-y-2 rounded-md bg-muted/40 p-3">
            <div className="flex items-center justify-between">
              <Label htmlFor={`faq-q-${i}`} className="text-xs">
                Question {i + 1}
              </Label>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 gap-1 text-destructive"
                disabled={saving}
                onClick={() => {
                  setItems((cur) => cur.filter((_, idx) => idx !== i));
                  setDirty(true);
                }}
              >
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
            <Input
              id={`faq-q-${i}`}
              value={f.question}
              maxLength={300}
              onChange={(e) => update(i, { question: e.target.value })}
              placeholder="e.g. Do you deliver?"
            />
            <Textarea
              value={f.answer}
              maxLength={2000}
              onChange={(e) => update(i, { answer: e.target.value })}
              placeholder="Answer"
              className="min-h-[80px]"
            />
          </div>
        ))
      )}

      <Button
        type="button"
        variant="outline"
        className="gap-1.5"
        disabled={!dirty || saving || loading}
        onClick={() => void save()}
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save Questions & Answers
      </Button>
    </div>
  );
}
