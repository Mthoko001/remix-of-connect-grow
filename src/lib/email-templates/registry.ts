import type { ComponentType } from 'react'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

/**
 * Template registry — maps template names to their React Email components.
 * Import and register new templates here after creating them in this directory.
 *
 * Example:
 *   import { template as welcomeTemplate } from './welcome'
 *   // then add to TEMPLATES: 'welcome': welcomeTemplate
 */
import { template as profileSubmitted } from './profile-submitted'
import { template as profileApproved } from './profile-approved'
import { template as profileRejected } from './profile-rejected'
import { template as subscriptionActivated } from './subscription-activated'
import { template as paymentFailed } from './payment-failed'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'profile-submitted': profileSubmitted,
  'profile-approved': profileApproved,
  'profile-rejected': profileRejected,
  'subscription-activated': subscriptionActivated,
  'payment-failed': paymentFailed,
  // Add templates here as they are created, e.g.:
  // 'welcome': welcomeTemplate,
}
