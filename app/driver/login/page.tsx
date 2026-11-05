import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { OtpLogin } from '@/components/driver/otp-login'
export const metadata = { title: 'Driver Sign In | Kart Championship' }
export default function Page() { return <><SiteHeader /><main className="mx-auto max-w-md px-4 py-12 sm:py-20"><OtpLogin /></main><SiteFooter /></> }
