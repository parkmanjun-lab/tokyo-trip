'use client';
import {useEffect,useRef,type RefObject} from 'react';
export function useEdgeBack(root:RefObject<HTMLElement|null>,canBack:()=>boolean,onBack:()=>void){
 const current=useRef({canBack,onBack});current.current={canBack,onBack};
 useEffect(()=>{const el=root.current;if(!el)return;let start:{x:number,y:number}|null=null;let qualified=false;
  const cancel=()=>{start=null;qualified=false};
  const begin=(event:TouchEvent)=>{cancel();if(event.touches.length!==1||!current.current.canBack())return;const target=event.target;if(!(target instanceof Element)||target.closest('input,textarea,select,button,a,summary,[contenteditable="true"],[data-no-edge-back]'))return;const touch=event.touches[0];if(touch.clientX<0||touch.clientX>28)return;start={x:touch.clientX,y:touch.clientY};};
  const move=(event:TouchEvent)=>{if(!start)return;if(event.touches.length!==1||!current.current.canBack()){cancel();return;}const t=event.touches[0],dx=t.clientX-start.x,dy=t.clientY-start.y;if(dx< -8||(Math.abs(dy)>12&&Math.abs(dy)>Math.max(0,dx))){cancel();return;}if(dx>=16&&Math.abs(dy)<=28&&dx>Math.abs(dy)*2&&event.cancelable)event.preventDefault();if(dx>=64&&Math.abs(dy)<=28&&dx>Math.abs(dy)*2)qualified=true;};
  const end=(event:TouchEvent)=>{const ready=qualified&&event.changedTouches.length===1&&current.current.canBack();if(ready&&start){const t=event.changedTouches[0],dx=t.clientX-start.x,dy=t.clientY-start.y;if(dx>=64&&Math.abs(dy)<=28&&dx>Math.abs(dy)*2){if(event.cancelable)event.preventDefault();cancel();current.current.onBack();return;}}cancel();};
  el.addEventListener('touchstart',begin,{passive:true});el.addEventListener('touchmove',move,{passive:false});el.addEventListener('touchend',end,{passive:false});el.addEventListener('touchcancel',cancel,{passive:true});return()=>{el.removeEventListener('touchstart',begin);el.removeEventListener('touchmove',move);el.removeEventListener('touchend',end);el.removeEventListener('touchcancel',cancel);};
 },[root]);
}
