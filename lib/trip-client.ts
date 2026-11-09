import type {Snapshot} from './trip';
let initial:Promise<Snapshot>|null=null;
async function requestTrip():Promise<Snapshot>{
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),20000);
 try{const response=await fetch('/api/trip',{cache:'no-store',signal:controller.signal});let data:Snapshot&{error?:string};try{data=await response.json();}catch{throw Error('연결이 잠시 끊겼어요. 다시 시도해주세요');}if(!response.ok)throw Error(data.error||'여행을 불러오지 못했어요');return data;}
 catch(e){if(e instanceof Error&&e.name==='AbortError')throw Error('여행을 불러오는 데 시간이 걸려요. 잠시 후 다시 시도해주세요');throw e;}finally{clearTimeout(timer);}
}
// Start one read alongside the UI download. Cached previews are written only after the Planner accepts the authoritative response.
export function prefetchTrip(){if(!initial){initial=requestTrip();void initial.catch(()=>{});}return initial;}
export async function loadTrip(usePrefetch=false){if(usePrefetch&&initial){const pending=initial;initial=null;return pending;}return requestTrip();}
export function discardTripPrefetch(){initial=null;}
