import type {z} from 'zod';
import type {entrySchema,flightSchema,tripSchema,shoppingSchema} from './trip-schema';
export const DAYS = [
  { key: '2026-11-29', short: '11.29', weekday: '일요일', day: 'DAY 1', label: '도쿄에 도착하는 날' },
  { key: '2026-11-30', short: '11.30', weekday: '월요일', day: 'DAY 2', label: '온전히 도쿄를 즐기는 날' },
  { key: '2026-12-01', short: '12.01', weekday: '화요일', day: 'DAY 3', label: '다시 집으로 돌아가는 날' },
] as const;
export type ShoppingItem=z.infer<typeof shoppingSchema>;
export type Entry = z.infer<typeof entrySchema>;
export type Trip = z.infer<typeof tripSchema>;
export type Flight = z.infer<typeof flightSchema>;
export type Snapshot = {trip:Trip, version:number, updatedAt:string};
export function sortedEntries(entries:Entry[]) {return [...entries].sort((a,b)=>(a.time || '99:99').localeCompare(b.time || '99:99') || a.title.localeCompare(b.title,'ko'));}
export function mapUrl(place:string) {return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;}
export function walkingUrl(origin:string,destination:string) {const params=new URLSearchParams({api:'1',origin,destination,travelmode:'walking'});return `https://www.google.com/maps/dir/?${params.toString()}`;}

export function transitUrl(origin:string,destination:string) {const params=new URLSearchParams({api:'1',origin,destination,travelmode:'transit'});return `https://www.google.com/maps/dir/?${params.toString()}`;}
