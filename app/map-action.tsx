'use client';
import {MapPin,Clock3,ArrowUpRight} from 'lucide-react';
import {mapUrl} from '../lib/trip';
import {iosDirectionsUrl,mapLinkOptions} from '../lib/ios-maps';
import {mapTarget,pointTarget,isPinned,hasPlaceIdentity,coordinateQuery,targetWebUrl,pinnedDirections,iosPlaceUrl} from '../lib/map-targets';
export default function MapAction({point,origin,appleMobile,hotel=false,travelMode='walking',walkLabel='호텔에서 도보',targetId,originTargetId,compact=false}:{point:string,origin?:string,appleMobile:boolean,hotel?:boolean,travelMode?:'walking'|'transit',walkLabel?:string,targetId?:string,originTargetId?:string,compact?:boolean}){
 const target=mapTarget(targetId)||pointTarget(point);const start=mapTarget(originTargetId)||(origin?pointTarget(origin):undefined);const pinned=isPinned(target);const routeReady=pinned&&isPinned(start);
 if(origin&&!routeReady)return null;
 if(!hasPlaceIdentity(target)){return <span className="map-action map-needs-check"><a href={target?.fallbackURL||mapUrl(point)} target="_blank" rel="noopener noreferrer"><MapPin size={13}/>{target?.fallbackURL?(compact?'위치 확인':'공식 위치 확인'):(compact?'주소 확인':'주소 검색 · 확인 필요')}{!compact&&<ArrowUpRight size={12}/>}</a></span>;}
 const webHref=origin?pinnedDirections(start!,target!,travelMode):targetWebUrl(target!);
 const appHref=origin?iosDirectionsUrl(coordinateQuery(start!),coordinateQuery(target!),travelMode):iosPlaceUrl(webHref);
 const link=mapLinkOptions(webHref,appHref,appleMobile);
 const label=origin?(travelMode==='transit'?(appleMobile?'대중교통 앱':'대중교통 길찾기'):(appleMobile?'도보 앱':walkLabel)):target?.id==='monkichi-tsukishima'?(appleMobile?'본점 안내 지도 앱':'공식 본점 안내 지도'):target?.status==='official_identifier'?(appleMobile?'공식 지도 앱':'공식 안내 지도'):target?.status==='building'?(appleMobile?'건물 지도 앱':'건물 위치'):hotel?(appleMobile?'호텔 지도 앱':'호텔 지도'):(appleMobile?'지도 앱':'확인한 위치');
 const displayLabel=compact&&!origin?(target?.id==='monkichi-tsukishima'?'본점 안내':target?.status==='building'?'건물 지도':target?.status==='official_identifier'?'공식 지도':(appleMobile?'지도 앱':'지도')):label;
 return <span className="map-action" title={target?.note}><a className="map-primary" {...link} aria-label={`${target?.label||point} ${origin?'확인한 좌표로 길찾기':target?.status==='official_identifier'?'공식 안내 지도':'확인한 지도 위치'}`}>{origin?<Clock3 size={13}/>:<MapPin size={13}/>}<span>{displayLabel}</span>{!compact&&<ArrowUpRight size={12}/>}</a>{appleMobile&&<a className="map-web-fallback" aria-label={`${target?.label||point} 웹 지도 열기`} href={webHref} target="_blank" rel="noopener noreferrer">{origin?'웹 길찾기':compact?'웹':'웹 지도'}</a>}</span>;
}
