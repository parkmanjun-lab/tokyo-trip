import assert from 'node:assert/strict';import {DatabaseSync} from 'node:sqlite';
import {tripSchema} from '/tmp/tokyo-purchase-tests/schema.mjs';import {validSnapshot} from '/tmp/tokyo-purchase-tests/cache.mjs';import {readTrip,writeTrip,initialTrip} from '/tmp/tokyo-purchase-tests/store.mjs';
const sql=new DatabaseSync(':memory:');sql.exec('CREATE TABLE trip_plans(user_id TEXT PRIMARY KEY,data TEXT NOT NULL,version INTEGER NOT NULL,updated_at TEXT NOT NULL)');let race;
const db={
 prepare(query){return {
  bind(...args){return {
   async first(){return sql.prepare(query).get(...args)||null},
   async run(){if(race){const fn=race;race=null;fn()}const result=sql.prepare(query).run(...args);return {meta:{changes:Number(result.changes)}}}
  }}
 }}
};
const initial=initialTrip();assert.ok(tripSchema.safeParse(initial).success);let snap=await readTrip(db,'test');assert.equal(snap.trip.shopping,undefined);assert.ok(validSnapshot(snap));
const shopping=[{id:'one',place:'러쉬',item:'팩',done:false}];snap=await writeTrip(db,'test',{...initial,shopping},snap.version);assert.equal(snap.version,2);assert.deepEqual((await readTrip(db,'test')).trip.shopping,shopping);
const legacy={...initial,hotel:{...initial.hotel,note:'old-client edit'}};snap=await writeTrip(db,'test',legacy,2);assert.deepEqual(snap.trip.shopping,shopping);assert.equal(snap.trip.hotel.note,'old-client edit');
assert.equal(await writeTrip(db,'test',{...initial,shopping:[]},2),null);assert.deepEqual((await readTrip(db,'test')).trip.shopping,shopping);
race=()=>sql.prepare('UPDATE trip_plans SET version=version+1 WHERE user_id=?').run('test');assert.equal(await writeTrip(db,'test',legacy,3),null);assert.deepEqual((await readTrip(db,'test')).trip.shopping,shopping);
for(const invalid of [[{...shopping[0],done:'yes'}],[shopping[0],shopping[0]],[{...shopping[0],item:''}],[{...shopping[0],place:'x'.repeat(181)}],Array.from({length:201},(_,i)=>({...shopping[0],id:String(i)}))]){const t={...initial,shopping:invalid};assert.equal(tripSchema.safeParse(t).success,false);assert.equal(validSnapshot({trip:t,version:1,updatedAt:'2026-10-07T00:00:00Z'}),false)}
snap=await readTrip(db,'test');const cleared=await writeTrip(db,'test',{...snap.trip,shopping:[]},snap.version);assert.deepEqual(cleared.trip.shopping,[]);sql.close();console.log('PASS real SQLite shopping persistence: optional old payloads, reload, preserved omitted field, CAS/racing writes, explicit clear, bounds and duplicate/schema/cache validation');
