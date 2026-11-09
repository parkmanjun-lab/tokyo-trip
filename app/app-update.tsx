'use client';
import {useEffect,useRef,useState} from 'react';
import {RefreshCw} from 'lucide-react';
import {reloadFreshShell} from '../lib/startup-cache';
import {APP_BUILD_VERSION} from '../lib/build-version';
import {createAppUpdateMonitor,type UpdateState} from '../lib/app-update';
export function useAppUpdates(blocked:boolean,isBusy:()=>boolean){
 const [state,setState]=useState<UpdateState>({checking:false,version:null,manualOnly:false,message:''});const monitor=useRef<ReturnType<typeof createAppUpdateMonitor>|null>(null);const busy=useRef(isBusy);busy.current=isBusy;
 useEffect(()=>{let storage:Storage|null=null;try{storage=window.sessionStorage}catch{}const current=createAppUpdateMonitor({currentVersion:APP_BUILD_VERSION,isBusy:()=>busy.current(),isVisible:()=>document.visibilityState==='visible',reload:canReload=>reloadFreshShell(canReload),onState:setState,storage});monitor.current=current;let eventTimer:ReturnType<typeof setTimeout>|undefined;const foreground=()=>{if(document.visibilityState!=='visible')return;if(eventTimer)clearTimeout(eventTimer);eventTimer=setTimeout(()=>void current.check(),500);};document.addEventListener('visibilitychange',foreground);window.addEventListener('pageshow',foreground);window.addEventListener('focus',foreground);const timer=setInterval(()=>void current.check(),5*60*1000);void current.check();return()=>{current.dispose();monitor.current=null;clearInterval(timer);if(eventTimer)clearTimeout(eventTimer);document.removeEventListener('visibilitychange',foreground);window.removeEventListener('pageshow',foreground);window.removeEventListener('focus',foreground);};},[]);
 useEffect(()=>{if(!blocked)monitor.current?.resume()},[blocked]);
 return {...state,check:()=>void monitor.current?.check(true),apply:()=>monitor.current?.apply()};
}
export type AppUpdates=ReturnType<typeof useAppUpdates>;
export function UpdateNotice({updates,blocked}:{updates:AppUpdates,blocked:boolean}){if(!updates.version)return null;return <div className="update-notice" role="status"><RefreshCw size={16}/><div><strong>{blocked?'새 버전 준비됨 · 저장 후 업데이트':'새 버전이 준비됐어요'}</strong><p>{blocked?'작성 중인 내용을 저장하거나 취소하면 업데이트돼요':updates.message||'최신 화면으로 업데이트하는 중이에요'}</p>{!blocked&&updates.manualOnly&&<button className="text-button" type="button" onClick={updates.apply}>업데이트하기</button>}</div></div>}
export function UpdateControl({updates,blocked}:{updates:AppUpdates,blocked:boolean}){return <div className="update-control"><button className="secondary" type="button" onClick={updates.check} disabled={updates.checking}><RefreshCw className={updates.checking?'spin':''} size={15}/>{updates.checking?'업데이트 확인 중':'앱 업데이트 확인'}</button>{updates.message&&!updates.version&&<p role="status">{updates.message}</p>}<UpdateNotice updates={updates} blocked={blocked}/></div>}
