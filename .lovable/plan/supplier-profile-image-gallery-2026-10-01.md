# Supplier Profile Image Gallery

## What will change
- Make every product/service image on a public supplier profile clickable.
- Open the selected image in a full-screen lightbox without leaving the profile page.
- Add previous and next controls, a close control, an image counter, and a thumbnail strip with a clear selected state.
- Add zoom in, zoom out, and reset controls while keeping the full image visible and proportional.
- Support keyboard navigation with Left/Right arrows and Escape, plus touch-friendly controls on mobile.

## Technical details
- Create a focused reusable gallery lightbox component using the existing dialog and button components.
- Keep the main image on `object-contain`; gallery thumbnails also use contained scaling so uploaded images are never cropped.
- Lock zoom to safe bounds and reset it when changing images or closing the viewer.
- Update the public supplier profile gallery to use the lightbox and accessible image buttons.
- Verify the public supplier profile on desktop and mobile, including navigation, zoom, close behavior, and absence of console errors.
