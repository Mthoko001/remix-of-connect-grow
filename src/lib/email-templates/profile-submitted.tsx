import React from 'react'
import { Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { SITE_URL, SupplierEmailLayout, text } from './supplier-layout'

interface Props {
  businessName?: string
}

const ProfileSubmittedEmail = ({ businessName }: Props) => (
  <SupplierEmailLayout
    preview="Your GrowMeOnline profile is awaiting review"
    heading="Profile submitted successfully"
    ctaLabel="View my profile"
    ctaHref={`${SITE_URL}/supplier/profile`}
  >
    <Text style={text}>{businessName ? `Hi ${businessName},` : 'Hi there,'}</Text>
    <Text style={text}>Thank you for submitting your business profile to GrowMeOnline.</Text>
    <Text style={text}>
      Your profile has been received and is now awaiting review by our administration team.
    </Text>
    <Text style={text}>
      We will notify you once your profile has been approved or if any additional information is
      required.
    </Text>
  </SupplierEmailLayout>
)

export const template = {
  component: ProfileSubmittedEmail,
  subject: 'Profile Submitted Successfully',
  displayName: 'Supplier profile submitted',
  previewData: { businessName: 'Acme Plumbing' },
} satisfies TemplateEntry
