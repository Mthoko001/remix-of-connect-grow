# Add two admins

Both emails already have GrowMeOnline logins. They were created as supplier sign-ups and are still at the "pending onboarding" stage:
- norrisdzot@gmail.com
- nonhlew.miya@gmail.com

## What will change
1. Give both accounts full admin access. That covers every admin page: Overview, Lead Queue, Live Suppliers, Categories, Packages and Subscriptions.
2. Set the password for both accounts to the one you asked for. Their old passwords will stop working.
3. Their supplier records stay in place, so they can still use the supplier area if needed.
4. Sign in at /admin/login with each account to confirm the admin area opens.

## Note
Both accounts will share one simple password that has now been typed in chat. Please change each password after the first login, or ask me to set separate passwords.

## Technical details
- Add each account to the admin list with the "admin" role, marked active. This uses a one-off database change, not new code.
- Set the passwords server-side using the backend's admin user tools.
- seja.mthoko@gmail.com stays an admin. No app code changes are needed.
