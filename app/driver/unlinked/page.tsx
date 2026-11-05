import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { signOut } from '@/app/admin/actions'
export default function Page() {return <><SiteHeader /><main className="mx-auto max-w-lg px-4 py-20"><h1 className="text-3xl font-black uppercase">Awaiting driver approval</h1><p className="my-5 text-muted-foreground">Your email is verified, but Race Control has not assigned it to a driver profile yet. Ask the Admin to add your email in Driver Accounts. No one can claim a driver just by choosing their name.</p><form action={signOut}><button className="rounded-sm border border-border px-5 py-3">Sign out</button></form><Link href="/" className="ml-4 underline">Home</Link></main><SiteFooter /></>}
