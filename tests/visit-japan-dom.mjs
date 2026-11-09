import assert from 'node:assert/strict';
import {JSDOM} from '/workspace/shared/lumen-bastion/node_modules/jsdom/lib/api.js';
const dom=new JSDOM('<html><body><div id="root"></div></body></html>',{url:'http://localhost',pretendToBeVisual:true});
for(const key of ['window','document','navigator','HTMLElement','Element','Node','Event','MouseEvent','KeyboardEvent','InputEvent','HTMLInputElement','MutationObserver','FormData'])Object.defineProperty(globalThis,key,{value:dom.window[key],configurable:true});
globalThis.getComputedStyle=window.getComputedStyle.bind(window);globalThis.IS_REACT_ACT_ENVIRONMENT=true;globalThis.requestAnimationFrame=window.requestAnimationFrame.bind(window);globalThis.cancelAnimationFrame=window.cancelAnimationFrame.bind(window);globalThis.ResizeObserver=class{observe(){}unobserve(){}disconnect(){}};window.ResizeObserver=globalThis.ResizeObserver;window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});window.HTMLDialogElement.prototype.showModal=function(){this.open=true};window.HTMLDialogElement.prototype.close=function(){this.open=false};
window.scrollTo=()=>{};const React=await import('react');const {act}=React;const {createRoot}=await import('react-dom/client');const {default:Planner}=await import('../.test-build/planner.mjs');

const flight={carrier:'제주항공',agency:'',from:'',to:'',departure:'18:15',arrival:'09:40',number:'',note:''};
const server={version:1,updatedAt:new Date().toISOString(),trip:{entries:[],shopping:[],checks:[],outbound:flight,inbound:flight,hotel:{name:'호텔 몬토레 긴자',agency:'',address:'2-10-2 Ginza, Chuo-ku, Tokyo 104-0061',checkin:'15:00',checkout:'11:00',note:''}}};let writes=0;
globalThis.fetch=async(url,options={})=>{if(options.method==='PUT'){writes++;throw Error('No writes');}if(url==='/api/trip')return{ok:true,json:async()=>server};throw Error('Offline other routes')};
const root=createRoot(document.getElementById('root'));await act(async()=>root.render(React.createElement(Planner)));
const btn=text=>[...document.querySelectorAll('button')].find(b=>b.textContent===text);
let copied=[];Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>copied.push(text)}});
for(let pass=0;pass<2;pass++){
 await act(async()=>btn('더보기').click());
 const more=document.querySelector('.more-menu');assert.equal(more.querySelector('button strong').textContent,'비짓재팬 등록 안내');
 await act(async()=>[...more.querySelectorAll('button')].find(b=>b.textContent.includes('비짓재팬 등록 안내')).click());
 await act(async()=>await new Promise(r=>setTimeout(r,5)));
 assert.equal(document.querySelector('.app-shell').dataset.view,'visitJapan');
 const steps=[...document.querySelectorAll('.vjw-step')];assert.equal(steps.length,10);
 for(const step of steps){const old=step.open;await act(async()=>step.querySelector('summary').click());assert.equal(step.open,!old);await act(async()=>step.querySelector('summary').click());assert.equal(step.open,old);}
 const checkbox=steps[0].querySelector('input');await act(async()=>checkbox.click());assert.match(document.querySelector('.vjw-progress').textContent,/1 \/ 10/);await act(async()=>checkbox.click());assert.match(document.querySelector('.vjw-progress').textContent,/0 \/ 10/);
 const copy=document.querySelector('[aria-label="숙소명 복사"]');await act(async()=>copy.click());assert.equal(copied.at(-1),'HOTEL MONTEREY GINZA');assert.match(copy.parentElement.textContent,/복사했어요/);
 for(const a of document.querySelectorAll('.vjw-guide a')){assert.equal(a.target,'_blank');assert.equal(a.rel,'noopener noreferrer');assert.ok(a.href.startsWith('https://'));}
 assert.ok(document.querySelector('a[href="https://www.vjw.digital.go.jp/main/#/vjwplo001"]'));
 assert.match(document.body.textContent,/항공편 번호: 미확인/);assert.match(document.body.textContent,/일괄 ‘아니오’를 선택하지/);assert.match(document.body.textContent,/위탁수하물로 먼저 부치지/);
 await act(async()=>btn('더보기로').click());assert.equal(document.querySelector('.app-shell').dataset.view,'more');
}
await act(async()=>[...document.querySelector('.more-menu').querySelectorAll('button')].find(b=>b.textContent.includes('비짓재팬 등록 안내')).click());
Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}});await act(async()=>document.querySelector('[aria-label="숙소명 복사"]').click());assert.match(document.body.textContent,/복사할 수 없어요/);
await act(async()=>btn('이번 여행 공항 이동 확인').click());assert.equal(document.querySelector('.app-shell').dataset.view,'airport');
await act(async()=>btn('일정').click());assert.equal(document.querySelector('.app-shell').dataset.view,'schedule');
assert.equal(writes,0);await act(async()=>root.unmount());console.log('PASS VJW DOM: repeated More/back, all10 disclosure toggles, read-check reset, copy success/failure, official external links, airport/menu navigation, zero writes.');
