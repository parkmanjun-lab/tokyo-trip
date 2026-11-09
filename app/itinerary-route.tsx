'use client';
import {ArrowUpRight,Route} from 'lucide-react';
import raw from '../lib/itinerary-routes.json';
import {iosDirectionsUrl,mapLinkOptions} from '../lib/ios-maps';
import type {Entry} from '../lib/trip';
type RouteInfo={day:string,time:string,duration:number,place:string,title:string,origin:string,destination:string,mode:'walking'|'transit'|'driving',steps:string[],sources:{label:string,url:string}[]};
const routes=raw as Record<string,RouteInfo>;
export default function ItineraryRoute({entry,appleMobile,compact=false}:{entry:Entry,appleMobile:boolean,compact?:boolean}){
 const route=routes[entry.id];if(!entry.day||!route||entry.place!==route.place||entry.title!==route.title||entry.day!==route.day||entry.time!==route.time||entry.duration!==route.duration)return null;
 const href=`https://www.google.com/maps/dir/?${new URLSearchParams({api:'1',origin:route.origin,destination:route.destination,travelmode:route.mode})}`;
 const link=<a {...mapLinkOptions(href,route.mode==='driving'?`comgooglemaps://?${new URLSearchParams({saddr:route.origin,daddr:route.destination,directionsmode:'driving'})}`:iosDirectionsUrl(route.origin,route.destination,route.mode),appleMobile)} className="itinerary-route-link"><Route size={14}/>{route.mode==='transit'?'대중교통 길찾기':route.mode==='driving'?'택시 경로 보기':'도보 길찾기'}<ArrowUpRight size={12}/></a>;
 if(compact)return link;
 return <section className="itinerary-route"><h4>이 구간 타는 법 · 이동 순서</h4><ol>{route.steps.map((step,i)=><li key={i}>{step}</li>)}</ol>{link}<p className="map-check-note">길찾기는 현재 검색 결과예요. 여행 날짜·출발 시각을 지도에서 맞추고 실제 노선·방향·승강장을 확인하세요. 아래 설명은 운영 변경에 따라 달라질 수 있어요.</p><div className="tip-sources">{route.sources.map(source=><a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.label}<ArrowUpRight size={11}/></a>)}</div></section>;
}
