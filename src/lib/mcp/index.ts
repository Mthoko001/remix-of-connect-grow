import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getMyAccount from "./tools/get-my-account";
import getMyProfile from "./tools/get-my-profile";
import updateMyProfile from "./tools/update-my-profile";

// The OAuth issuer must be the direct Supabase host; the project ref is the
// only Supabase value that survives publish unchanged.
const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "remix-of-connect-grow",
  title: "Remix of Connect & Grow",
  version: "0.1.0",
  instructions:
    "Tools for LeadLink suppliers. Read the signed-in supplier's account and business profile, and update their profile details. Each caller only ever sees their own data.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getMyAccount, getMyProfile, updateMyProfile],
});
