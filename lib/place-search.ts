import {allCatalog,matchEntry,type Recommendation} from './catalog';
import type {Entry} from './trip';
import {purchaseReference} from './purchase-references';
const aliases:Record<string,string[]>={
 'montbell-kyobashi':['mont bell','mont-bell','モンベル','교바시','쿄바시'],
 'acne-ginza-mitsukoshi':['acne studios','아크네','아크네스튜디오'],
 'ami-mitsukoshi':['아미','ami paris'],'ami-ginza-six':['아미','ami paris'],
 'muji-ginza':['무지','무인양품','muji'],'gu-marronnier-ginza':['지유','gu'],
 'standardproducts-ginza':['스탠다드 프로덕츠','스탠다드프로덕트','standard products'],
 'ginza-hachigo':['hachigo','hachigou'],'torigin-ginza':['torigin','토리긴'],
 'tsunahachi-ginza':['tsunahachi'],'tsujihan-nihonbashi':['tsujihan'],
 'asakusa-imahan-kokusai':['asakusa imahan'],'cafe-kimuraya-ginza':['kimuraya'],
 'bincho-ginza':['bincho','binchou','hitsumabushi'],'monkichi-tsukishima':['monkichi','monja'],
};
export function normalizeSearch(value:string){return value.normalize('NFKC').toLocaleLowerCase('en').replace(/[\s\p{P}\p{S}]/gu,'');}
export function searchPlaces(query:string,limit=8):Recommendation[]{
 const tokens=query.trim().split(/\s+/).map(normalizeSearch).filter(Boolean);if(!tokens.length)return [];
 const whole=normalizeSearch(query);
 return allCatalog.map((place,index)=>{
  const labels=[place.title,place.originalName,...place.wishKeys||[],...aliases[place.id]||[]].map(normalizeSearch);
  const fields=[...labels,place.id,place.area,place.address,place.category].map(normalizeSearch);
  const score=labels.some(s=>s===whole)?0:labels.some(s=>s.startsWith(whole))?1:labels.some(s=>s.includes(whole))?2:3;
  return {place,index,score,matches:tokens.every(t=>fields.some(f=>f.includes(t)))};
 }).filter(r=>r.matches).sort((a,b)=>a.score-b.score||a.index-b.index).slice(0,Math.max(0,limit)).map(r=>r.place);
}
export type PlaceSuggestion={key:string,title:string,address:string,area:string,catalogId?:string,source:'catalog'|'saved'};
export function searchSuggestions(query:string,entries:Entry[],limit=8):PlaceSuggestion[]{
 const results:PlaceSuggestion[]=searchPlaces(query,allCatalog.length).map(r=>({key:r.id,title:r.title,address:r.address,area:r.area,catalogId:r.id,source:'catalog'}));
 const tokens=query.trim().split(/\s+/).map(normalizeSearch).filter(Boolean);if(!tokens.length)return [];
 const keys=new Set(results.map(r=>r.key));
 for(const entry of entries){if(!tokens.every(t=>[entry.title,entry.place,entry.area].some(f=>normalizeSearch(f).includes(t))))continue;const matched=matchEntry(entry);const key=matched?.id||`saved-${entry.id}`;if(keys.has(key))continue;keys.add(key);results.push({key,title:entry.title,address:matched?.address||entry.place,area:matched?.area||entry.area,catalogId:matched?.id,source:matched?'catalog':'saved'});}
 return results.slice(0,Math.max(0,limit));
}
export function selectPlace(entry:Entry,place:PlaceSuggestion):Entry{const next={...entry,title:place.title,place:place.address,area:place.area};if(place.catalogId)next.catalogId=place.catalogId;else delete next.catalogId;return next;}
export function changePlaceQuery(entry:Entry,query:string):Entry{const next={...entry,place:query};if(query!==entry.place)delete next.catalogId;return next;}
export function matchesEntrySearch(entry:Entry,query:string){const tokens=query.trim().split(/\s+/).map(normalizeSearch).filter(Boolean);if(!tokens.length)return true;if(tokens.every(t=>[entry.title,entry.place,entry.area].some(s=>normalizeSearch(s).includes(t))))return true;const ref=purchaseReference(entry);if(ref&&(tokens.every(t=>ref.aliases.some(a=>normalizeSearch(a).includes(t)))||searchPlaces(query,allCatalog.length).some(r=>ref.candidateIds.includes(r.id))))return true;const known=matchEntry(entry);return !!known&&searchPlaces(query,allCatalog.length).some(r=>r.id===known.id);}
