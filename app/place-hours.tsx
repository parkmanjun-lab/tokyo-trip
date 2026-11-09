import {AlertCircle,ArrowUpRight} from 'lucide-react';
import {DAYS} from '../lib/trip';
import {dayHours,placeHours,hoursStatusLabel,type DayHours} from '../lib/place-hours';

export function HoursWarning({id,day,editing=false}:{id?:string,day?:string|null,editing?:boolean}){
 const info=dayHours(id,day);if(!info||info.status==='regular_hours')return null;
 return <div className={`hours-warning ${info.status}`} role="note"><AlertCircle size={14}/><p><strong>{DAYS.find(d=>d.key===day)?.short} · {hoursStatusLabel[info.status]}</strong><span>{info.note}</span>{editing&&<span>안내를 확인한 뒤 그대로 저장할 수 있어요</span>}</p></div>;
}
function DateRows({days}:{days:DayHours[]}){return <div className="hours-date-list">{DAYS.map(d=>{const info=days.find(x=>x.date===d.key);return info&&<div className="hours-date-row" key={d.key}><strong>{d.short} {d.weekday.slice(0,1)}</strong><div><span className={`hours-badge ${info.status}`}>{hoursStatusLabel[info.status]}</span>{info.hours&&<span className="hours-date-time">{info.hours}</span>}<p>{info.note}</p></div></div>})}</div>}
export function TravelHours({days,day}:{days:DayHours[],day?:string|null}){
 const selected=DAYS.find(d=>d.key===day);
 const visibleDays=selected?[selected]:DAYS;
 return <section className={`travel-hours${selected?' selected-travel-day':''}`} aria-label={selected?'일정 날짜 영업 안내':'여행 날짜별 영업 안내'}>
  <div className="travel-hours-heading"><strong>{selected?'이날 영업':'여행일 영업'}</strong><span>정규 시간 기준 · 임시휴무 재확인</span></div>
  <div className="travel-hours-list">{visibleDays.map(d=>{const info=days.find(x=>x.date===d.key);const status=info?.status||'needs_confirmation';return <div className={`travel-hours-row ${status}`} key={d.key} data-date={d.key}>
   <time dateTime={d.key}>{d.short}<span>{d.weekday.slice(0,1)}</span></time>
   <div className="travel-hours-value"><span className={`hours-badge ${status}`}>{hoursStatusLabel[status]}</span><span className="travel-hours-time">{info?.hours||(status==='regular_closed'?'영업 없음':'영업시간 미확인')}</span>{info&&/출국/.test(info.note)&&<p className="travel-hours-exception">{info.note}</p>}</div>
  </div>})}</div>
 </section>;
}
export default function PlaceHours({id,day}:{id?:string,day?:string|null}){
 const info=placeHours(id);if(!info)return <div className="place-hours"><TravelHours days={[]} day={day}/></div>;
 return <div className="place-hours"><TravelHours days={info.days} day={day}/><details className="hours-details"><summary>{DAYS.some(d=>d.key===day)?'다른 여행일 · 영업 상세':'휴무·라스트오더·출처'}</summary><dl><div><dt>영업시간</dt><dd>{info.hours}</dd></div><div><dt>마지막 주문</dt><dd>{info.lastOrder}</dd></div><div><dt>정기휴무</dt><dd>{info.closure}</dd></div></dl><p className="hours-basis">현재 정규 영업 기준이며, 여행일의 실제 영업은 방문 전 확인해주세요</p><DateRows days={info.days}/>{info.routedAnchor&&<div className="hours-anchor"><strong>지도 시작점 · {info.routedAnchor.title}</strong><p>{info.routedAnchor.hours} · {info.routedAnchor.closure}</p><DateRows days={info.routedAnchor.days}/><div className="tip-sources">{info.routedAnchor.sourceUrls.map((u,i)=><a key={u} href={u} target="_blank" rel="noopener noreferrer">시작점 공식 안내 {i+1} <ArrowUpRight size={10}/></a>)}</div></div>}{info.uncertainties.map((t,i)=><p className="hours-caution" key={i}>{t}</p>)}<div className="tip-sources">{info.sourceUrls.map((u,i)=><a key={u} href={u} target="_blank" rel="noopener noreferrer">공식 영업 안내 {info.sourceUrls.length>1?i+1:''} <ArrowUpRight size={10}/></a>)}</div><p className="hours-checked">{info.checkedAt.replaceAll('-','.')} 확인 · 일본 현지 시각 · 임시휴무·변경은 방문 전 재확인</p></details></div>;
}

export function CompactTravelHours({id}:{id?:string}){
 const info=placeHours(id);
 return <section className="compact-travel-hours" aria-label="여행 날짜별 영업 안내"><div className="compact-hours-grid">{DAYS.map(d=>{const record=info?.days.find(x=>x.date===d.key);const status=record?.status||'needs_confirmation';return <div key={d.key} className={`compact-hours-day ${status}`}><time dateTime={d.key}>{d.short}<small>{d.weekday.slice(0,1)}</small></time><span className="compact-hours-status">{status==='regular_hours'?'통상 영업':status==='regular_closed'?'정기휴무':'확인 필요'}</span>{status==='regular_hours'&&record?.hours&&<span className="compact-hours-time">{record.hours}</span>}</div>})}</div><p className="compact-hours-basis">정규 시간 기준 · 임시휴무는 방문 전 재확인</p>{info?.days.filter(x=>x.status==='regular_hours'&&/출국/.test(x.note)).map(x=><p className="compact-hours-exception" key={x.date}>{DAYS.find(d=>d.key===x.date)?.short} · {x.note}</p>)}</section>;
}
