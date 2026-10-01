import { createClient } from "@supabase/supabase-js";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const suggestionInputSchema = z.object({
  accessToken: z.string().min(1),
  description: z.string().trim().min(1).max(1000),
});

export const suggestBusinessDescription = createServerFn({ method: "POST" })
  .validator(suggestionInputSchema)
  .handler(async ({ data }) => {
    const supabaseUrl = process.env["SUPABASE_URL"];
    const supabaseKey = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase authentication is not configured on the server.");
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: `Bearer ${data.accessToken}` },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    const { data: claims, error: claimsError } = await supabase.auth.getClaims(data.accessToken);
    const userId = claims?.claims?.sub;
    if (claimsError || !userId) {
      throw new Error("Your session is invalid. Please sign in again.");
    }

    const [adminResult, profileResult] = await Promise.all([
      supabase
        .from("tb_admin_account")
        .select("admin_account_id")
        .eq("admin_account_id", userId)
        .maybeSingle(),
      supabase
        .from("tb_supplier_profile")
        .select("supplier_profile_id")
        .eq("supplier_account_id", userId)
        .maybeSingle(),
    ]);
    if (!adminResult.data && !profileResult.data) {
      if (adminResult.error || profileResult.error) {
        throw new Error("Could not verify admin or supplier permissions.");
      }
      throw new Error("Only admins and suppliers with a profile can request suggestions.");
    }

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI suggestions are not configured on the server.");

    const prompt = [
      "Rewrite the supplier business description below as a polished, persuasive single paragraph that helps potential customers understand the business.",
      "Aim for 6-7 complete sentences and roughly 100-150 words. Use relevant details and concrete benefits already supported by the original.",
      "Do not invent or imply services, credentials, locations, guarantees, results, or experience that the original does not state. Do not add filler to reach the target length; if the source lacks detail, keep the rewrite shorter and factual.",
      "Keep the meaning and language of the original. Return only the paragraph, with no heading, bullets, quotation marks, or line breaks. Maximum 1000 characters.",
      "",
      "Original description:",
      data.description,
    ].join("\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        input: prompt,
        stream: true,
        store: false,
        reasoning: { effort: "low", summary: "auto" },
        include: ["reasoning.encrypted_content"],
      }),
    });

    if (!response.ok || !response.body) {
      const detail = await response.text().catch(() => "");
      console.error("AI description suggestion failed:", response.status, detail.slice(0, 300));
      if (response.status === 429) throw new Error("AI is busy right now. Please try again shortly.");
      if (response.status === 402 || response.status === 403) {
        let message = "AI suggestions are unavailable right now.";
        try {
          const parsed = JSON.parse(detail) as { message?: string; error?: { message?: string } };
          message = parsed.message ?? parsed.error?.message ?? message;
        } catch {
          /* keep default */
        }
        throw new Error(message);
      }
      throw new Error("Couldn't generate a suggestion. Please try again.");
    }

    // Consume the SSE stream server-side and collect the output text.
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let text = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const event = JSON.parse(payload) as { type?: string; delta?: string };
          if (event.type === "response.output_text.delta" && event.delta) text += event.delta;
          if (event.type === "error" || event.type === "response.failed") {
            throw new Error("Couldn't generate a suggestion. Please try again.");
          }
        } catch (err) {
          if (err instanceof Error && err.message.startsWith("Couldn't")) throw err;
        }
      }
    }

    const suggestion = text.trim();
    if (!suggestion) throw new Error("The AI returned an empty suggestion. Please try again.");
    if (suggestion.length > 1000) {
      throw new Error("The suggestion is longer than 1000 characters. Please try again.");
    }
    return suggestion;
  });
