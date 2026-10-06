import React from 'react'
import { Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { SupplierEmailLayout, text } from './supplier-layout'

const EnquiryRejectedEmail = ({ customerName, reason }: { customerName?: string; reason?: string }) => (
  <SupplierEmailLayout preview="An update on your enquiry" heading="Enquiry update">
    <Text style={text}>{customerName ? `Hi ${customerName},` : 'Hi there,'}</Text>
    <Text style={text}>
      Unfortunately, your enquiry could not be matched with a suitable supplier at this time.
    </Text>
    {reason && <Text style={text}>Reason: {reason}</Text>}
  </SupplierEmailLayout>
)

export const template = {
  component: EnquiryRejectedEmail,
  subject: 'Enquiry Update',
  displayName: 'Customer: enquiry rejected',
  previewData: { customerName: 'Thabo', reason: 'Outside Service Area' },
} satisfies TemplateEntry
