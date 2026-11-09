import raw from './map-targets.json';
export type MapTarget={id:string,status:'place'|'building'|'official_pin'|'unverified'|'official_only'|'official_identifier',label:string,query:string,address:string,url?:string,placeId?:string|null,coordinates?:{lat:number,lng:number},sourceURL?:string,fallbackURL?:string,checkedAt?:string,note:string};
const targets=raw as Record<string,MapTarget>;
export function mapTarget(id?:string){return id?targets[id]:undefined;}
const aliases:Record<string,string>={
 'Narita International Airport Terminal 3 Japan':'narita-terminal-3','Narita Airport Terminal 3 Japan':'narita-terminal-3',
 'Narita Airport Terminal 2・3 Station Japan':'narita-t23-station','Narita Airport Terminal 2·3 Station Japan':'narita-t23-station',
 'Higashi-Ginza Station Tokyo':'higashi-ginza-station','Higashi-Ginza Station A7 Exit Tokyo':'higashi-ginza-station',
 'Tokyo Station Nihombashi Gate Japan':'tokyo-nihombashi-bus-arrival','Tokyo Station Yaesu South Exit JR Expressway Bus Terminal Japan':'tokyo-yaesu-bus-terminal',
 'Ginza Station C7 Exit Tokyo Japan':'ginza-airport-bus-stop',
 'Hotel Monterey Ginza, 2-10-2 Ginza, Tokyo':'hotel-monterey-ginza',
 'Hotel Monterey Ginza, 2-10-2 Ginza, Chuo City, Tokyo, Japan':'hotel-monterey-ginza',
 '호텔 몬토레 긴자, 2-10-2 Ginza, Chuo-ku, Tokyo 104-0061':'hotel-monterey-ginza',
};
export function pointTarget(point:string){return targets[aliases[point]];}
export function isPinned(target?:MapTarget){return !!target?.coordinates&&['place','building','official_pin'].includes(target.status);}
export function hasPlaceIdentity(target?:MapTarget){return isPinned(target)||!!(target?.status==='official_identifier'&&target.url&&/^https:\/\/(?:www\.|maps\.)?google\.com\/maps(?:[/?]|$)/.test(target.url));}
export function coordinateQuery(target:MapTarget){return `${target.coordinates!.lat},${target.coordinates!.lng}`;}
export function targetWebUrl(target:MapTarget){if(target.url)return target.url;const p=new URLSearchParams({api:'1',query:target.placeId?target.query:coordinateQuery(target)});if(target.placeId)p.set('query_place_id',target.placeId);return `https://www.google.com/maps/search/?${p}`;}
export function pinnedDirections(origin:MapTarget,destination:MapTarget,mode:'walking'|'transit'){
 const p=new URLSearchParams({api:'1',origin:origin.placeId?origin.query:coordinateQuery(origin),destination:destination.placeId?destination.query:coordinateQuery(destination),travelmode:mode});if(origin.placeId)p.set('origin_place_id',origin.placeId);if(destination.placeId)p.set('destination_place_id',destination.placeId);return `https://www.google.com/maps/dir/?${p}`;
}
export function iosPlaceUrl(webUrl:string){const url=new URL(webUrl);if(!['www.google.com','google.com','maps.google.com'].includes(url.hostname))throw new Error('Only verified Google Maps URLs may open in the Maps app');return webUrl.replace(/^https?:\/\//,'comgooglemapsurl://');}
function normalizedLocation(value:string){return value.normalize('NFKC').toLowerCase().replace(/[\s,，]/g,'').replace(/[−‐–—]/g,'-');}
export function isVerifiedHotel(name:string,address:string){const names=['호텔 몬토레 긴자','Hotel Monterey Ginza','ホテルモントレ銀座'];const addresses=['2-10-2 Ginza, Chuo-ku, Tokyo 104-0061','2-10-2 Ginza, Chuo City, Tokyo, Japan','東京都中央区銀座2-10-2','東京都中央区銀座2丁目10番2号'];return names.some(x=>normalizedLocation(x)===normalizedLocation(name))&&addresses.some(x=>normalizedLocation(x)===normalizedLocation(address));}
