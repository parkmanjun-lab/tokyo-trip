import data from './recommendations.json';
import extras from './extra-recommendations.json';
import registered from './registered-places.json';
export type Recommendation={id:string,title:string,originalName:string,category:string,area:string,why:string,address:string,sourceURL:string,needsConfirmation:string,wishKeys?:string[],distanceEstimateLabel?:string,sortDistanceM?:number,preferredDay?:'2026-11-29'|'2026-11-30'|'2026-12-01',walking?:{timeLabel:string|null,distanceLabel:string|null,status:'official'|'estimate'|'verified',sourceURL?:string,note:string},extra?:boolean,bookingSummary?:string,booking?:{status:string,method:string,url:string|null,phone?:string,advanceWindow:string,queue:string,lateArrival:string,cancellation:string,availability:string},tripDateNotes?:string,menuExample?:string,priceNote?:string,hoursAsPublished?:string,hours?:string,visitTip?:string,shoppingTip?:string,mapSearchAddress?:string,registeredOnly?:boolean};
export const catalog:Recommendation[]=data.recommendations as Recommendation[];
export const extraCatalog:Recommendation[]=extras as Recommendation[];
export const registeredCatalog:Recommendation[]=registered as Recommendation[];
export const allCatalog=[...catalog,...extraCatalog,...registeredCatalog];
// The catalogue is static, so lookups are cached. Results are the same as a fresh scan.
const titleIndex=new Map<string,Recommendation>();
for(const r of allCatalog)for(const key of [r.title,r.originalName,...(r.wishKeys||[])].map(k=>k.toLowerCase()))if(!titleIndex.has(key))titleIndex.set(key,r);
export function wishMatch(title:string):Recommendation|undefined {const key=title.trim().toLowerCase();if(!titleIndex.has(key))return undefined;return allCatalog.find(r=>r.title.toLowerCase()===key || r.originalName.toLowerCase()===key || r.wishKeys?.some(w=>w.toLowerCase()===key));}
const normalizedCache=new Map<string,string>();
function normalized(value:string){let out=normalizedCache.get(value);if(out===undefined){out=value.normalize('NFKC').toLowerCase().replace(/[\s,，]/g,'').replace(/[−‐–—]/g,'-');if(normalizedCache.size>4000)normalizedCache.clear();normalizedCache.set(value,out);}return out;}
const matchCache=new Map<string,Recommendation|null>();
export function matchEntry(entry:{title:string,place:string,catalogId?:string}):Recommendation|undefined {
 const key=`${entry.catalogId||''}\u0000${entry.title}\u0000${entry.place}`;
 const cached=matchCache.get(key);if(cached!==undefined)return cached||undefined;
 const found=scanEntry(entry);if(matchCache.size>4000)matchCache.clear();matchCache.set(key,found||null);return found;
}
function scanEntry(entry:{title:string,place:string,catalogId?:string}):Recommendation|undefined {
 const ref=entry.catalogId?allCatalog.find(r=>r.id===entry.catalogId):undefined;
 if(ref&&(!entry.place||normalized(ref.address)===normalized(entry.place)))return ref;
 const title=wishMatch(entry.title);
 if(title&&(!entry.place||normalized(title.address)===normalized(entry.place)))return title;
 if(entry.place){const matches=allCatalog.filter(r=>normalized(r.address)===normalized(entry.place));if(matches.length===1)return matches[0];}
 return undefined;
}
export function destination(r:Recommendation){return r.mapSearchAddress||`${r.originalName||r.title}, ${r.address}`;}
export function entryDestination(entry:{title:string,place:string,area?:string,catalogId?:string}){const found=matchEntry(entry);return found?destination(found):entry.place||`${entry.title} ${entry.area||''} 東京`;}
export function isCafeBakery(place?:Recommendation){return !!place&&/카페|빵집|베이커리/.test(place.category);}
export function matchesRecommendationCategory(place:Recommendation,filter:string){if(filter==='전체')return true;if(filter==='카페·빵집')return isCafeBakery(place);if(filter==='먹거리')return place.category.startsWith('먹거리')||isCafeBakery(place);return place.category.startsWith(filter);}
export function recommendationEntryCategory(place:Recommendation):'쇼핑'|'카페'|'맛집'|'기타'{return place.category.startsWith('쇼핑')?'쇼핑':isCafeBakery(place)?'카페':place.category.startsWith('먹거리')?'맛집':'기타';}
