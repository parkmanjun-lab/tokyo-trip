import {matchEntry} from './catalog';
import {DAYS,type Entry} from './trip';
export type MembershipFilter='all'|'included'|'excluded';
export type MembershipTarget={entry?:Entry,catalogId?:string};
// Only exact saved identity or the existing branch-aware catalogue matcher counts.
// Product purchase candidates are deliberately not treated as selected visits.
export function membershipCatalogId(entry:Entry){
 const match=matchEntry(entry);if(!match)return undefined;
 const exactName=[match.title,match.originalName].some(name=>name.trim().toLowerCase()===entry.title.trim().toLowerCase());
 return entry.catalogId||entry.place.trim()||exactName?match.id:undefined;
}
export function itineraryDays(entries:Entry[],target:MembershipTarget):string[]{
 const catalogId=target.entry?membershipCatalogId(target.entry):target.catalogId;
 const days=new Set(entries.filter(e=>e.day&&(target.entry?.id===e.id||!!catalogId&&membershipCatalogId(e)===catalogId)).map(e=>e.day!));
 return DAYS.filter(d=>days.has(d.key)).map(d=>d.key);
}
export function matchesMembership(days:string[],filter:MembershipFilter){return filter==='all'||(filter==='included'?days.length>0:days.length===0);}
export function membershipLabel(days:string[]){return days.length?`일정 포함 · ${days.map(key=>`${DAYS.findIndex(d=>d.key===key)+1}일차`).join('·')}`:'일정 미포함';}
export function savedPlaces(entries:Entry[]){return entries.filter(e=>!e.day||e.category!=='이동');}
