'use client'
import { useState } from 'react'
import { HeadToHead, type H2HDriver } from './head-to-head'
export function H2HSelector({drivers}:{drivers:H2HDriver[]}){
  const [first,setFirst]=useState(drivers[0]?.id ?? '')
  const current=drivers.find(d=>d.id===first)
  if(!current || drivers.length<2)return <p className="rounded-sm border border-border bg-card p-6">At least two drivers are needed.</p>
  return <div className="space-y-4"><label className="block text-xs font-bold uppercase">First driver<select className="mt-2 min-h-12 w-full rounded-sm border border-border bg-card px-3 sm:max-w-sm" value={first} onChange={e=>setFirst(e.target.value)}>{drivers.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></label><HeadToHead key={first} current={current} others={drivers.filter(d=>d.id!==first)}/></div>
}
