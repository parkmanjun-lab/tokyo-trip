'use client';
import {allCatalog,matchEntry} from '../lib/catalog';
import type {Trip} from '../lib/trip';
import PlaceReservation from './place-reservation';
export default function MealReservations({trip}:{trip:Trip}){
 const ids=['bincho-ginza','ichiran-harajuku','ushigoro-bambina-ginza','moheji-shibuya-scramble-square','meatman-roppongi','sushinomidori-ginza','old-imperial-bar'];
 return <section className="meal-reservations"><h3>이번 일정 식당 · 예약 확인</h3><p className="footnote">아래는 매장의 예약 정책이에요. 여행 날짜의 빈자리는 확인하지 않았고, 실제 예약·결제는 진행하지 않았어요. 선택한 플랜·인원·취소 조건을 확인한 뒤 예약하세요.</p>{ids.map(id=>{const place=allCatalog.find(p=>p.id===id);if(!place)return null;const entry=trip.entries.find(e=>e.day&&matchEntry(e)?.id===id);if(!entry)return null;return <details className="tip-card" key={id}><summary>{place.title}<span>{entry.day?.slice(5).replace('-','.')} · {entry.time}</span></summary><PlaceReservation place={place}/></details>})}</section>;
}
