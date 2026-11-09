import {catalog,extraCatalog,matchEntry,type Recommendation} from './catalog';
import type {Entry} from './trip';
// Registered-only entries enrich saved wishes; they are not additional recommendations.
export const combinedRecommendations=[...new Map([...catalog,...extraCatalog].map(p=>[p.id,p])).values()];
// Preserve every user record and its notes. A saved card already renders its
// matchEntry enrichment; suppress only that repeated recommendation card.
// This is display-only deduplication, never a change to saved identity or data.
export function additionalRecommendations(entries:Entry[],recommendations:Recommendation[]=combinedRecommendations){
 const represented=new Set(entries.map(e=>matchEntry(e)?.id).filter(Boolean));
 return recommendations.filter(r=>!represented.has(r.id));
}
