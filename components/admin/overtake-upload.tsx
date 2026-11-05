'use client'
import { useState } from 'react'
import { Upload } from 'tus-js-client'
import { createClient } from '@/lib/supabase/client'
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase/config'

/** TUS uploads go directly to Supabase Storage; no 47 MB request flows through Vercel. */
export function OvertakeUpload() {
 const [file,setFile]=useState<File|null>(null)
 const [progress,setProgress]=useState(0)
 const [path,setPath]=useState('')
 const [error,setError]=useState('')
 const [working,setWorking]=useState(false)
 async function upload(){
  if(!file||!supabaseUrl||!supabaseAnonKey)return
  if(file.size>50*1024*1024||file.type!=='video/mp4'){setError('Upload MP4 only, maximum 50 MiB.');return}
  setWorking(true);setError('');setProgress(0)
  try{
   const client=createClient()
   const {data:{session}}=await client.auth.getSession()
   if(!session){setError('Sign in as Admin first.');setWorking(false);return}
   const key=`overtakes/${crypto.randomUUID()}.mp4`
   const endpoint=new URL(supabaseUrl).hostname.replace('.supabase.co','.storage.supabase.co')
   const upload=new Upload(file,{
    endpoint:`https://${endpoint}/storage/v1/upload/resumable`,
    retryDelays:[0,3000,5000,10000,20000],
    headers:{authorization:`Bearer ${session.access_token}`,apikey:supabaseAnonKey!,'x-upsert':'false'},
    uploadDataDuringCreation:true,
    removeFingerprintOnSuccess:true,
    metadata:{bucketName:'kart-overtakes',objectName:key,contentType:'video/mp4',cacheControl:'3600'},
    chunkSize:6*1024*1024,
    onError:e=>{setError(e.message);setWorking(false)},
    onProgress:(sent,total)=>setProgress(Math.round(sent/total*100)),
    onSuccess:()=>{setPath(key);setWorking(false)}
   })
   const previous=await upload.findPreviousUploads()
   if(previous.length)upload.resumeFromPreviousUpload(previous[0])
   upload.start()
  }catch {setError('Video upload failed. Check the bucket and your connection.');setWorking(false)}
 }
 return <div className="my-5 rounded-sm border border-border bg-card p-4"><h3 className="mb-3 font-bold uppercase">Upload overtake MP4</h3><p className="mb-3 text-xs text-muted-foreground">Direct resumable upload to Supabase Storage. Up to 50 MiB per file. A 47 MB MP4 fits if the project limit allows it.</p><input aria-label="Select MP4 onboard video" type="file" accept="video/mp4,.mp4" onChange={e=>{setFile(e.target.files?.[0]??null);setPath('');setError('')}} className="mb-3 block w-full text-sm"/><button type="button" onClick={upload} disabled={!file||working} className="min-h-11 rounded-sm bg-primary px-4 font-bold text-primary-foreground disabled:opacity-50">{working?`Uploading ${progress}%`:'Upload video'}</button>{path&&<div className="mt-3"><p className="text-sm text-emerald-400">Upload complete. Copy this path into the nomination form below:</p><input readOnly className="mt-2 w-full rounded-sm border border-border bg-background p-2 text-xs" value={path} onFocus={e=>e.target.select()}/></div>}{error&&<p role="alert" className="mt-2 text-sm text-red-400">{error}</p>}</div>
}
