import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "update_my_business_profile",
  title: "Update my business profile",
  description:
    "Create or update the signed-in supplier's LeadLink business profile text fields. Only provided fields are changed. Images are managed in the app.",
  inputSchema: {
    business_name: z.string().trim().optional().describe("Trading name of the business."),
    business_description: z
      .string()
      .trim()
      .optional()
      .describe("What the business offers, in a short paragraph."),
    address: z.string().trim().optional().describe("Business address."),
    cell_no: z.string().trim().optional().describe("Contact cell number."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const patch = Object.fromEntries(
      Object.entries(input).filter(([, v]) => typeof v === "string" && v.length > 0),
    );
    if (Object.keys(patch).length === 0) {
      return {
        content: [{ type: "text", text: "Provide at least one field to update." }],
        isError: true,
      };
    }

    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("tb_supplier_profile")
      .upsert(
        { supplier_account_id: ctx.getUserId()!, ...patch },
        { onConflict: "supplier_account_id" },
      )
      .select(
        "supplier_profile_id, business_name, business_description, address, cell_no, status, date_updated",
      )
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { profile: data },
    };
  },
});
