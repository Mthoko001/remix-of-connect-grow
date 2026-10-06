import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage, type PolicySection } from "@/components/legal/policy-page";
import { PRIVACY_VERSION, SUPPORT_EMAIL } from "@/lib/policies";

const DESC =
  "How GrowMeOnline collects, uses, stores and protects the personal information of customers and suppliers.";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — GrowMeOnline" },
      { name: "description", content: DESC },
      { property: "og:title", content: "GrowMeOnline Privacy Policy" },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

const sections: PolicySection[] = [
  {
    id: "information-collected",
    title: "Information Collected",
    body: (
      <ul>
        <li>Account details: email address and password (stored securely, never readable by us).</li>
        <li>Supplier profiles: business name, description, address, cell number, logo and images.</li>
        <li>Enquiries: customer name, email, cell number, subject, message and optional photo.</li>
        <li>Usage data: anonymous profile-view counts and basic technical information.</li>
        <li>Payment records: package, amount and status (card details are handled by the payment provider, not us).</li>
      </ul>
    ),
  },
  {
    id: "how-used",
    title: "How Data Is Used",
    body: (
      <ul>
        <li>To run your account and display supplier profiles publicly once approved.</li>
        <li>To review enquiries and deliver Qualified Leads to the right supplier.</li>
        <li>To process subscriptions and show profile statistics.</li>
        <li>To prevent spam, fraud and abuse.</li>
      </ul>
    ),
  },
  {
    id: "customer-supplier",
    title: "Customer & Supplier Information",
    body: (
      <p>
        When an enquiry is approved, the customer's contact details and message are shared with
        the chosen supplier so they can respond. Supplier contact details are not shown publicly
        on profiles. Rejected enquiries are never shared with suppliers.
      </p>
    ),
  },
  {
    id: "email",
    title: "Email Communications",
    body: (
      <p>
        We send service emails such as account verification, password resets, enquiry updates,
        lead notifications and payment confirmations. These are needed to use the platform. We
        do not sell your email address.
      </p>
    ),
  },
  {
    id: "data-protection",
    title: "Data Protection",
    body: (
      <p>
        We process personal information in accordance with the Protection of Personal
        Information Act (POPIA). You may ask to access, correct or delete your personal
        information at any time.
      </p>
    ),
  },
  {
    id: "retention",
    title: "Data Retention",
    body: (
      <p>
        We keep account and profile data while your account is active. Enquiry and review
        records are kept for audit and dispute purposes, and payment records for as long as the
        law requires. Data is deleted or anonymised when no longer needed.
      </p>
    ),
  },
  {
    id: "third-party",
    title: "Third-Party Services",
    body: (
      <p>
        We use trusted providers for hosting and storage, email delivery, our customer
        messaging inbox, AI writing assistance for profile descriptions, and payment processing.
        They only receive the information needed to provide their service.
      </p>
    ),
  },
  {
    id: "security",
    title: "Security Measures",
    body: (
      <p>
        Data is encrypted in transit, access is restricted so suppliers only see their own data,
        uploaded files are private by default, and administrative actions are logged.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact Information",
    body: (
      <p>
        For privacy questions or requests, email{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary underline-offset-4 hover:underline">
          {SUPPORT_EMAIL}
        </a>
        .
      </p>
    ),
  },
];

function PrivacyPage() {
  return (
    <PolicyPage
      title="GrowMeOnline Privacy Policy"
      version={PRIVACY_VERSION}
      intro="Your privacy matters to us. This policy explains what information GrowMeOnline collects and how it is used and protected."
      sections={sections}
    />
  );
}
