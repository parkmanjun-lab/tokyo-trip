import assert from 'node:assert/strict';
import {JSDOM} from '/workspace/shared/lumen-bastion/node_modules/jsdom/lib/api.js';
const dom=new JSDOM('<html><body><div id="root"></div></body></html>',{url:'http://localhost',pretendToBeVisual:true});
for(const key of ['window','document','navigator','HTMLElement','Element','Node','Event','MouseEvent','KeyboardEvent','InputEvent','HTMLInputElement','MutationObserver','FormData'])Object.defineProperty(globalThis,key,{value:dom.window[key],configurable:true});
globalThis.getComputedStyle=window.getComputedStyle.bind(window);globalThis.IS_REACT_ACT_ENVIRONMENT=true;globalThis.requestAnimationFrame=window.requestAnimationFrame.bind(window);globalThis.cancelAnimationFrame=window.cancelAnimationFrame.bind(window);globalThis.ResizeObserver=class{observe(){}unobserve(){}disconnect(){}};window.ResizeObserver=globalThis.ResizeObserver;window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});window.HTMLDialogElement.prototype.showModal=function(){this.open=true};window.HTMLDialogElement.prototype.close=function(){this.open=false};
window.scrollTo=()=>{};const React=await import('react');const {act}=React;const {createRoot}=await import('react-dom/client');const {default:Planner}=await import('../.test-build/planner.mjs');

const {readFileSync}=await import('node:fs');
const server=JSON.parse(readFileSync('/workspace/shared/tokyo-itinerary-planned.json','utf8'));server.updatedAt=new Date().toISOString();let writes=0;
globalThis.fetch=async(url,options={})=>{if(options.method==='PUT'){writes++;throw Error('No writes');}if(url==='/api/trip')return{ok:true,json:async()=>server};throw Error('Offline other routes')};
const root=createRoot(document.getElementById('root'));await act(async()=>root.render(React.createElement(Planner)));
const btn=text=>[...document.querySelectorAll('button')].find(b=>b.textContent===text);
for(const date of ['11.29','11.30','12.01']){await act(async()=>[...document.querySelectorAll('.date-tabs button')].find(b=>b.textContent.includes(date)).click());assert.ok(document.querySelectorAll('.schedule-row').length>0);}
assert.match(document.body.textContent,/11:45 호텔 출발/);assert.match(document.body.textContent,/12:33 나리타 익스프레스/);
await act(async()=>btn('장소').click());assert.ok(document.querySelectorAll('.rich-place-card').length>50);assert.match(document.body.textContent,/미트맨 롯폰기/);assert.match(document.body.textContent,/모헤지 시부야/);
await act(async()=>[...document.querySelectorAll('.place-title-button')].find(b=>b.textContent.includes('미트맨 롯폰기')).click());assert.match(document.body.textContent,/18세 미만/);assert.match(document.body.textContent,/예약/);
await act(async()=>root.unmount());assert.equal(writes,0);console.log('PASS planned snapshot DOM: all days, exact final departure, all venue cards/maps, MeatMan details, zero production writes.');
