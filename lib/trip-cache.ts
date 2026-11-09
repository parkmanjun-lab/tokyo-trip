import type {Snapshot} from './trip';
export const TRIP_CACHE_KEY='tokyo-trip-preview-v1';
export const TRIP_CACHE_TTL=7*24*60*60*1000;
const MAX_BYTES=400000;
let generation=0;
type Dict=Record<string,unknown>;
const object=(v:unknown):v is Dict=>typeof v==='object'&&v!==null&&!Array.isArray(v);
const text=(v:unknown,max=180):v is string=>typeof v==='string'&&v.length<=max;
const time=(v:unknown)=>text(v)&&/^$|^([01]\d|2[0-3]):[0-5]\d$/.test(v);
const fields=(v:Dict,keys:string[])=>keys.every(k=>text(v[k]));
const date=(v:unknown)=>text(v)&&Number.isFinite(Date.parse(v));
const array=(v:unknown,max:number,check:(item:unknown)=>boolean)=>Array.isArray(v)&&v.length<=max&&v.every(check);
const uniqueIds=(v:unknown[])=>new Set(v.map(x=>(x as Dict).id)).size===v.length;
function flight(v:unknown){return object(v)&&fields(v,['carrier','agency','from','to','number'])&&time(v.departure)&&time(v.arrival)&&text(v.note,2000);}
// Small defensive validator for browser display. The server remains the write validator.
export function validSnapshot(v:unknown):v is Snapshot {
 if(!object(v)||!Number.isSafeInteger(v.version)||Number(v.version)<1||!date(v.updatedAt)||!object(v.trip))return false;
 const t=v.trip;
 if(!array(t.entries,300,e=>object(e)&&text(e.id,80)&&e.id.length>0&&text(e.title)&&e.title.length>0&&[null,'2026-11-29','2026-11-30','2026-12-01'].includes(e.day as string|null)&&time(e.time)&&Number.isInteger(e.duration)&&Number(e.duration)>=0&&Number(e.duration)<=1440&&fields(e,['area','place'])&&text(e.note,3000)&&['구경','맛집','카페','쇼핑','이동','기타'].includes(e.category as string)&&(e.catalogId===undefined||(text(e.catalogId,100)&&/^[a-z0-9-]+$/.test(e.catalogId)))))return false;
 if(!array(t.checks,200,c=>object(c)&&text(c.id,80)&&c.id.length>0&&text(c.title)&&c.title.length>0&&typeof c.done==='boolean'))return false;
 if(!uniqueIds(t.entries as unknown[])||!uniqueIds(t.checks as unknown[]))return false;
 if(t.shopping!==undefined&&(!array(t.shopping,200,c=>object(c)&&text(c.id,80)&&c.id.length>0&&text(c.place)&&text(c.item)&&c.item.length>0&&typeof c.done==='boolean')||!uniqueIds(t.shopping as unknown[])))return false;
 if(!flight(t.outbound)||!flight(t.inbound)||!object(t.hotel)||!fields(t.hotel,['name','agency','address'])||!time(t.hotel.checkin)||!time(t.hotel.checkout)||!text(t.hotel.note,3000))return false;
 return t.favorites===undefined||(array(t.favorites,600,f=>text(f,190)&&/^(catalog|entry):.{1,180}$/u.test(f))&&new Set(t.favorites as string[]).size===(t.favorites as string[]).length);
}
export type CachedTrip={schema:1,fetchedAt:number,snapshot:Snapshot};
export function readTripCache(now=Date.now()):CachedTrip|null{
 try{
  const raw=window.localStorage.getItem(TRIP_CACHE_KEY);if(!raw)return null;
  if(raw.length>MAX_BYTES)throw Error('oversized');const data:unknown=JSON.parse(raw);
  if(!object(data)||data.schema!==1||typeof data.fetchedAt!=='number'||!Number.isFinite(data.fetchedAt)||data.fetchedAt>now+60000||now-data.fetchedAt>TRIP_CACHE_TTL||!validSnapshot(data.snapshot))throw Error('invalid');
  return data as CachedTrip;
 }catch{try{window.localStorage.removeItem(TRIP_CACHE_KEY);}catch{}return null;}
}
export function cacheGeneration(){return generation;}
export function cacheTrip(snapshot:Snapshot,expectedGeneration=generation,now=Date.now()){
 if(expectedGeneration!==generation||!validSnapshot(snapshot))return;
 try{
  const raw=JSON.stringify({schema:1,fetchedAt:now,snapshot:{trip:snapshot.trip,version:snapshot.version,updatedAt:snapshot.updatedAt}});
  if(raw.length<=MAX_BYTES)window.localStorage.setItem(TRIP_CACHE_KEY,raw);
 }catch{/* A blocked/full browser store must not affect cloud saving. */}
}
export function clearTripCache(){generation++;try{window.localStorage.removeItem(TRIP_CACHE_KEY);}catch{}}
export function cachedTime(timestamp:number){return new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Tokyo',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(timestamp);}
