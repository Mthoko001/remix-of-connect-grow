import React from 'react'
import { Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { SupplierEmailLayout, text } from './supplier-layout'

interface Props {
  fullName?: string
  email?: string
  phone?: string
  subject?: string
  message?: string
}

const ContactMessageEmail = ({ fullName, email, phone, subject, message }: Props) => (
  <SupplierEmailLayout preview={`New contact message: ${subject ?? ''}`} heading="New website contact message">
    <Text style={text}><strong>Name:</strong> {fullName ?? '-'}</Text>
    <Text style={text}><strong>Email:</strong> {email ?? '-'}</Text>
    <Text style={text}><strong>Phone:</strong> {phone || 'Not provided'}</Text>
    <Text style={text}><strong>Subject:</strong> {subject ?? '-'}</Text>
    <Text style={{ ...text, whiteSpace: 'pre-wrap' }}>{message ?? ''}</Text>
  </SupplierEmailLayout>
)

export const template = {
  component: ContactMessageEmail,
  subject: (d: Record<string, any>) => `Contact form: ${d['subject'] ?? 'New message'}`,
  displayName: 'Website contact message',
  to: 'info@growmeonline.co.za',
  previewData: { fullName: 'Jane Doe', email: 'jane@example.com', phone: '0821234567', subject: 'General Enquiry', message: 'Hello!' },
} satisfies TemplateEntry
