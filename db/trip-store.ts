import type { Trip, Snapshot } from '../lib/trip';
// Server-only seed from the trip owner's message. Never imported into the browser bundle.
export function initialTrip():Trip {return {
  entries:[{"id": "wish-0", "day": null, "title": "몬자야끼", "time": "", "duration": 0, "area": "", "place": "", "note": "사진 위시리스트", "category": "맛집"}, {"id": "wish-1", "day": null, "title": "히츠마부시", "time": "", "duration": 0, "area": "", "place": "", "note": "사진 위시리스트", "category": "맛집"}, {"id": "wish-2", "day": null, "title": "야끼토리", "time": "", "duration": 0, "area": "", "place": "", "note": "사진 위시리스트", "category": "맛집"}, {"id": "wish-3", "day": null, "title": "이치란 라멘", "time": "", "duration": 0, "area": "", "place": "", "note": "사진 위시리스트", "category": "맛집"}, {"id": "wish-4", "day": null, "title": "스시", "time": "", "duration": 0, "area": "", "place": "", "note": "사진 위시리스트", "category": "맛집"}, {"id": "wish-5", "day": null, "title": "편의점 아이스크림·타마고 샌드위치", "time": "", "duration": 0, "area": "", "place": "", "note": "사진 위시리스트", "category": "맛집"}, {"id": "wish-6", "day": null, "title": "무인양품 파자마 또는 GU", "time": "", "duration": 0, "area": "", "place": "", "note": "사진 위시리스트", "category": "쇼핑"}, {"id": "wish-7", "day": null, "title": "위스키", "time": "", "duration": 0, "area": "", "place": "", "note": "사진 위시리스트", "category": "쇼핑"}, {"id": "wish-8", "day": null, "title": "카레", "time": "", "duration": 0, "area": "", "place": "", "note": "사진 위시리스트", "category": "쇼핑"}, {"id": "wish-9", "day": null, "title": "셀린느 매장", "time": "", "duration": 0, "area": "", "place": "", "note": "직접 요청한 위시리스트", "category": "쇼핑"}, {"id": "wish-10", "day": null, "title": "칼디 레몬에이드", "time": "", "duration": 0, "area": "", "place": "", "note": "직접 요청한 위시리스트", "category": "쇼핑"}, {"id": "wish-11", "day": null, "title": "Standard Products 매장", "time": "", "duration": 0, "area": "", "place": "", "note": "직접 요청한 위시리스트", "category": "쇼핑"}, {"id": "wish-12", "day": null, "title": "재즈바", "time": "", "duration": 0, "area": "", "place": "", "note": "사진 위시리스트", "category": "기타"}, {"id": "wish-13", "day": null, "title": "위스키바", "time": "", "duration": 0, "area": "", "place": "", "note": "사진 위시리스트", "category": "기타"}, {"id": "wish-14", "day": null, "title": "와인바", "time": "", "duration": 0, "area": "", "place": "", "note": "사진 위시리스트", "category": "기타"}, {"id": "wish-15", "day": null, "title": "몽벨", "time": "", "duration": 0, "area": "", "place": "", "note": "사진 위시리스트", "category": "쇼핑"}, {"id": "wish-16", "day": null, "title": "휴먼메이드", "time": "", "duration": 0, "area": "", "place": "", "note": "사진 위시리스트", "category": "쇼핑"}, {"id": "wish-17", "day": null, "title": "스투시", "time": "", "duration": 0, "area": "", "place": "", "note": "사진 위시리스트", "category": "쇼핑"}, {"id": "wish-18", "day": null, "title": "슈프림", "time": "", "duration": 0, "area": "", "place": "", "note": "사진 위시리스트", "category": "쇼핑"}, {"id": "wish-19", "day": null, "title": "단톤", "time": "", "duration": 0, "area": "", "place": "", "note": "사진 위시리스트", "category": "쇼핑"}, {"id": "wish-20", "day": null, "title": "아미", "time": "", "duration": 0, "area": "", "place": "", "note": "사진 위시리스트", "category": "쇼핑"}, {"id": "wish-21", "day": null, "title": "아크테", "time": "", "duration": 0, "area": "", "place": "", "note": "사진 위시리스트", "category": "쇼핑"}, {"id": "wish-22", "day": null, "title": "꼼데", "time": "", "duration": 0, "area": "", "place": "", "note": "사진 위시리스트", "category": "쇼핑"}],
  checks:[{id:'passport',title:'여권 유효기간 확인',done:false},{id:'mobile',title:'eSIM·로밍 준비',done:false},{id:'airport',title:'공항 이동편 확인',done:false},{id:'hotel',title:'호텔 예약 내역 저장',done:false},{id:'charger',title:'충전기·어댑터 챙기기',done:false}],
  outbound:{carrier:'제주항공',agency:'마이리얼트립',from:'인천공항 제1터미널',to:'나리타공항',departure:'07:15',arrival:'09:40',number:'',note:''},
  inbound:{carrier:'제주항공',agency:'마이리얼트립',from:'나리타공항',to:'인천공항 제1터미널',departure:'18:15',arrival:'21:15',number:'',note:''},
  hotel:{name:'호텔 몬토레 긴자',agency:'아고다',address:'2-10-2 Ginza, Chuo-ku, Tokyo 104-0061',checkin:'',checkout:'',note:''},
};}
type Row={data:string,version:number,updated_at:string};
export async function readTrip(db:D1Database, userId:string):Promise<Snapshot> {
  let row = await db.prepare('SELECT data, version, updated_at FROM trip_plans WHERE user_id = ?').bind(userId).first<Row>();
  if(!row){
    const now = new Date().toISOString();
    await db.prepare('INSERT INTO trip_plans (user_id, data, version, updated_at) VALUES (?, ?, 1, ?) ON CONFLICT(user_id) DO NOTHING').bind(userId,JSON.stringify(initialTrip()),now).run();
    row = await db.prepare('SELECT data, version, updated_at FROM trip_plans WHERE user_id = ?').bind(userId).first<Row>();
  }
  if(!row) throw new Error('Trip unavailable');
  return {trip:JSON.parse(row.data),version:row.version,updatedAt:row.updated_at};
}
export async function writeTrip(db:D1Database,userId:string,trip:Trip,version:number):Promise<Snapshot|null> {
  // Older app versions can omit this optional field. Preserve it at the exact CAS version.
  if(trip.shopping===undefined){
    const previous=await db.prepare('SELECT data FROM trip_plans WHERE user_id = ? AND version = ?').bind(userId,version).first<{data:string}>();
    if(!previous)return null;
    trip={...trip,shopping:(JSON.parse(previous.data) as Trip).shopping||[]};
  }
  const now = new Date().toISOString();
  const result = await db.prepare('UPDATE trip_plans SET data = ?, version = version + 1, updated_at = ? WHERE user_id = ? AND version = ?').bind(JSON.stringify(trip),now,userId,version).run();
  if(result.meta.changes !== 1) return null;
  return {trip,version:version+1,updatedAt:now};
}
