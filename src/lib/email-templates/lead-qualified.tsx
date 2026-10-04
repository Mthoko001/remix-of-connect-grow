import React from 'react'
import { Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { SITE_URL, SupplierEmailLayout, text } from './supplier-layout'

const LeadQualifiedEmail = ({ businessName }: { businessName?: string }) => (
  <SupplierEmailLayout
    preview="A new qualified lead is waiting for you"
    heading="New qualified lead received"
    ctaLabel="View my leads"
    ctaHref={`${SITE_URL}/supplier/enquiries`}
  >
    <Text style={text}>{businessName ? `Hi ${businessName},` : 'Hi there,'}</Text>
    <Text style={text}>
      A new customer enquiry has been reviewed and assigned to your business. Log in to your
      dashboard to view and respond.
    </Text>
  </SupplierEmailLayout>
)

export const template = {
  component: LeadQualifiedEmail,
  subject: 'New Qualified Lead Received',
  displayName: 'Supplier: qualified lead',
  previewData: { businessName: 'Acme Plumbing' },
} satisfies TemplateEntry
