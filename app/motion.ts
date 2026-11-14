// Small motion helpers. They only add visual effects and never change data.
export type TokyoClock={date:string,time:string};

export function tokyoClock(now=new Date()):TokyoClock{
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now);
 const get=(type:string)=>parts.find(p=>p.type===type)?.value||'';
 return {date:`${get('year')}-${get('month')}-${get('day')}`,time:`${get('hour')}:${get('minute')}`};
}

// Row state for the schedule line: 'passed' before now, 'next' for the first row at or after now.
// Only the trip day that is today in Tokyo gets a 'next' row. Rows without a time ('99:99') never pass.
export function rowStates(day:string,times:string[],clock:TokyoClock|null):string[]{
 if(!clock)return times.map(()=>'');
 if(day<clock.date)return times.map(t=>t==='99:99'?'':'passed');
 if(day>clock.date)return times.map(()=>'');
 let next=false;
 return times.map(t=>{if(t==='99:99')return '';if(t<clock.time)return 'passed';if(!next){next=true;return 'next';}return '';});
}

export function motionOK(){
 return typeof window!=='undefined'&&typeof window.matchMedia==='function'&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function popHeart(button:Element|null){
 const icon=button?.querySelector('svg');
 if(!icon||!motionOK()||typeof icon.animate!=='function')return;
 icon.animate([{transform:'scale(1)'},{transform:'scale(1.35)'},{transform:'scale(.92)'},{transform:'scale(1)'}],{duration:420,easing:'cubic-bezier(.2,.9,.25,1.12)'});
}

export function enterView(panel:Element|null){
 if(!panel||!motionOK()||typeof panel.animate!=='function')return;
 panel.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:260,easing:'cubic-bezier(.22,1,.36,1)'});
}
