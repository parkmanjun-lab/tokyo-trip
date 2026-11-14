'use client';
import {useEffect,useRef,useState} from 'react';
import {motionOK} from './motion';

// A drawn route line for each airport option. It is a visual summary only; the steps and map links stay the source of truth.
type RouteDef={icon:'bus'|'train',stops:[string,string][]};
export const AIRPORT_ROUTES:Record<string,RouteDef>={
 inbound_ginza_bus:{icon:'bus',stops:[['나리타 T3','LCB 카운터, 5번 승강장'],['TYO-NRT 버스','약 84~91분'],['긴자 정류장','C7 출구 옆'],['호텔','도보 약 10~15분']]},
 inbound_skyaccess:{icon:'train',stops:[['나리타 T3','도보 약 13분'],['공항 제2빌딩역','액세스 특급'],['니혼바시','아사쿠사선 환승'],['히가시긴자','2정거장'],['호텔','도보 약 4분']]},
 inbound_tokyo_bus:{icon:'bus',stops:[['나리타 T3','5번 승강장'],['TYO-NRT 버스','약 78~98분'],['도쿄역','니혼바시구치'],['호텔','도보 20~25분, 택시']]},
 outbound_nex:{icon:'train',stops:[['호텔','13:15 택시'],['도쿄역','14:03 N’EX31'],['T2·3역','14:54 도착'],['T3 출발 로비','약 15:15']]},
 outbound_ginza_bus:{icon:'bus',stops:[['호텔','도보 약 10~15분'],['긴자 정류장','C7 출구 옆'],['TYO-NRT 버스','약 80~95분'],['나리타 T3','2층 출발 로비']]},
 outbound_skyaccess:{icon:'train',stops:[['호텔','도보 약 4~5분'],['히가시긴자','아사쿠사선 북행'],['니혼바시','스카이액세스 환승'],['T2·3역','종점까지 가지 않기'],['T3','도보 약 13분']]},
 outbound_tokyo_bus:{icon:'bus',stops:[['호텔','도보 약 15~20분'],['도쿄역','야에스 남쪽 7·8번'],['버스','약 80~90분'],['나리타 T3','먼저 정차']]},
};
const PATH='M22 80 C 90 34, 140 34, 160 80 S 240 126, 298 80';
const ICON={bus:'M-6 -6h12v10h-12z M-6 0h12 M-4 6v1.5 M4 6v1.5',train:'M-5 -7h10a2 2 0 0 1 2 2v8h-14v-8a2 2 0 0 1 2-2z M-7 0h14 M-4 6l-2 3 M4 6l2 3'};
const ease=(x:number)=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;

export default function AirportRoute({id,title}:{id:string,title:string}){
 const def=AIRPORT_ROUTES[id];
 const box=useRef<HTMLDivElement>(null),base=useRef<SVGPathElement>(null),run=useRef<SVGPathElement>(null),veh=useRef<SVGGElement>(null);
 const [points,setPoints]=useState<{x:number,y:number}[]>([]);
 const frame=useRef(0);
 function play(){
  const b=base.current,r=run.current,v=veh.current;if(!b||!r||!v||typeof b.getTotalLength!=='function')return;
  const len=b.getTotalLength();cancelAnimationFrame(frame.current);r.style.strokeDasharray=String(len);
  const at=(t:number)=>{const p=b.getPointAtLength(len*t);v.setAttribute('transform',`translate(${p.x},${p.y})`);r.style.strokeDashoffset=String(len*(1-t));};
  if(!motionOK()){at(1);return;}
  let t0:number|null=null;const step=(ts:number)=>{if(t0===null)t0=ts;const t=Math.min(1,(ts-t0)/1900);at(ease(t));if(t<1)frame.current=requestAnimationFrame(step);};
  at(0);frame.current=requestAnimationFrame(step);
 }
 useEffect(()=>{
  const b=base.current;if(!def||!b||typeof b.getTotalLength!=='function')return;
  const len=b.getTotalLength(),n=def.stops.length;
  setPoints(def.stops.map((_,i)=>{const p=b.getPointAtLength(len*i/(n-1));return {x:p.x,y:p.y};}));
  const details=box.current?.closest('details');
  const onToggle=()=>{if(details?.open)play();};
  if(!details||details.open)play();
  details?.addEventListener('toggle',onToggle);
  return()=>{details?.removeEventListener('toggle',onToggle);cancelAnimationFrame(frame.current);};
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[id]);
 if(!def)return null;
 const n=def.stops.length;
 return <div className="airport-route-map" ref={box} data-mode={def.icon}>
  <svg viewBox="0 0 320 160" role="img" aria-label={`${title} 경로: ${def.stops.map(s=>s[0]).join(', ')}`}>
   <path className="route-base" ref={base} d={PATH}/>
   <path className="route-run" ref={run} d={PATH}/>
   {points.map((p,i)=>{const f=i/(n-1),below=i%2===0,anchor=f<.08?'start':f>.92?'end':'middle',dx=f<.08?-10:f>.92?10:0,y=below?p.y+26:p.y-30;
    return <g key={i}><circle className="route-stop" cx={p.x} cy={p.y} r={6}/><text className="route-label" x={p.x+dx} y={y} textAnchor={anchor}>{def.stops[i][0]}</text><text className="route-sub" x={p.x+dx} y={y+14} textAnchor={anchor}>{def.stops[i][1]}</text></g>})}
   <g className="route-vehicle" ref={veh} transform="translate(-40,-40)" aria-hidden="true"><circle r={13}/><path d={ICON[def.icon]}/></g>
  </svg>
  <button type="button" className="route-replay" onClick={play}>다시 보기</button>
 </div>;
}
