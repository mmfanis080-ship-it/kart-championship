import type { Race, ResultRow } from '@/lib/championship'
export type Achievement={ key:string; title:string; description:string; unlocked:boolean; progress:number; target:number }
/** Only completed/recorded race finishes count; editable championship totals never affect badges. */
export function getDriverAchievements(driverId:string,races:Race[],results:ResultRow[]): Achievement[] {
 const completed=new Set(races.filter(r=>r.completed).map(r=>r.id))
 const finishing=results.filter(r=>r.driver_id===driverId&&completed.has(r.race_id)&&r.position>0)
 const pos=finishing.map(r=>r.position)
 const wins=pos.filter(p=>p===1).length,podiums=pos.filter(p=>p<=3).length,top5=pos.filter(p=>p<=5).length,top10=pos.filter(p=>p<=10).length
 const byRace=new Map(finishing.map(r=>[r.race_id,r.position]))
 const ordered=races.filter(r=>r.completed).sort((a,b)=>a.round-b.round).map(r=>byRace.get(r.id)??Infinity)
 let streak=0,bestStreak=0
 for(const p of ordered){streak=p<=5?streak+1:0;bestStreak=Math.max(bestStreak,streak)}
 return [
  ['wins','Race Winner','Win a race',wins,1],['wins-3','Triple Winner','Win 3 races',wins,3],
  ['podium','Podium Finisher','Finish on the podium',podiums,1],['podiums-5','Podium Collector','Reach 5 podiums',podiums,5],
  ['top5','Top 5 Regular','Finish in the top five 3 times',top5,3],
  ['top10','Top 10 Regular','Finish in the top ten 5 times',top10,5],
  ['consistent','Consistent Driver','Finish top 5 in 3 consecutive rounds',bestStreak,3],
 ].map(([key,title,description,progress,target])=>({key:String(key),title:String(title),description:String(description),progress:Number(progress),target:Number(target),unlocked:Number(progress)>=Number(target)}))
}
