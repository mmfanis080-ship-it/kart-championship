import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { AttendanceVoteForm } from '@/components/attendance-vote-form'
import { getPersonalAttendance } from '@/lib/attendance'
export const dynamic='force-dynamic'
export const metadata:Metadata={title:'Personal attendance | Kart Championship',robots:{index:false,follow:false},referrer:'no-referrer'}
export default async function AttendancePage({params}:{params:Promise<{token:string}>}){
 const {token}=await params;const {data,error}=await getPersonalAttendance(token)
 return <><SiteHeader/><main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col gap-5 px-4 py-12 md:px-6"><Link href="/" className="text-xs uppercase text-muted-foreground">← Championship</Link><p className="font-mono text-xs uppercase text-primary">Private driver area</p><h1 className="text-3xl font-black uppercase italic sm:text-4xl">Race Attendance</h1><p className="text-sm text-muted-foreground">Αυτός ο σύνδεσμος είναι προσωπικός. Μην τον μοιράζεσαι. Η συμμετοχή αλλάζει μέχρι να δημοσιευτούν τα αποτελέσματα.</p>
 {error==='setup'?<p role="alert" className="rounded-sm border border-border p-5">Admin must install SQL migration 006 first.</p>:error||!data.length?<p role="alert" className="rounded-sm border border-border p-5">Ο σύνδεσμος δεν είναι ενεργός ή δεν υπάρχουν αγώνες προς δήλωση. Ζήτησε νέο σύνδεσμο από τον διαχειριστή.</p>:<><p className="text-lg font-bold uppercase">Driver: {data[0].driver_name}</p>{data.map(r=><AttendanceVoteForm key={r.race_id} race={r} token={token}/>)}</>}
 </main><SiteFooter/></>
}
