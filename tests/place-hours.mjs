import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {JSDOM} from '/tmp/tokyo-ui-test/node_modules/jsdom/lib/api.js';
import {allCatalog,matchEntry} from '/tmp/tokyo-hours-tests/catalog.mjs';
import {allPlaceHours,dayHours} from '/tmp/tokyo-hours-tests/place-hours.mjs';
import PlaceHours,{HoursWarning} from '/tmp/tokyo-hours-tests/place-hours-component.mjs';
const dates=['2026-11-29','2026-11-30','2026-12-01'];
assert.equal(allCatalog.length,47);assert.equal(allPlaceHours.length,47);
assert.deepEqual(new Set(allCatalog.map(p=>p.id)),new Set(allPlaceHours.map(p=>p.id)));
for(const p of allPlaceHours){
 assert.ok(p.hours&&p.lastOrder&&p.closure&&p.checkedAt,p.id);
 assert.equal(p.days.length,3,p.id);assert.deepEqual(p.days.map(d=>d.date),dates,p.id);
 assert.ok(p.sourceUrls.length,p.id);for(const u of p.sourceUrls)assert.equal(new URL(u).protocol,'https:');
 for(const d of p.days){assert.ok(['regular_hours','regular_closed','needs_confirmation'].includes(d.status),p.id);assert.ok(d.note,p.id);assert.equal(dayHours(p.id,d.date),d);}
 const html=renderToStaticMarkup(React.createElement(PlaceHours,{id:p.id}));
 const doc=new JSDOM(html).window.document; const visible=doc.querySelector('.travel-hours');
 assert.ok(visible&&!visible.closest('details'),p.id);assert.equal(visible.querySelectorAll('.travel-hours-row').length,3,p.id);
 for(const d of p.days){const row=visible.querySelector(`[data-date="${d.date}"]`);assert.ok(row,p.id);assert.ok(row.classList.contains(d.status),p.id);assert.equal(row.querySelector('.travel-hours-time').textContent,d.hours||(d.status==='regular_closed'?'영업 없음':'영업시간 미확인'),p.id);}
 assert.match(visible.textContent,/정규 시간 기준.*임시휴무 재확인/);
 for(const d of dates){const selected=new JSDOM(renderToStaticMarkup(React.createElement(PlaceHours,{id:p.id,day:d}))).window.document;assert.equal(selected.querySelectorAll('.travel-hours-row').length,1);assert.equal(selected.querySelector('.travel-hours-row').dataset.date,d);assert.ok(selected.querySelector('details').textContent.includes(p.lastOrder));assert.equal(selected.querySelectorAll('details>.hours-date-list>.hours-date-row').length,3);}
 assert.match(html,/<details/);assert.match(html,/공식 영업 안내/);assert.match(html,/임시휴무/);assert.match(html,/일본 현지 시각/);for(const d of ['11.29','11.30','12.01'])assert.ok(html.includes(d));
}
assert.equal(dayHours('highfive-ginza','2026-11-29').status,'regular_closed');
assert.match(dayHours('highfive-ginza','2026-11-29').note,/전날|토요일|토\)/);
assert.equal(dayHours('bacchus-ginza','2026-11-29').status,'regular_closed');
assert.equal(dayHours('ginza-hachigo','2026-11-30').status,'regular_closed');
assert.equal(dayHours('ginza-hachigo','2026-12-01').status,'needs_confirmation');
assert.equal(dayHours('arcteryx-tokyo-ginza','2026-11-29').status,'regular_hours');
for(const d of dates.slice(1))assert.equal(dayHours('arcteryx-tokyo-ginza',d).status,'regular_closed');
for(const d of dates)assert.equal(dayHours('extra-kappabashi',d).status,'needs_confirmation');
assert.equal(dayHours('unknown-place','2026-11-29'),undefined);assert.equal(dayHours('highfive-ginza','2026-11-28'),undefined);
assert.equal(renderToStaticMarkup(React.createElement(HoursWarning,{id:'highfive-ginza',day:'2026-11-30'})),'');
const warning=renderToStaticMarkup(React.createElement(HoursWarning,{id:'ginza-hachigo',day:'2026-11-30',editing:true}));
assert.match(warning,/정기휴무/);assert.match(warning,/그대로 저장/);
const ref=allCatalog.find(r=>r.id==='ginza-hachigo');assert.equal(matchEntry({title:'내가 수정한 이름',place:ref.address,catalogId:ref.id})?.id,ref.id);assert.equal(matchEntry({title:ref.title,place:'내가 적은 다른 지점',catalogId:ref.id}),undefined);
const source=readFileSync('app/planner.tsx','utf8');assert.match(source,/onChange=.*new FormData/);assert.match(source,/HoursWarning id=\{hoursPreview\?matchEntry\(hoursPreview\)/);assert.match(source,/hoursPreview=entryPreview\|\|undefined/);assert.match(source,/changePlaceQuery/);assert.doesNotMatch(source.slice(source.indexOf('async function submit'),source.indexOf('const entries=trip')),/regular_closed|dayHours/);
console.log('PASS hours coverage 47/47, trip dates 141/141, official sources, midnight exception, regular closures, uncertain street hours, editor warnings, address guard, nonblocking save');

const unknown=new JSDOM(renderToStaticMarkup(React.createElement(PlaceHours,{id:'unmatched-place'}))).window.document;assert.equal(unknown.querySelectorAll('.travel-hours-row.needs_confirmation').length,3);assert.match(unknown.body.textContent,/영업시간 미확인/);
for(const id of ['thedeep-ginza','highfive-ginza','bacchus-ginza']){const doc=new JSDOM(renderToStaticMarkup(React.createElement(PlaceHours,{id}))).window.document;assert.match(doc.querySelector('.travel-hours [data-date="2026-12-01"]').textContent,/출국/)}
console.log('PASS inline travel hours: 47 places x 3 dates outside details, selected itinerary day, retained sources/last order/qualifiers, unknown fallback, departure-conflict warnings');
