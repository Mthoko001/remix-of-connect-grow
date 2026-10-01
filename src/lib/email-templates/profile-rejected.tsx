import React from 'react'
import { Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { SITE_URL, SupplierEmailLayout, text } from './supplier-layout'

interface Props {
  businessName?: string
  reason?: string
}

const ProfileRejectedEmail = ({ businessName, reason }: Props) => (
  <SupplierEmailLayout
    preview="An update on your GrowMeOnline profile review"
    heading="Profile review update"
    ctaLabel="Update my profile"
    ctaHref={`${SITE_URL}/supplier/profile`}
  >
    <Text style={text}>{businessName ? `Hi ${businessName},` : 'Hi there,'}</Text>
    <Text style={text}>
      Thank you for submitting your business profile. Unfortunately, it was not approved this time.
    </Text>
    <Text style={text}>
      <strong>Reason:</strong> {reason || 'No reason was provided.'}
    </Text>
    <Text style={text}>
      To resubmit, sign in, open your Business Profile, make the changes above, and click
      "Resubmit for Review".
    </Text>
  </SupplierEmailLayout>
)

export const template = {
  component: ProfileRejectedEmail,
  subject: 'Profile Review Update',
  displayName: 'Supplier profile rejected',
  previewData: { businessName: 'Acme Plumbing', reason: 'Please upload a clearer business logo.' },
} satisfies TemplateEntry
