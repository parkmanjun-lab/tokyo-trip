// Google Maps' documented iOS URL scheme. These are user-clicked links, not
// installation probes or automatic redirects.
export function iosMapUrl(point:string){return `comgooglemaps://?${new URLSearchParams({q:point}).toString()}`;}
export function iosDirectionsUrl(origin:string,destination:string,mode:'walking'|'transit'='walking'){return `comgooglemaps://?${new URLSearchParams({saddr:origin,daddr:destination,directionsmode:mode}).toString()}`;}
export function iosWalkingUrl(origin:string,destination:string){return iosDirectionsUrl(origin,destination,'walking');}
export function isAppleMobile(userAgent:string,platform:string,maxTouchPoints:number){return /iPad|iPhone|iPod/i.test(userAgent)||(platform==='MacIntel'&&maxTouchPoints>1);}
export function mapLinkOptions(webHref:string,appHref:string,appleMobile:boolean){return appleMobile?{href:appHref,target:undefined,rel:undefined}:{href:webHref,target:'_blank' as const,rel:'noopener noreferrer'};}
