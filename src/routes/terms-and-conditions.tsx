import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage, type PolicySection } from "@/components/legal/policy-page";
import { SUPPORT_EMAIL, TERMS_VERSION } from "@/lib/policies";

const DESC =
  "The terms that govern using GrowMeOnline as a supplier or customer, including qualified leads, subscriptions and payments.";

export const Route = createFileRoute("/terms-and-conditions")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — GrowMeOnline" },
      { name: "description", content: DESC },
      { property: "og:title", content: "GrowMeOnline Terms & Conditions" },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsPage,
});

const sections: PolicySection[] = [
  {
    id: "introduction",
    title: "Introduction",
    body: (
      <p>
        GrowMeOnline is an online marketplace that connects customers with local suppliers of
        products and services. By creating an account or using the platform you agree to these
        Terms & Conditions. If you do not agree, please do not use GrowMeOnline.
      </p>
    ),
  },
  {
    id: "supplier-responsibilities",
    title: "Supplier Responsibilities",
    body: (
      <ul>
        <li>Provide accurate, truthful business information, images and contact details.</li>
        <li>Only list products and services you are legally able to provide.</li>
        <li>Respond to customer leads professionally and within a reasonable time.</li>
        <li>Keep your login details secure and notify us of any unauthorised use.</li>
        <li>Profiles are reviewed by our team and may be rejected or edited if inaccurate.</li>
      </ul>
    ),
  },
  {
    id: "customer-responsibilities",
    title: "Customer Responsibilities",
    body: (
      <ul>
        <li>Submit genuine enquiries with correct contact information.</li>
        <li>Do not send spam, abusive or misleading messages.</li>
        <li>
          Agreements for work or goods are made directly between you and the supplier;
          GrowMeOnline is not a party to them.
        </li>
      </ul>
    ),
  },
  {
    id: "qualified-lead-policy",
    title: "Qualified Lead Policy",
    body: (
      <p>
        Every enquiry is reviewed by the GrowMeOnline team before it is released to a supplier.
        Enquiries that are spam, duplicates, for the wrong supplier or category, outside the
        service area, incomplete or with invalid contact details may be rejected. Only approved
        enquiries ("Qualified Leads") are sent to suppliers. Rejected enquiries are kept for
        audit purposes but are never shown to the supplier.
      </p>
    ),
  },
  {
    id: "free-leads",
    title: "First 5 Qualified Leads Free",
    body: (
      <p>
        Each supplier receives their first five Qualified Leads free of charge. Rejected
        enquiries do not count towards this allowance. Once five Qualified Leads have been
        received, an active subscription is required to continue receiving new leads. Leads
        already received remain accessible.
      </p>
    ),
  },
  {
    id: "subscription",
    title: "Subscription Requirements",
    body: (
      <p>
        Subscriptions run for the duration of the package purchased. While a subscription is
        active, the free-lead limit does not apply. When a subscription expires your profile
        stays listed, but new leads are paused until you renew.
      </p>
    ),
  },
  {
    id: "payments",
    title: "Payments & Pricing",
    body: (
      <p>
        Prices are shown on the Pricing page in South African Rand and may change from time to
        time; changes do not affect a subscription already paid for. Payments are processed by a
        secure third-party payment provider. A subscription is only activated once payment has
        been confirmed by that provider. Fees are non-refundable except where required by law.
      </p>
    ),
  },
  {
    id: "suspension",
    title: "Account Suspension & Termination",
    body: (
      <p>
        We may suspend or close an account that breaches these terms, provides false
        information, or harms customers or the platform. You may close your account at any time
        by contacting us.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Limitation of Liability",
    body: (
      <p>
        GrowMeOnline provides the platform "as is". We do not guarantee the quality of any
        supplier's work, the number of leads a supplier will receive, or the outcome of any deal.
        To the extent permitted by law, we are not liable for indirect or consequential losses
        arising from use of the platform.
      </p>
    ),
  },
  {
    id: "data-protection",
    title: "Data Protection",
    body: (
      <p>
        We process personal information in line with the Protection of Personal Information Act
        (POPIA) and our{" "}
        <a href="/privacy-policy" className="text-primary underline-offset-4 hover:underline">
          Privacy Policy
        </a>
        .
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact Information",
    body: (
      <p>
        Questions about these terms? Email{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary underline-offset-4 hover:underline">
          {SUPPORT_EMAIL}
        </a>
        .
      </p>
    ),
  },
];

function TermsPage() {
  return (
    <PolicyPage
      title="GrowMeOnline Terms & Conditions"
      version={TERMS_VERSION}
      intro="Please read these terms carefully. They explain the rules for suppliers and customers using GrowMeOnline."
      sections={sections}
    />
  );
}
