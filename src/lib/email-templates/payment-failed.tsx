import React from 'react'
import { Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { SITE_URL, SupplierEmailLayout, text } from './supplier-layout'

interface Props {
  packageName?: string
}

const PaymentFailedEmail = ({ packageName }: Props) => (
  <SupplierEmailLayout
    preview="Your GrowMeOnline payment didn't go through"
    heading="Payment Unsuccessful"
    ctaLabel="Try again"
    ctaHref={`${SITE_URL}/supplier/subscription`}
  >
    <Text style={text}>
      Your payment{packageName ? ` for ${packageName}` : ''} was not completed, so your subscription
      has not been activated. No money was taken.
    </Text>
    <Text style={text}>You can try again from your Subscription page at any time.</Text>
  </SupplierEmailLayout>
)

export const template = {
  component: PaymentFailedEmail,
  subject: 'Payment Unsuccessful',
  displayName: 'Payment failed',
  previewData: { packageName: 'Supplier Annual' },
} satisfies TemplateEntry
