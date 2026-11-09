import type {Recommendation} from './catalog';
import base from './place-reservations.json';
export type ReservationStatus='available'|'unavailable'|'conditional'|'queue'|'takeaway'|'unknown';
export type ReservationInfo={status:ReservationStatus,method:string,conditions:string[],sourceUrls:string[],checkedAt:string};
export const reservationLabels:Record<ReservationStatus,string>={available:'예약 가능',unavailable:'예약 불가',conditional:'조건부 가능',queue:'당일 순번 접수',takeaway:'현장 구매',unknown:'확인 필요'};
const reviewed:Record<string,ReservationStatus>={'tsunahachi-ginza':'available','ginza-hachigo':'available','tsujihan-nihonbashi':'unavailable','asakusa-imahan-kokusai':'conditional','maisen-aoyama':'conditional','cafe-kimuraya-ginza':'unavailable','pain-maison-ginza':'queue','bongen-coffee-ginza':'unknown','tricolore-ginza-honten':'unavailable','city-bakery-ginza-inz':'unknown','le-petit-mec-hibiya':'unavailable','viron-marunouchi-bakery':'takeaway'};
export function hasReservationField(r?:Recommendation,category?:string){return r?!/편의점/.test(r.category)&&/먹거리|맛집|카페|베이커리/.test(r.category):category==='맛집'||category==='카페'}
export function reservationInfo(r?:Recommendation):ReservationInfo{
 const fixed=r?(base as Record<string,ReservationInfo>)[r.id]:undefined;if(fixed)return fixed;
 const b=r?.booking;return {status:r?reviewed[r.id]||'unknown':'unknown',method:b?.method||r?.bookingSummary||'해당 지점의 좌석 예약 정책은 매장에 확인해주세요',conditions:b?[b.advanceWindow,b.queue,b.lateArrival,b.cancellation,b.availability].filter(Boolean):r?.visitTip?[r.visitTip]:[],sourceUrls:r?[...new Set([r.sourceURL,b?.url].filter((u):u is string=>!!u))]:[],checkedAt:r&&reviewed[r.id]?'2026-10-06':''};
}
