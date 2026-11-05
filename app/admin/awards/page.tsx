import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { OvertakeUpload } from '@/components/admin/overtake-upload'
import { ConfirmDeleteButton } from '@/components/admin/confirm-delete-button'
import { getChampionship } from '@/lib/championship'
import { requireAdminSession } from '@/lib/driver-session'
import { createAward, addNominee, setAwardPublished, updateAward, deleteAward, updateNominee, deleteNominee, addMissingDriverOfDayNominees } from './actions'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Manage Awards | Kart Championship', robots: { index: false } }
const field = 'min-h-11 w-full min-w-0 rounded-sm border border-border bg-background px-3 text-sm'
function utcInput(iso:string) { const d=new Date(iso); return Number.isNaN(d.getTime())?'':d.toISOString().slice(0,16) }

export default async function Page({searchParams}:{searchParams:Promise<{error?:string;saved?:string;deleted?:string}>}) {
 const {supabase} = await requireAdminSession()
 const champ = await getChampionship()
 const [events,nominees] = await Promise.all([
   supabase.from('award_events').select('id,title,kind,published,opens_at,closes_at,race_id').order('created_at',{ascending:false}),
   supabase.from('award_nominees').select('id,award_id,driver_id,title,video_path')
 ])
 const query=await searchParams
 return <>
  <SiteHeader/>
  <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
   <Link href="/admin" className="text-primary underline">← Race Control</Link>
   <h1 className="my-6 text-3xl font-black uppercase italic sm:text-5xl">Manage Awards</h1>
   {events.error && <p role="alert" className="mb-4 border border-red-500 p-3">Awards database missing or inaccessible. Check SQL 008.</p>}
   {nominees.error && <p role="alert" className="mb-4 border border-red-500 p-3">Nominees could not be loaded.</p>}
   {query.error && <p role="alert" className="mb-4 border border-red-500 p-3 text-red-400">{query.error==='invalid'?'Invalid data: check the fields and try again.':'Could not save changes. Check duplicates, dates and database permissions.'}</p>}
   {query.saved && <p role="status" className="mb-4 border border-green-600/60 p-3 text-green-400">Changes saved.</p>}
   {query.deleted && <p role="status" className="mb-4 border border-green-600/60 p-3 text-green-400">Item deleted.</p>}
   <section className="rounded-sm border border-border bg-card p-5">
    <h2 className="mb-4 text-xl font-black uppercase">Create an award</h2>
    <form action={createAward} className="grid gap-3 sm:grid-cols-2">
     <input name="title" required minLength={2} maxLength={120} placeholder="e.g. Round 5 Driver of the Day" className={field}/>
     <select name="kind" className={field}><option value="driver_of_the_day">Driver of the Day</option><option value="overtake_of_the_month">Overtake of the Month</option></select>
     <label className="text-sm">Opens (UTC)<input type="datetime-local" required name="opens_at" className={`mt-1 ${field}`}/></label>
     <label className="text-sm">Closes (UTC)<input type="datetime-local" required name="closes_at" className={`mt-1 ${field}`}/></label>
     <select name="race_id" className={field}><option value="">No associated race</option>{champ.races.map(r=><option value={r.id} key={r.id}>R{r.round} · {r.name}</option>)}</select>
     <label className="flex items-center gap-2"><input type="checkbox" name="published"/> Publish immediately</label>
     <button type="submit" className="min-h-11 rounded-sm bg-primary px-5 font-bold uppercase text-primary-foreground sm:col-span-2">Create award</button>
    </form>
   </section>
   <OvertakeUpload/>
   <section className="mt-6 space-y-5">
    <h2 className="text-2xl font-black uppercase">Awards and nominees</h2>
    {(events.data??[]).map(a=>{
      const currentNominees=(nominees.data??[]).filter(n=>n.award_id===a.id)
      return <article key={a.id} className="rounded-sm border border-border bg-card p-4 sm:p-5">
       <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div><h3 className="text-xl font-black">{a.title}</h3><p className="text-xs text-muted-foreground">{a.kind.replaceAll('_',' ')} · {a.published?'Published':'Draft'}</p></div>
        <div className="flex flex-wrap items-center gap-2">
         <form action={setAwardPublished}><input type="hidden" name="award_id" value={a.id}/><input type="hidden" name="published" value={a.published?'false':'true'}/><button type="submit" className="min-h-11 rounded-sm border border-primary px-4 font-bold">{a.published?'Unpublish':'Publish'}</button></form>
         <form action={deleteAward}><input type="hidden" name="award_id" value={a.id}/><ConfirmDeleteButton subject={`award “${a.title}”`} extra="All nominees and votes for this award will also be deleted. "/></form>
        </div>
       </div>
       <details className="mb-5 rounded-sm border border-border/80 p-3 sm:p-4">
        <summary className="cursor-pointer font-bold uppercase text-primary">Edit award</summary>
        <form action={updateAward} className="mt-4 grid gap-3 sm:grid-cols-2">
         <input type="hidden" name="award_id" value={a.id}/>
         <label className="text-xs">Title<input name="title" required minLength={2} maxLength={120} defaultValue={a.title} className={`mt-1 ${field}`}/></label>
         <label className="text-xs">Type<select name="kind" defaultValue={a.kind} className={`mt-1 ${field}`}><option value="driver_of_the_day">Driver of the Day</option><option value="overtake_of_the_month">Overtake of the Month</option></select></label>
         <label className="text-xs">Opens (UTC)<input type="datetime-local" name="opens_at" required defaultValue={utcInput(a.opens_at)} className={`mt-1 ${field}`}/></label>
         <label className="text-xs">Closes (UTC)<input type="datetime-local" name="closes_at" required defaultValue={utcInput(a.closes_at)} className={`mt-1 ${field}`}/></label>
         <label className="text-xs">Associated race<select name="race_id" defaultValue={a.race_id??''} className={`mt-1 ${field}`}><option value="">No associated race</option>{champ.races.map(r=><option key={r.id} value={r.id}>R{r.round} · {r.name}</option>)}</select></label>
         <label className="flex items-center gap-2 self-end pb-3 text-sm"><input type="checkbox" name="published" defaultChecked={a.published}/> Published</label>
         <p className="text-xs text-muted-foreground sm:col-span-2">Changing an award type does not automatically convert old nominee videos. Edit nominees below as needed. Changing the type or dates of a live vote may affect voting.</p>
         <button className="min-h-11 rounded-sm bg-primary px-4 font-bold uppercase text-primary-foreground sm:col-span-2">Save award changes</button>
        </form>
       </details>
       <h4 className="mb-2 text-sm font-bold uppercase">Nominees ({currentNominees.length})</h4>
       {currentNominees.length===0&&<p className="mb-3 text-xs text-muted-foreground">No nominees yet.</p>}
       <div className="mb-5 space-y-2">{currentNominees.map(n=><div key={n.id} className="rounded-sm border border-border p-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
         <div className="min-w-0 text-sm font-bold">{champ.drivers.find(d=>d.id===n.driver_id)?.name??'Unknown driver'}{n.title?' · '+n.title:''}</div>
         <form action={deleteNominee}><input type="hidden" name="nominee_id" value={n.id}/><ConfirmDeleteButton subject="this nominee" extra="Votes cast for this nominee will also be deleted. "/></form>
        </div>
        <details><summary className="cursor-pointer text-sm font-bold text-primary">Edit nominee</summary>
         <form action={updateNominee} className="mt-3 grid gap-2 sm:grid-cols-2"><input type="hidden" name="nominee_id" value={n.id}/>
          <label className="text-xs">Driver<select name="driver_id" defaultValue={n.driver_id} className={`mt-1 ${field}`}>{champ.drivers.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
          <label className="text-xs">Clip title<input name="title" maxLength={150} defaultValue={n.title??''} className={`mt-1 ${field}`}/></label>
          {a.kind==='overtake_of_the_month'&&<label className="text-xs sm:col-span-2">Video Path<input name="video_path" defaultValue={n.video_path??''} placeholder="overtakes/video.mp4" className={`mt-1 ${field}`}/></label>}
          <button type="submit" className="min-h-11 rounded-sm border border-primary px-4 font-bold uppercase sm:col-span-2">Save nominee changes</button>
         </form>
        </details>
       </div>)}</div>
       {a.kind==='driver_of_the_day'&&<div className="mb-4 rounded-md border border-sky-500/30 bg-sky-500/5 p-3">
        <p className="mb-2 text-xs text-muted-foreground">Drivers are nominated automatically when you create a Driver of the Day. Use Delete next to anyone who did not race. This button restores missing nominees only if you choose it.</p>
        <form action={addMissingDriverOfDayNominees}>
          <input type="hidden" name="award_id" value={a.id}/>
          <button type="submit" className="min-h-11 rounded-sm border border-sky-500/50 px-3 text-xs font-bold uppercase">Add all missing drivers</button>
        </form>
       </div>}
       <h4 className="mb-2 text-sm font-bold uppercase">Add nominee</h4>
       <form action={addNominee} className="grid gap-2 sm:grid-cols-2">
        <input type="hidden" name="award_id" value={a.id}/>
        <select name="driver_id" required className={field}>{champ.drivers.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select>
        <input name="title" maxLength={150} placeholder="Clip title (optional)" className={field}/>
        {a.kind==='overtake_of_the_month'&&<input name="video_path" placeholder="Paste video path from uploader" className={`${field} sm:col-span-2`}/>}
        <button className="min-h-11 rounded-sm bg-primary px-4 font-bold uppercase text-primary-foreground sm:col-span-2" type="submit">Add nominee</button>
       </form>
      </article>
    })}
   </section>
  </main>
  <SiteFooter/>
 </>
}
