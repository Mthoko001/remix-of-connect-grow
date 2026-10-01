# Standardize Company Logo Displays

## Scope
- Add one reusable 80×80 company-logo display with a white background, slight padding, centered alignment, and proportional `object-contain` scaling.
- Use it for supplier cards, featured listings, and public supplier profiles, including the initials fallback.
- Update private supplier and admin logo previews to use the same 80×80 contained treatment while leaving product/service photos cropped as they are.
- Verify the affected pages and current build diagnostics.

## Technical details
- Add a semantic logo-surface color token so the white logo background remains intentional and consistent.
- Keep product image rendering separate from logo rendering to avoid changing gallery/photo behavior.
