import React from 'react'
import { Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { SITE_URL, SupplierEmailLayout, text } from './supplier-layout'

interface Props {
  businessName?: string
}

const ProfileApprovedEmail = ({ businessName }: Props) => (
  <SupplierEmailLayout
    preview="Your business is now live on GrowMeOnline"
    heading="Your profile has been approved"
    ctaLabel="Go to my dashboard"
    ctaHref={`${SITE_URL}/supplier/dashboard`}
  >
    <Text style={text}>{businessName ? `Hi ${businessName},` : 'Hi there,'}</Text>
    <Text style={text}>Good news — your business profile has been approved.</Text>
    <Text style={text}>
      Your business is now visible on GrowMeOnline, and customers can find you and start sending
      you enquiries.
    </Text>
  </SupplierEmailLayout>
)

export const template = {
  component: ProfileApprovedEmail,
  subject: 'Your Profile Has Been Approved',
  displayName: 'Supplier profile approved',
  previewData: { businessName: 'Acme Plumbing' },
} satisfies TemplateEntry
