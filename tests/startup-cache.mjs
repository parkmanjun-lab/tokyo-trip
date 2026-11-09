import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const template=fs.readFileSync('service-worker/shell-worker.js','utf8');
function environment({build='tokyo-test-version',badBuild=false,brokenAsset=false,storageFailure=false}={}){
 const handlers={},stores=new Map(),calls=[];let activated=0,claimed=0;
 const key=x=>typeof x==='string'?new URL(x,'https://trip.test').href:x.url;
 const caches={async keys(){return [...stores.keys()]},async delete(n){return stores.delete(n)},async open(n){if(storageFailure)throw Error('quota');if(!stores.has(n))stores.set(n,new Map());const data=stores.get(n);return {async match(r){return data.get(key(r))?.clone()},async put(r,v){data.set(key(r),v.clone())},async delete(r){return data.delete(key(r))}}}};
 const fetch=async(r)=>{const url=key(r);calls.push(url);if(brokenAsset&&url.includes('panel'))return new Response('',{status:503});return url==='https://trip.test/'?new Response(`<meta name="tokyo-public-shell" content="${badBuild?'wrong':build}"><main class="startup-shell">`,{headers:{'content-type':'text/html'}}):new Response('asset',{headers:{'content-type':'application/javascript'}})};
 const self={location:{origin:'https://trip.test'},addEventListener:(t,fn)=>handlers[t]=fn,skipWaiting:async()=>{activated++},clients:{claim:async()=>{claimed++}}};
 vm.runInNewContext(template.replace('__BUILD_VERSION__',build).replace('__SHELL_ASSETS__',JSON.stringify(['/_next/static/a.js','/_next/static/panel.js'])),{self,caches,fetch,Response,URL,console});
 async function lifecycle(type){let work;handlers[type]({waitUntil:p=>work=p});await work;}
 async function request(path,{method='GET',mode='navigate'}={}){let work;handlers.fetch({request:{method,mode,url:new URL(path,'https://trip.test').href},respondWith:p=>work=p});return work?await work:null;}
 async function message(type,version=build){let work;handlers.message({data:{type,build:version},ports:[{postMessage(){}}],waitUntil:p=>work=p});await work;}
 return {lifecycle,request,message,calls,stores,get activated(){return activated},get claimed(){return claimed}};
}
let e=environment();await e.lifecycle('install');assert.equal(e.activated,1);await e.lifecycle('activate');assert.equal(e.claimed,1);const n=e.calls.length;assert.match(await(await e.request('/')).text(),/startup-shell/);assert.equal(e.calls.length,n);await e.request('/_next/static/panel.js',{mode:'cors'});assert.equal(e.calls.length,n);
for(const path of ['/api/trip','/api/version','/signin-with-chatgpt','/?_rsc=1']){const result=await e.request(path,{mode:'cors'});assert.equal(result,null,path)}assert.equal(await e.request('/',{method:'PUT'}),null);
await e.request('/?__tokyo_fresh=123');assert.equal(e.calls.length,n+1);await e.message('TOKYO_BYPASS_SHELL');await e.request('/');assert.equal(e.calls.length,n+2);
await e.message('TOKYO_CONFIRM_SHELL','tokyo-old-page');await e.request('/');assert.equal(e.calls.length,n+3);
await e.message('TOKYO_CONFIRM_SHELL');await e.request('/');assert.equal(e.calls.length,n+3);
e=environment({badBuild:true});await assert.rejects(e.lifecycle('install'));assert.equal(e.activated,0);assert.equal(e.stores.size,0);
e=environment({brokenAsset:true});await assert.rejects(e.lifecycle('install'));assert.equal(e.activated,0);assert.equal(e.stores.size,0);
e=environment({storageFailure:true});assert.ok(await e.request('/'));assert.equal(e.calls.length,1);
e=environment();e.stores.set('tokyo-ui-shell-old',new Map([['https://trip.test/_next/static/old.js',new Response('old chunk')]]));await e.lifecycle('install');await e.lifecycle('activate');assert.equal(await(await e.request('/_next/static/old.js',{mode:'cors'})).text(),'old chunk');assert.ok(e.stores.has('tokyo-ui-shell-old'));
console.log('PASS atomic install, build validation, cache-hit navigation/assets, update bypass, API/mutation exclusions, failed storage network fallback, old-tab asset retention');
