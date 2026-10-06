import React from 'react'
import { Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { SITE_URL, SupplierEmailLayout, text } from './supplier-layout'

const EnquiryPendingReviewEmail = ({ supplierName }: { supplierName?: string }) => (
  <SupplierEmailLayout
    preview="A new enquiry needs review"
    heading="New enquiry pending review"
    ctaLabel="Open lead queue"
    ctaHref={`${SITE_URL}/admin/enquiries`}
  >
    <Text style={text}>
      A new enquiry{supplierName ? ` for ${supplierName}` : ''} requires review and qualification.
    </Text>
  </SupplierEmailLayout>
)

export const template = {
  component: EnquiryPendingReviewEmail,
  subject: 'New Enquiry Pending Review',
  displayName: 'Admin: enquiry pending review',
  previewData: { supplierName: 'Acme Plumbing' },
} satisfies TemplateEntry
