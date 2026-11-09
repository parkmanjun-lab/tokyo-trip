/* Only the public UI shell and immutable UI assets. Never trip data or APIs. */
const BUILD='__BUILD_VERSION__';
const PREFIX='tokyo-ui-shell-';
const CACHE=PREFIX+BUILD;
const ASSETS=__SHELL_ASSETS__;
const ROOT=new URL('/',self.location.origin).href;
const BYPASS=new URL('/__tokyo_shell_bypass__',self.location.origin).href;
const FRESH='__tokyo_fresh';
function immutable(url){return url.origin===self.location.origin&&url.pathname.startsWith('/_next/static/')&&/\.(js|css)$/.test(url.pathname)&&!url.search;}
function icon(url){return url.origin===self.location.origin&&ASSETS.includes(url.pathname)&&!url.search;}
async function network(request){return fetch(request,{cache:'no-store'});}
async function exactAsset(request){
 try{const keys=await caches.keys();for(const key of [CACHE,...keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE)]){const hit=await(await caches.open(key)).match(request);if(hit)return hit;}}catch{}
 return fetch(request);
}
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 try{
  const response=await fetch(ROOT,{cache:'reload',credentials:'omit',redirect:'error'});
  if(!response.ok||response.redirected||!response.headers.get('content-type')?.includes('text/html'))throw Error('Not a public shell');
  const html=await response.clone().text();
  if(!html.includes('tokyo-public-shell')||!html.includes(BUILD)||!html.includes('startup-shell'))throw Error('Shell build mismatch');
  // Install is atomic: a partial graph never takes control.
  await Promise.all(ASSETS.map(async path=>{const r=await fetch(path,{cache:'reload',credentials:'omit',redirect:'error'});if(!r.ok||r.redirected||r.headers.get('content-type')?.includes('text/html'))throw Error('Asset unavailable');await cache.put(path,r);}));
  await cache.put(ROOT,response);await cache.delete(BYPASS);await self.skipWaiting();
 }catch(error){await caches.delete(CACHE);throw error;}
})()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
// Retain old build assets while old tabs/drafts can still reference them.
// No controllerchange reload, no API/offline data cache, no runtime cache writes.
self.addEventListener('message',event=>{
 if(event.data?.type==='TOKYO_BYPASS_SHELL')event.waitUntil((async()=>{
  try{await(await caches.open(CACHE)).put(BYPASS,new Response('pending'));event.ports[0]?.postMessage({ok:true});}catch{event.ports[0]?.postMessage({ok:false});}
 })());
 if(event.data?.type==='TOKYO_CONFIRM_SHELL'&&event.data.build===BUILD)event.waitUntil((async()=>{let ok=false;try{await(await caches.open(CACHE)).delete(BYPASS);ok=true;}catch{}event.ports[0]?.postMessage({ok});})());
 if(event.data?.type==='TOKYO_SHELL_STATUS')event.waitUntil((async()=>{let ready=false;try{ready=!!await(await caches.open(CACHE)).match(ROOT);}catch{}event.ports[0]?.postMessage({build:BUILD,ready});})());
});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 if(request.mode==='navigate'&&url.pathname==='/'){
  if(url.searchParams.has(FRESH)||url.search){event.respondWith(network(request));return;}
  event.respondWith((async()=>{
   try{const cache=await caches.open(CACHE);if(!await cache.match(BYPASS)){const hit=await cache.match(ROOT);if(hit)return hit;}}catch{}
   return network(request);
  })());return;
 }
 if(immutable(url)||icon(url))event.respondWith(exactAsset(request));
});
