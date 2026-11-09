import assert from 'node:assert/strict';
import {initialTrip} from '/tmp/tokyo-cache-tests/trip-store.mjs';
import {TRIP_CACHE_KEY,TRIP_CACHE_TTL,readTripCache,cacheTrip,cacheGeneration,clearTripCache,validSnapshot} from '/tmp/tokyo-cache-tests/trip-cache.mjs';
const map=new Map();globalThis.window={localStorage:{getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)}};
const now=Date.parse('2026-10-06T22:00:00Z'),snapshot={trip:initialTrip(),version:10,updatedAt:'2026-10-06T21:00:00Z'};
assert.equal(readTripCache(now),null);cacheTrip(snapshot,cacheGeneration(),now);assert.deepEqual(readTripCache(now).snapshot,snapshot);assert.ok(validSnapshot(snapshot));
cacheTrip({...snapshot,version:9},cacheGeneration(),now);assert.equal(readTripCache(now).snapshot.version,9);
assert.equal(readTripCache(now+TRIP_CACHE_TTL+1),null);assert.equal(map.size,0);
for(const bad of [undefined,{}, {...snapshot,version:0}, {...snapshot,trip:{...snapshot.trip,hotel:null}}, {...snapshot,trip:{...snapshot.trip,entries:[{...snapshot.trip.entries[0],day:'2026-12-02'}]}}, {...snapshot,trip:{...snapshot.trip,checks:[{id:'x',title:'x',done:'yes'}]}}])assert.equal(validSnapshot(bad),false);
for(const raw of ['bad json','x'.repeat(400001),JSON.stringify({schema:2,fetchedAt:now,snapshot}),JSON.stringify({schema:1,fetchedAt:now+120000,snapshot}),JSON.stringify({schema:1,fetchedAt:now,snapshot:{...snapshot,trip:{}}})]){map.set(TRIP_CACHE_KEY,raw);assert.equal(readTripCache(now),null);assert.equal(map.size,0)}
const generation=cacheGeneration();clearTripCache();cacheTrip(snapshot,generation,now);assert.equal(map.size,0,'reset invalidates in-flight write generation');
window.localStorage.getItem=()=>{throw Error('blocked')};window.localStorage.setItem=()=>{throw Error('quota')};window.localStorage.removeItem=()=>{throw Error('blocked')};assert.equal(readTripCache(now),null);assert.doesNotThrow(()=>cacheTrip(snapshot,cacheGeneration(),now));assert.doesNotThrow(clearTripCache);
console.log('PASS cache bounds/schema/7-day expiry, corrupt/future/oversize rejection, authoritative version replacement, reset generation and unavailable/full browser storage');
