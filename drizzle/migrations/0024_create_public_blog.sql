CREATE TABLE public.tb_blog_post (
 blog_post_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 title text NOT NULL,
 slug text NOT NULL UNIQUE,
 excerpt text NOT NULL,
 content text NOT NULL,
 cover_image text,
 category text NOT NULL DEFAULT 'General',
 status text NOT NULL DEFAULT 'draft',
 published_at timestamptz,
 author_name text NOT NULL DEFAULT 'GrowMeOnline Team',
 date_created timestamptz NOT NULL DEFAULT now(),
 date_updated timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT tb_blog_post_status_check CHECK (status IN ('draft', 'published'))
);
GRANT SELECT ON public.tb_blog_post TO anon, authenticated;
GRANT ALL ON public.tb_blog_post TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.tb_blog_post_blog_post_id_seq TO service_role;
ALTER TABLE public.tb_blog_post ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads published blog posts" ON public.tb_blog_post FOR SELECT TO anon, authenticated USING (status = 'published' AND published_at <= now());
CREATE INDEX tb_blog_post_publication_idx ON public.tb_blog_post (status, published_at DESC);
CREATE TRIGGER tb_blog_post_update_timestamp BEFORE UPDATE ON public.tb_blog_post FOR EACH ROW EXECUTE FUNCTION public.update_date_updated_column();
INSERT INTO public.tb_blog_post (title, slug, excerpt, content, category, status, published_at) VALUES
('How to get more enquiries as a local service provider', 'get-more-enquiries-local-service-provider', 'Turn a clear business profile, useful photographs, and thoughtful replies into better conversations with local customers.', $article$## Start with the customer’s question

When someone needs a plumber, caterer, cleaner, or shuttle service, they are usually trying to solve a specific problem. Your first job is to make it easy for them to recognise that you can help. A clear description of your services is more useful than a promise to be the best business in South Africa.

Explain what you do, where you work, and which types of jobs suit your business. If you provide airport transfers around Pretoria, say that plainly. If you supply celebration cakes, describe the occasions and styles you actually offer. Specific information helps customers send relevant enquiries instead of vague requests.

## Make your profile easy to understand

Before sharing your profile, check these essentials:

- Use the business name customers already know.
- Describe your main services in everyday language.
- Keep your city, province, and business hours accurate.
- Upload clear photographs of real work or products, with permission.
- Answer common questions without inventing prices or guarantees.

A customer should not have to guess whether you can handle their request. Where details depend on the job, explain what information you need before quoting.

## Share a useful destination

Share your GrowMeOnline profile with existing customers and on your own social pages. Add a short sentence about the service rather than posting a bare link. For example, explain that customers can view your recent work and submit an enquiry through the platform.

Ask satisfied customers if they are comfortable recommending your business. Avoid buying reviews or claiming recommendations you cannot support. Consistent, honest communication builds trust over time.

## Reply with a clear next step

When an enquiry is released to your business, read the request carefully. Acknowledge the customer’s needs, ask only for missing details, and explain what happens next. If you cannot take the job, a polite answer is still better than silence.

Keep notes on which questions customers repeatedly ask. Those questions can become improvements to your description or photographs, helping the next customer make an informed decision.

## Keep improving

More enquiries are not guaranteed by a profile alone. Start with accurate details, useful examples, and dependable replies. Review your profile regularly, and focus on helping suitable customers take one confident step towards working with you.$article$, 'For Suppliers', 'published', '2026-11-15T08:00:00Z'),
('What makes a business profile stand out', 'business-profile-that-stands-out', 'A practical checklist for turning your business profile into a clear, credible introduction—not a collection of empty promises.', $article$## Clarity beats clever wording

A strong business profile answers three questions quickly: what does this business offer, where does it operate, and why should a customer enquire? You do not need a long sales pitch to answer them. Start with a straightforward introduction that sounds like your business and reflects the work you actually do.

Describe your main offering first. Then explain who you serve and the practical details customers need before contacting you. An accounting practice, a cake maker, and a garden maintenance team will need different details, but all benefit from clear language.

## Show the work, not just the logo

Your logo can help people recognise your business, but photographs often explain your offering more effectively. Choose sharp, well-lit images that show real products, completed work, or the vehicles and equipment involved in your service.

Only upload images you own or have permission to use. Do not present a category photograph as proof of a project you completed. Where possible, include several examples rather than repeatedly uploading the same image.

## Build a practical description

Use this checklist when reviewing your profile:

1. Introduce your core business in one clear paragraph.
2. List the products or services customers can request.
3. Explain your working areas without overstating your reach.
4. Keep opening hours and contact details up to date.
5. Remove claims you cannot demonstrate or explain.
6. Include useful answers to recurring customer questions.

If an offering depends on availability, customisation, or an assessment, make that clear. Customers appreciate knowing what information they should include in an enquiry.

## Write for people first

Avoid repeating the same town and service name in every sentence. Search engines are not the only readers: a real customer needs to understand your business. Natural descriptions, useful headings, and accurate product names are better than a paragraph packed with keywords.

Read the profile aloud. If a sentence feels confusing or exaggerated, simplify it. Ask someone unfamiliar with the business to explain what you offer after reading the page.

## Treat your profile as a living introduction

A profile is not finished forever after the first upload. Update it when your services, photographs, hours, or working areas change. Small, accurate improvements help customers judge whether you are a good match and make their first enquiry more useful.$article$, 'For Suppliers', 'published', '2026-11-12T08:00:00Z'),
('How GrowMeOnline reviews business profiles—and why it matters', 'how-business-verification-works', 'Understand profile review, what a verified listing means, and why customers should still discuss their requirements before hiring.', $article$## Why business profiles are reviewed

Customers need enough information to decide whether a supplier is relevant to their request. GrowMeOnline reviews submitted business profiles before they appear as approved public listings. This gives the platform a chance to check the information supplied and identify details that need clarification.

Review is part of building a useful marketplace. It is not a guarantee that every future job will meet a customer’s expectations, and it should not replace a customer’s own assessment of a supplier.

## From draft to public listing

A supplier creates an account and completes a business profile. While the profile is a draft, the business can work on its description, offerings, location, and photographs. When the required information is ready, the supplier can submit the profile for review.

An administrator reviews the submission. An approved profile can appear publicly. If changes are needed, the supplier can receive feedback, update the details, and submit again. Suppliers should follow the current guidance shown in their account rather than assume a fixed review time.

## Prepare information that helps reviewers

Before submitting, check the following:

- The business name is accurate and consistent.
- The description explains genuine services or products.
- The selected category fits the business’s main work.
- Location and contact information are current.
- Photographs are relevant and used with permission.
- Statements about experience or qualifications are truthful.

Do not include invented accreditations, unsupported awards, or guarantees. If a claim needs explanation, describe it plainly and be prepared to clarify it.

## What customers should understand

A verified or approved listing indicates that the profile has passed the platform’s review process. It does not mean GrowMeOnline guarantees workmanship, insurance, professional registration, or a particular outcome.

For work that requires a licence, specialist registration, or safety certificate, ask the supplier for the relevant evidence and check it with the appropriate organisation. Discuss scope, timing, payment terms, and any written quotation directly before committing.

## Trust is an ongoing responsibility

Suppliers help maintain trust by keeping their profiles accurate and responding professionally. Customers help by providing clear requests and asking sensible questions. Profile review is a useful starting point, while an informed conversation remains an important part of choosing the right business for a particular job.$article$, 'Platform Updates', 'published', '2026-11-09T08:00:00Z'),
('How to choose a trustworthy supplier', 'choose-a-trustworthy-supplier', 'Compare relevant experience, ask better questions, and agree the important details before booking a local business.', $article$## Begin with your actual requirements

Finding a trustworthy supplier starts with knowing what you need. Write a short description of the job or product, where it is needed, and your preferred timing. If you have a budget range, decide whether sharing it would help a supplier propose a suitable option.

For a shuttle booking, the number of passengers and pickup points matter. For catering, the guest count and dietary requirements matter. Clear requirements make it easier to compare suppliers on the same basis instead of collecting quotations for different things.

## Look for a relevant match

Read each business profile carefully. Look for services that fit your request, a suitable working area, and photographs or descriptions that explain the offering. An attractive image is helpful, but it should not be your only reason for choosing a business.

An approved GrowMeOnline profile is a useful starting point. Still ask for evidence of any qualification, registration, or insurance that is important to the work. Verification of a listing is not a guarantee of a future result.

## Ask questions before committing

A few practical questions can prevent misunderstandings:

- What is included in the quotation, and what is excluded?
- Is the requested date or delivery window available?
- Who will carry out the work or deliver the product?
- Are materials, travel, or additional charges included?
- What deposit and payment terms apply?
- What happens if the scope or timing changes?

Keep written answers where possible. For larger jobs, ask for a written scope and quotation that you can refer to later.

## Compare more than the headline price

The cheapest option may exclude something another supplier includes. Compare the proposed work, materials, timing, and communication—not just the total. If a price seems unexpectedly low, ask how it was calculated rather than assuming it is a bargain.

Be cautious about pressure to pay immediately, unexplained account changes, or a refusal to clarify basic terms. Independently confirm payment details before sending money, particularly when instructions change during a conversation.

## Take a confident next step

Use the supplier’s enquiry form to introduce your request with enough detail for a meaningful reply. An enquiry starts a conversation; it is not a confirmed booking. Once you have compared suitable options and agreed the important terms, choose the business that best fits your requirements.$article$, 'For Customers', 'published', '2026-11-06T08:00:00Z');