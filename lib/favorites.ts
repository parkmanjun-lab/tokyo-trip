import {matchEntry} from './catalog';
import type {Entry,Trip} from './trip';
export type FavoriteTarget={catalogId?:string,entryId?:string};
export function entryFavoriteTarget(entry:Entry):FavoriteTarget{return {entryId:entry.id,catalogId:matchEntry(entry)?.id};}
function keys(trip:Trip,target:FavoriteTarget){const result:string[]=[];if(target.catalogId){result.push(`catalog:${target.catalogId}`);for(const e of trip.entries)if(matchEntry(e)?.id===target.catalogId)result.push(`entry:${e.id}`);}if(target.entryId)result.push(`entry:${target.entryId}`);return [...new Set(result)];}
export function isFavorite(trip:Trip,target:FavoriteTarget){return keys(trip,target).some(key=>(trip.favorites||[]).includes(key));}
export function setFavorite(trip:Trip,target:FavoriteTarget,value:boolean):Trip{const related=keys(trip,target);if(!related.length)return trip;const favorites=(trip.favorites||[]).filter(k=>!related.includes(k));if(value)favorites.push(related[0]);return {...trip,favorites:[...new Set(favorites)]};}
