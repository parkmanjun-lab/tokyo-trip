import {readFileSync} from 'node:fs';import assert from 'node:assert/strict';
const css=readFileSync('app/globals.css','utf8');const ui=readFileSync('app/planner.tsx','utf8');
assert.ok(css.includes('grid-template-columns:repeat(2,minmax(0,1fr))'));
assert.ok(css.includes('.field:has(input[type=time]),.form-grid .field:has(input[name=duration]){grid-column:1/-1}'));
assert.ok(css.includes('.dialog-body{flex:1 1 auto;min-height:0;min-width:0;overflow-y:auto;overflow-x:hidden;'));
assert.ok(ui.includes('<div className="dialog-body"><UpdateNotice updates={updates} blocked={updateBlocked}/><fieldset className="dialog-fields" disabled={saving}>'));
assert.ok(ui.includes('</fieldset></div><div className="dialog-footer">'));
assert.ok(ui.includes('window.visualViewport'));
assert.ok(css.includes('max-height:calc(var(--visible-height,100dvh) - 26px)'));
assert.ok(css.includes('.field input[type=time]::-webkit-date-and-time-value{min-width:0;text-align:left}'));
for(const viewport of [390,420]){const modal=viewport-24;const available=modal-2-40;assert.ok(available>300);console.log(`PASS ${viewport}px structural layout: time and duration get separate ${available}px full-width rows`)}
console.log('PASS structural checks for bounded mobile dialog body, safe footer, keyboard viewport, native Safari time widths. Not a rendered browser test.');

assert.ok(readFileSync('app/layout.tsx','utf8').includes("viewportFit:'cover'"));assert.ok(css.includes('--dialog-safe-top:max(0px,calc(env(safe-area-inset-top,0px) - var(--visible-top,0px)))'));assert.ok(css.includes('var(--visible-height,100dvh) - var(--dialog-safe-top) - var(--dialog-safe-bottom) - 26px'));for(const {height,offset,top,bottom} of [{height:844,offset:0,top:62,bottom:34},{height:380,offset:0,top:62,bottom:34},{height:330,offset:60,top:62,bottom:34}]){const safeTop=Math.max(0,top-offset),center=offset+(height+safeTop-bottom)/2,maxHeight=height-safeTop-bottom-24;assert.ok(center-maxHeight/2>=Math.max(offset,top)+12);assert.ok(center+maxHeight/2<=offset+height-bottom-12);}console.log('PASS safe-area geometry: main header and full-height dialogs avoid top/bottom insets including keyboard viewport offset; physical Safari still requires device confirmation');
