import React from 'react'
import { Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { SupplierEmailLayout, text } from './supplier-layout'

const EnquiryReceivedEmail = ({ customerName }: { customerName?: string }) => (
  <SupplierEmailLayout preview="We've received your enquiry" heading="Enquiry received">
    <Text style={text}>{customerName ? `Hi ${customerName},` : 'Hi there,'}</Text>
    <Text style={text}>Thank you for contacting a supplier through GrowMeOnline.</Text>
    <Text style={text}>
      Your enquiry has been received and is currently being reviewed by our team before being
      forwarded to the supplier.
    </Text>
  </SupplierEmailLayout>
)

export const template = {
  component: EnquiryReceivedEmail,
  subject: 'Enquiry Received',
  displayName: 'Customer enquiry received',
  previewData: { customerName: 'Thabo' },
} satisfies TemplateEntry
