import {APP_BUILD_VERSION} from './build-version';
function metric(name:string,value:string){document.documentElement.setAttribute(name,value);}
function ask(worker:ServiceWorker,type:string,timeout=2500):Promise<{build?:string,ready?:boolean,ok?:boolean}>{return new Promise(resolve=>{const channel=new MessageChannel();const timer=setTimeout(()=>{channel.port1.close();resolve({})},timeout);channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();resolve(e.data||{})};worker.postMessage({type,build:APP_BUILD_VERSION},[channel.port2]);});}
export function installStartupCache(){
 if(!('serviceWorker' in navigator)||!window.isSecureContext){metric('data-shell-cache','unsupported');return;}
 metric('data-shell-cache','preparing');
 void navigator.serviceWorker.register('/tokyo-shell-worker.js',{scope:'/',updateViaCache:'none'}).then(reg=>{
  async function check(){const worker=reg.active||navigator.serviceWorker.controller;if(!worker)return;const info=await ask(worker,'TOKYO_SHELL_STATUS');if(info.ready&&info.build===APP_BUILD_VERSION){const confirmed=await ask(worker,'TOKYO_CONFIRM_SHELL');if(!confirmed.ok)return;metric('data-shell-cache','ready');const url=new URL(location.href);if(url.searchParams.has('__tokyo_fresh')){url.searchParams.delete('__tokyo_fresh');history.replaceState(history.state,'',url);}}}
  void check();reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='activated')void check();if(worker.state==='redundant')metric('data-shell-cache','unavailable');});});
  navigator.serviceWorker.addEventListener('controllerchange',()=>void check());
  if(reg.installing)reg.installing.addEventListener('statechange',()=>void check());
  void reg.update().catch(()=>{});
 }).catch(()=>metric('data-shell-cache','unavailable'));
}
export async function reloadFreshShell(canReload:()=>boolean=()=>true){
 try{const worker=navigator.serviceWorker?.controller;if(worker)await ask(worker,'TOKYO_BYPASS_SHELL');}catch{}
 if(!canReload())return false;
 const url=new URL(location.href);url.searchParams.set('__tokyo_fresh',String(Date.now()));location.replace(url.href);return true;
}
let homeMarked=false;
export function recordHomePaint(cached:boolean){if(homeMarked)return;homeMarked=true;requestAnimationFrame(()=>requestAnimationFrame(()=>{const nav=performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming|undefined;metric('data-home-ready-ms',String(Math.round(performance.now())));metric('data-home-source',cached?'device-cache':'network');metric('data-document-ttfb-ms',String(Math.round(nav?.responseStart||0)));}));}
let viewSequence=0;
// Invoked by the Planner effect after the active view's React commit. Display
// panels are eager modules, so this does not time a Suspense loading placeholder.
export function recordViewPaint(view:string,start:number){const sequence=++viewSequence;metric('data-view-ready',view+'-loading');requestAnimationFrame(()=>requestAnimationFrame(()=>{if(sequence!==viewSequence)return;metric('data-view-ready-ms',String(Math.round(performance.now()-start)));metric('data-view-ready',view);}));}
