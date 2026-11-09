import assert from 'node:assert/strict';import {reloadFreshShell} from '/tmp/tokyo-update-tests/startup-cache.mjs';
let ack,blocked=false,navigations=[];
globalThis.MessageChannel=class{constructor(){const port={close(){},onmessage:null};this.port1=port;this.port2=port;}};
Object.defineProperty(globalThis,'navigator',{value:{serviceWorker:{controller:{postMessage(data,ports){ack=()=>ports[0].onmessage({data:{ok:true}})}}}},configurable:true});
globalThis.location={href:'https://trip.test/#places',replace:u=>navigations.push(u)};
let pending=reloadFreshShell(()=>!blocked);blocked=true;ack();assert.equal(await pending,false);assert.equal(navigations.length,0);
blocked=false;pending=reloadFreshShell(()=>!blocked);ack();assert.equal(await pending,true);assert.equal(navigations.length,1);assert.ok(new URL(navigations[0]).searchParams.has('__tokyo_fresh'));assert.equal(new URL(navigations[0]).hash,'#places');
console.log('PASS draft opened during worker acknowledgement cancels navigation; later safe update bypasses shell and preserves hash');
