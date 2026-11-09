import {allCatalog,wishMatch} from './catalog';
import {hasPlaceIdentity,mapTarget} from './map-targets';
import {purchaseReference} from './purchase-references';
import type {Entry,Snapshot,Trip} from './trip';
type ReviewStatus='reviewed'|'pending'|'needs_selection'|'needs_confirmation'|'not_a_venue';
function normalized(value:string){return value.normalize('NFKC').toLowerCase().replace(/[\s,，]/g,'').replace(/[−‐–—]/g,'-');}
// Collision-free serialized identity, not an authentication token or security hash.
export function identityFingerprint(entry:Entry){return `venue-v1:${JSON.stringify([entry.title.normalize('NFKC').trim(),entry.place.normalize('NFKC').trim()])}`;}
export function reviewEntry(entry:Entry){
 const base={entryId:entry.id,identityFingerprint:identityFingerprint(entry)};
 const result=(status:ReviewStatus,reason:string,catalogId?:string)=>({...base,status,reason,...(catalogId?{catalogId}:{})});
 if(entry.title.trim()==='시오콘부'&&!entry.place.trim())return result('not_a_venue','식품 구매 참고 대상');
 if(purchaseReference(entry))return result('needs_selection','구매 참고 정보 보완됨 · 실제 방문 지점은 선택 전');
 if(!entry.place.trim())return result(wishMatch(entry.title)&&!entry.catalogId?'needs_selection':'pending','방문 지점·주소가 정해지지 않음');
 const ref=allCatalog.find(r=>normalized(r.address)===normalized(entry.place)&&[r.title,r.originalName,...r.wishKeys||[]].some(n=>normalized(n)===normalized(entry.title)));
 if(!ref)return result('pending','새 장소이거나 이름·주소가 확인된 지점과 달라 재검토 필요');
 if(!hasPlaceIdentity(mapTarget(ref.id)))return result('needs_confirmation','알려진 후보지만 지도 지점 식별이 미확정',ref.id);
 return result('reviewed','확인한 카탈로그 지점과 이름·주소 일치. 개별 영업·결제 미확인 사항은 별도',ref.id);
}
export function reviewIndex(trip:Trip){const entries=trip.entries.map(reviewEntry);return {algorithm:'venue-v1',mode:'manual_only',entries,pendingEntryIds:entries.filter(r=>r.status==='pending'||r.status==='needs_confirmation').map(r=>r.entryId),selectionNeededEntryIds:entries.filter(r=>r.status==='needs_selection').map(r=>r.entryId)};}
export function withReviewIndex(snapshot:Snapshot){return {...snapshot,reviewIndex:reviewIndex(snapshot.trip)};}
