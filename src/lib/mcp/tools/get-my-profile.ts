import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_my_business_profile",
  title: "Get my business profile",
  description:
    "Return the signed-in supplier's LeadLink business profile: name, description, address, cell number, media paths and status.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("tb_supplier_profile")
      .select(
        "supplier_profile_id, business_name, business_description, address, cell_no, business_logo, product_images, status, date_created, date_updated",
      )
      .eq("supplier_account_id", ctx.getUserId()!)
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) {
      return {
        content: [
          { type: "text", text: "No business profile yet. Use update_my_business_profile to start one." },
        ],
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { profile: data },
    };
  },
});
