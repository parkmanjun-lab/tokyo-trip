import assert from 'node:assert/strict';
import { mapUrl, walkingUrl } from '../lib/trip.ts';
const origin='ホテルモントレ銀座, 東京都中央区銀座2-10-2';
const destination='Stüssy DSM Ginza, 東京都中央区銀座6-9-5';
const url=new URL(walkingUrl(origin,destination));
assert.equal(url.origin,'https://www.google.com');assert.equal(url.pathname,'/maps/dir/');assert.equal(url.searchParams.get('api'),'1');assert.equal(url.searchParams.get('travelmode'),'walking');assert.equal(url.searchParams.get('origin'),origin);assert.equal(url.searchParams.get('destination'),destination);
const search=new URL(mapUrl(destination));assert.equal(search.searchParams.get('query'),destination);assert.equal(search.searchParams.get('api'),'1');
const malicious='A&B#<script>店';assert.equal(new URL(walkingUrl(origin,malicious)).searchParams.get('destination'),malicious);assert.equal(new URL(mapUrl(malicious)).searchParams.get('query'),malicious);
console.log('PASS Maps search and hotel-origin walking URLs: encoded names/addresses, Unicode, ampersands, hashes, api=1 and walking mode');
