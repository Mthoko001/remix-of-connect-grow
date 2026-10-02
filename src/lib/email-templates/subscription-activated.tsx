import React from 'react'
import { Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { SITE_URL, SupplierEmailLayout, text } from './supplier-layout'

interface Props {
  packageName?: string
  amount?: string
  expiresAt?: string
}

const SubscriptionActivatedEmail = ({ packageName, amount, expiresAt }: Props) => (
  <SupplierEmailLayout
    preview="Your GrowMeOnline subscription is active"
    heading="Subscription Activated"
    ctaLabel="Go to my dashboard"
    ctaHref={`${SITE_URL}/supplier/dashboard`}
  >
    <Text style={text}>Thank you for your payment. Your subscription is now active.</Text>
    <Text style={text}>
      Package: {packageName ?? 'GrowMeOnline subscription'}
      {amount ? ` · Amount paid: R${amount}` : ''}
      {expiresAt ? ` · Valid until ${expiresAt}` : ''}
    </Text>
    <Text style={text}>You can now keep receiving new customer enquiries without limits.</Text>
  </SupplierEmailLayout>
)

export const template = {
  component: SubscriptionActivatedEmail,
  subject: 'Subscription Activated',
  displayName: 'Subscription activated',
  previewData: { packageName: 'Supplier Annual', amount: '1200.00', expiresAt: '2 October 2027' },
} satisfies TemplateEntry
