# Connect your Gemini key to the "improve description" feature

The "improve business description" suggestions (Business Profile page and admin review) already call Gemini directly. They only fail today because no Gemini key is saved, so the app says "Gemini is not configured".

## Steps
1. Open a secure form so you can paste your Gemini key. It's saved as a private server setting and never appears in the app or the code.
2. Keep the existing feature as it is, using your key with the current Gemini Flash model and the same rewrite instructions (no invented details, about 6-7 sentences, maximum 1000 characters).
3. Make the error messages clearer, so a wrong or expired key says "Your Gemini key was rejected" rather than a general failure.
4. Test it: send a real sample description through the feature and check that a suggestion comes back.

## Alternative (no key needed)
The same Gemini models are already built into this project. They use your Lovable workspace credits, and you get usage logs and spending limits in the AI tab, with no Google account or key to manage. You can switch either way later. Unless you ask for the built-in route, I'll use your key.

## Technical details
- Secret name: `GEMINI_API_KEY`, read inside the server function handler in `src/lib/admin-description-ai.functions.ts`. No change to who can use it: admins and suppliers with a profile.
- Map Gemini 400/401/403 to a "key rejected" message and keep the 429 rate-limit message. No retries.
