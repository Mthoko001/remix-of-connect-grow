-- Per-supplier FAQ list, shown on the public supplier profile.
ALTER TABLE public.tb_supplier_profile
  ADD COLUMN IF NOT EXISTS faq jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.tb_supplier_profile.faq IS
  'Ordered list of {"question","answer"} objects shown on the public supplier profile.';

-- Expose the new column through the validated-only public view.
CREATE OR REPLACE VIEW public.tb_public_supplier_listing
AS
 SELECT profile.supplier_profile_id,
    profile.supplier_account_id,
    profile.business_name,
    profile.business_description,
    category.name AS category_name,
    profile.business_logo,
    profile.product_images,
    profile.is_service_provider,
    profile.is_product_seller,
    profile.service_categories,
    profile.other_service,
    profile.products_offered,
    to_char(profile.opening_time::interval, 'HH24:MI'::text) AS opening_time,
    to_char(profile.closing_time::interval, 'HH24:MI'::text) AS closing_time,
    profile.province,
    profile.city,
    profile.cover_image,
    profile.date_created,
    NULL::text AS website_url,
    profile.social_media_links,
    profile.faq
   FROM tb_supplier_profile profile
     LEFT JOIN tb_category category ON category.category_id = profile.category_id
  WHERE profile.status = 'validated'::text;

-- Oura Fragrances (profile 330): SEO profile content.
UPDATE public.tb_supplier_profile
SET business_description = $desc$Oura Fragrances is a South African perfume and fragrance supplier based in Centurion, Pretoria, Gauteng. We formulate our own fragrances in-house and supply long-lasting, designer-inspired perfumes to individual customers, retailers, beauty stores, resellers and corporate clients across South Africa.

## Who we are

We started with a simple goal: to give South African fragrance lovers access to sophisticated, well-made scents without the prices usually attached to them. Our perfumes are formulated in-house and inspired by some of the world's most recognisable fragrance styles and scent profiles, so customers can enjoy the character of a familiar scent at a price that makes everyday wear realistic.

Our collection covers fresh and vibrant citrus fragrances as well as floral, woody, sweet, oriental and aromatic profiles. Whether you are looking for an everyday signature scent, something for a special occasion, or a range of options to sell on to your own customers, Oura Fragrances has a fragrance direction for every personality and preference.

## What we supply

We supply premium fragrances and fragrance products in formats that suit both personal and business buyers:

- Luxury fragrance supply for individual customers who want premium scents at accessible prices
- Premium perfume sales for everyday wear, gifting and special occasions
- Wholesale perfume distribution for retailers, stockists and online sellers
- Fragrance product supply across citrus, floral, woody, sweet, oriental and aromatic families
- Retail perfume supply for beauty stores, cosmetics retailers and independent shops
- Corporate fragrance gifts for client appreciation, staff rewards, event hampers and seasonal gifting
- Bulk perfume orders for businesses that need consistent stock at volume
- Beauty store supply with reliable replenishment for growing customer demand
- Perfume reseller partnerships for entrepreneurs building a fragrance offering of their own
- Designer inspired fragrance collections that let customers explore premium scent profiles affordably

## Wholesale, retail and reseller opportunities

For retailers, we work as a wholesale perfume supplier that understands margin. Bulk purchasing keeps your cost per unit competitive, so you can price attractively and still build a healthy return on every bottle you sell. If you run a beauty store, cosmetics shop, kiosk, salon or online store, our ranges give you a ready-made fragrance section with broad appeal.

For resellers and dropshipping partners, Oura Fragrances offers a practical way to enter the beauty industry without developing a product from scratch. You bring the customers and the brand; we supply the fragrances. It is a low-risk route into a category that customers already understand and actively search for.

For corporate buyers, fragrance makes a memorable gift. We help businesses assemble premium perfume gifts for clients, partners and teams, from single-item hampers to larger orders for events, year-end gifting and customer appreciation campaigns.

## Why customers choose Oura Fragrances

Quality first: every fragrance is formulated in-house, so the scent profile, strength and finish are consistent from batch to batch. Long-lasting performance matters to us because it is what customers notice and come back for.

Value without compromise: because we formulate and supply directly, we can keep prices accessible while still delivering a premium experience. That is what makes affordable luxury realistic for our customers.

Choice that covers every taste: citrus, floral, woody, sweet, oriental and aromatic profiles mean there is an option for every occasion, season and personality.

Service that answers: we respond to enquiries through GrowMeOnline and keep communication clear from the first question to the delivered order, so you know what is available, what it costs and how long it takes.

## Quality assurance

Fragrance is a product customers judge within seconds of the first spray, so consistency is everything. Formulating in-house means we control the blend, the concentration and the finish of every line we supply. Before a fragrance joins the range it is assessed for how it opens, how long it sits on the skin, and how it reads in everyday conditions, not just in the first few minutes.

For business buyers this matters even more. When you stock Oura Fragrances, you are stocking a range you can rely on to perform the same way every time a customer reorders. That consistency protects your reputation with your own customers, which is why we treat quality control as a supply commitment rather than an internal detail.

## Where we serve

We are based in Centurion, Pretoria, Gauteng, and supply customers throughout Gauteng, including Johannesburg, Pretoria, Midrand and Sandton, as well as retailers, resellers and corporate clients across South Africa. National supply means a store in another province can stock the same fragrances as a store in Gauteng.

## Buying in bulk

Businesses that source fragrance products in bulk usually care about three things: cost per unit, reliable availability, and a range broad enough to serve different customers. We structure bulk and wholesale orders around those three. Order volume drives the pricing, our in-house formulation keeps supply predictable, and the range covers enough scent families that one supplier can stock a full fragrance section.

If you are comparing wholesale perfume suppliers in South Africa, start with a smaller order to test movement in your own store, then scale to the quantities that suit your sales. We are glad to advise on which fragrance families tend to move fastest for retail and reseller customers.

## How to order

Send an enquiry through this profile with what you are looking for: individual bottles, a wholesale quantity, a reseller arrangement, or a corporate gift order. Tell us the fragrance direction you prefer and the quantity you need, and we will come back with availability, pricing and the next steps.

We welcome individual buyers, beauty stores, cosmetics retailers, perfume resellers, corporate gifting buyers, wholesale fragrance buyers and dropshipping partners. If you are not sure which option suits your business, send a message and we will help you choose.$desc$,
    products_offered = ARRAY[
      'Perfumes inspired by well-known brands (Formulated in-house)',
      'Luxury Fragrance Supply',
      'Premium Perfume Sales',
      'Wholesale Perfume Distribution',
      'Fragrance Product Supply',
      'Retail Perfume Supply',
      'Corporate Fragrance Gifts',
      'Bulk Perfume Orders',
      'Beauty Store Supply',
      'Perfume Reseller Partnerships',
      'Designer Inspired Fragrance Collections'
    ],
    faq = $faq$[
      {
        "question": "Do you supply perfumes throughout South Africa?",
        "answer": "Yes. Oura Fragrances is based in Centurion, Pretoria, Gauteng, and supplies customers throughout Gauteng, including Johannesburg, Midrand and Sandton, as well as retailers, resellers and corporate clients across South Africa. Send an enquiry with your location and quantity and we will confirm availability and how the order reaches you."
      },
      {
        "question": "Do you offer wholesale fragrance products?",
        "answer": "Yes. We supply fragrance products at wholesale level for retailers, stockists and online sellers. Wholesale pricing is based on order volume, so the more you take, the more competitive your cost per unit becomes. Our ranges cover citrus, floral, woody, sweet, oriental and aromatic fragrance families."
      },
      {
        "question": "Can retailers purchase in bulk?",
        "answer": "Yes. Beauty stores, cosmetics retailers, salons, kiosks and independent shops can order in bulk. Bulk orders keep your cost per unit competitive so you can price attractively and still protect your margin. If you are stocking a fragrance section for the first time, we can help you choose a balanced starting range."
      },
      {
        "question": "Do you offer reseller opportunities?",
        "answer": "Yes. We work with perfume resellers and dropshipping partners who want to sell fragrances without developing a product from scratch. You bring the customers and the brand; we supply the fragrances. Send an enquiry describing your setup and the volumes you expect, and we will explain what is available."
      },
      {
        "question": "What types of fragrances do you supply?",
        "answer": "We formulate our own perfumes in-house, inspired by some of the world's most recognisable fragrance styles and scent profiles. The collection spans fresh and vibrant citrus, floral, woody, sweet, oriental and aromatic profiles, so there is an option for everyday wear, special occasions and different personal styles."
      },
      {
        "question": "Why choose Oura Fragrances?",
        "answer": "Because we formulate in-house and supply directly, we control the blend, concentration and finish of every fragrance. That means consistent, long-lasting performance from batch to batch, a broad range of scent families to choose from, and accessible pricing that makes premium fragrance realistic for both personal buyers and businesses that resell."
      },
      {
        "question": "Do you provide corporate gifting solutions?",
        "answer": "Yes. We help businesses put together premium fragrance gifts for clients, partners and teams, from single-item hampers to larger orders for events, year-end gifting and customer appreciation campaigns. Tell us the number of recipients, the budget range and the occasion, and we will suggest suitable options."
      },
      {
        "question": "How can customers place an order?",
        "answer": "Use the Send Enquiry button on this profile. Tell us whether you need individual bottles, a wholesale quantity, a reseller arrangement or a corporate gift order, along with your preferred fragrance direction and quantity. We respond during business hours, Monday to Friday, 09:00 to 17:00, with availability, pricing and next steps."
      }
    ]$faq$::jsonb
WHERE supplier_profile_id = 330;