import React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from '@react-email/components'

export const SITE_URL = 'https://leadonline123.lovable.app'

export function SupplierEmailLayout({
  preview,
  heading,
  children,
  ctaLabel,
  ctaHref,
}: {
  preview: string
  heading: string
  children: React.ReactNode
  ctaLabel?: string
  ctaHref?: string
}) {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>GrowMeOnline</Text>
          <Heading style={h1}>{heading}</Heading>
          {children}
          {ctaLabel && ctaHref && (
            <Button href={ctaHref} style={button}>
              {ctaLabel}
            </Button>
          )}
          <Hr style={hr} />
          <Text style={text}>
            Regards,
            <br />
            GrowMeOnline Team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const text = { fontSize: '15px', lineHeight: '24px', color: '#334155', margin: '0 0 16px' }
const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const brand = { fontSize: '18px', fontWeight: 700, color: '#2563eb', margin: '0 0 24px' }
const h1 = { fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }
const button = {
  backgroundColor: '#2563eb',
  color: '#ffffff',
  borderRadius: '8px',
  padding: '12px 20px',
  fontSize: '15px',
  fontWeight: 600,
  textDecoration: 'none',
  display: 'inline-block',
  margin: '8px 0 16px',
}
const hr = { borderColor: '#e2e8f0', margin: '24px 0' }
