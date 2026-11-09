import data from './place-hours.json';
export type DayHours = {date:string,status:'regular_hours'|'regular_closed'|'needs_confirmation',hours:string|null,note:string};
export type HoursRecord = {id:string,hours:string,lastOrder:string,closure:string,days:DayHours[],sourceUrls:string[],checkedAt:string,uncertainties:string[],routedAnchor?:{title:string,hours:string,closure:string,days:DayHours[],sourceUrls:string[]}};
export const allPlaceHours=data.places as HoursRecord[];
export function placeHours(id?:string){return id?allPlaceHours.find(p=>p.id===id):undefined;}
// These are Tokyo local calendar dates, not UTC instants. Never parse them through Date.
export function dayHours(id:string|undefined,day:string|null|undefined){return day?placeHours(id)?.days.find(d=>d.date===day):undefined;}
export const hoursStatusLabel={regular_hours:'통상 영업',regular_closed:'정기휴무',needs_confirmation:'재확인 필요'};
