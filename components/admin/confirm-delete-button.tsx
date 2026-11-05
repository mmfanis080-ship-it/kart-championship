'use client'

export function ConfirmDeleteButton({ subject, extra = '' }: { subject: string; extra?: string }) {
 return <button type="submit" className="min-h-11 rounded-sm border border-red-500/70 px-4 py-2 text-sm font-bold uppercase text-red-400 hover:bg-red-500/10" onClick={(event)=>{
   if (!window.confirm(`Delete ${subject}? ${extra}This cannot be undone.`)) event.preventDefault()
 }}>Delete</button>
}
