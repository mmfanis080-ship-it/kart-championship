import type { Championship } from './championship'
import type { H2HDriver } from '@/components/head-to-head'
export function getH2HDrivers(championship:Championship):H2HDriver[]{
  const finishesByDriver=new Map<string,Record<string,number>>()
  for(const r of championship.results){
    if(r.position<1)continue
    const finishes=finishesByDriver.get(r.driver_id)??{}
    finishes[r.race_id]=r.position
    finishesByDriver.set(r.driver_id,finishes)
  }
  return championship.drivers.map(d=>{
    const finishes=finishesByDriver.get(d.id)??{}
    const values=Object.values(finishes)
    return {id:d.id,name:d.name,team:d.team,photo_url:d.photo_url,points:d.points,wins:d.wins,podiums:d.podiums,bestFinish:d.bestFinish,avgFinish:values.length?Math.round(values.reduce((a,b)=>a+b,0)/values.length*10)/10:null,finishes}
  })
}
