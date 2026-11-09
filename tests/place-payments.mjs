import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import PlacePayments from '/tmp/tokyo-favorite-tests/place-payments.mjs';
const records=JSON.parse(readFileSync('lib/place-payments.json','utf8')).places;
const catalog=[...JSON.parse(readFileSync('lib/recommendations.json','utf8')).recommendations,...JSON.parse(readFileSync('lib/extra-recommendations.json','utf8')),...JSON.parse(readFileSync('lib/registered-places.json','utf8'))];
assert.equal(records.length,catalog.length);assert.deepEqual(new Set(records.map(r=>r.id)),new Set(catalog.map(r=>r.id)));
for(const r of records){assert.ok([true,false,'unknown'].includes(r.cardAccepted),r.id);assert.ok([true,false,'unknown'].includes(r.cashOnly),r.id);assert.ok(r.sourceUrls.length,r.id);for(const u of r.sourceUrls)assert.equal(new URL(u).protocol,'https:');const html=renderToStaticMarkup(React.createElement(PlacePayments,{id:r.id}));assert.ok(html.includes(r.badgeKo||(r.cardAccepted===true?'신용카드 가능':r.cardAccepted===false?'신용카드 불가':'신용카드 확인 필요')));if(r.cashOnly!==true)assert.ok(!html.includes('현금만 가능하다는 안내가 있어요'));assert.ok(html.includes('방문 전 재확인'));}
for(const id of ['monkichi-tsukishima','torigin-ginza']){const r=records.find(p=>p.id===id);assert.equal(r.cardAccepted,false);assert.equal(r.cashOnly,'unknown');}
const h=records.find(r=>r.id==='ginza-hachigo');assert.equal(h.cardAccepted,'unknown');assert.equal(h.reservationPayment.notProofOfInStoreCardAcceptance,true);
const midori=records.find(r=>r.id==='sushinomidori-ginza');assert.ok(midori.brandCoverageKo);assert.deepEqual(midori.cardBrands,['UnionPay']);
assert.match(renderToStaticMarkup(React.createElement(PlacePayments,{id:'unverified-custom'})),/신용카드 확인 필요/);
console.log(`PASS payment coverage ${records.length}/${catalog.length}; explicit yes/no/unknown, no inferred cash-only, partial brands, booking-card vs store payment, qualified sources`);
