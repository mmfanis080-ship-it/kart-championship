'use client'
import { Analytics } from '@vercel/analytics/next'
/** Never send personal bearer-token URLs to Web Analytics. */
export function PrivacyAnalytics() {
  return <Analytics beforeSend={event => event.url.includes('/attendance/') ? null : event} />
}
