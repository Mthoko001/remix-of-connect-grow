import { createClient } from "@supabase/supabase-js";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const suggestionInputSchema = z.object({
  accessToken: z.string().min(1),
  description: z.string().trim().min(1).max(1000),
});

const geminiResponseSchema = z.object({
  candidates: z
    .array(
      z.object({
        content: z.object({
          parts: z.array(z.object({ text: z.string() })),
        }),
      }),
    )
    .optional(),
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

    const apiKey = process.env["GEMINI_API_KEY"];
    if (!apiKey) {
      throw new Error("Gemini is not configured. Add GEMINI_API_KEY to the server environment.");
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: [
                    "Rewrite the supplier business description below as a polished, persuasive single paragraph that helps potential customers understand the business.",
                    "Aim for 6-7 complete sentences and roughly 100-150 words, which should display as about 6-7 lines in the description area. Use relevant details and concrete benefits already supported by the original.",
                    "Do not invent or imply services, credentials, locations, guarantees, results, or experience that the original does not state. Do not add filler to reach the target length; if the source lacks detail, keep the rewrite shorter and factual.",
                    "Keep the meaning and language of the original. Return only the paragraph, with no heading, bullets, quotation marks, or line breaks. Maximum 1000 characters.",
                    "",
                    "Original description:",
                    data.description,
                  ].join("\n"),
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 500,
          },
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Gemini is rate-limited right now. Please try again shortly.");
      }
      console.error("Gemini description suggestion failed with status:", response.status);
      throw new Error("Gemini couldn't generate a suggestion. Please try again.");
    }

    const result = geminiResponseSchema.parse(await response.json());
    const suggestion = result.candidates?.[0]?.content.parts
      .map((part) => part.text)
      .join("")
      .trim();
    if (!suggestion) throw new Error("Gemini returned an empty suggestion. Please try again.");
    if (suggestion.length > 1000) {
      throw new Error("The suggestion is longer than 1000 characters. Please try again.");
    }
    return suggestion;
  });
