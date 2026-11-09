export const UPDATE_ATTEMPT_KEY='tokyo-app-update-attempt:v1';
export const UPDATE_COOLDOWN=5*60*1000;
export type UpdateState={checking:boolean,version:string|null,manualOnly:boolean,message:string};
type Options={currentVersion:string,isBusy:()=>boolean,isVisible:()=>boolean,reload:(canReload:()=>boolean)=>void|boolean|Promise<void|boolean>,onState:(s:UpdateState)=>void,fetcher?:typeof fetch,storage?:Pick<Storage,'getItem'|'setItem'>|null,clock?:()=>number};
export function validBuildVersion(value:unknown):value is string{return typeof value==='string'&&/^tokyo-[a-z0-9-]{6,90}$/.test(value);}
export function createAppUpdateMonitor(options:Options){
 const clock=options.clock||Date.now;let state:UpdateState={checking:false,version:null,manualOnly:false,message:''};let disposed=false,inFlight=false,reloading=false,lastCheck=-Infinity;let applyTimer:ReturnType<typeof setTimeout>|undefined;let controller:AbortController|undefined;
 const publish=(patch:Partial<UpdateState>)=>{if(disposed)return;state={...state,...patch};options.onState(state);};
 function reloadWhenSafe(manual=false){
  if(disposed||reloading||!state.version||!options.isVisible()||options.isBusy())return;
  if(applyTimer)clearTimeout(applyTimer);
  applyTimer=setTimeout(()=>{
   applyTimer=undefined;if(disposed||reloading||!state.version||!options.isVisible()||options.isBusy())return;
   let canAuto=true;try{if(!options.storage)throw Error('storage unavailable');const raw=options.storage.getItem(UPDATE_ATTEMPT_KEY);if(raw){const attempt=JSON.parse(raw);const age=clock()-attempt.at;if(validBuildVersion(attempt.from)&&validBuildVersion(attempt.to)&&Number.isFinite(age)&&age>=-60000&&age<UPDATE_COOLDOWN)canAuto=false;}}catch{canAuto=false;}
   if(!canAuto&&!manual){publish({manualOnly:true,message:'자동 업데이트를 잠시 멈췄어요. 업데이트하기를 눌러주세요'});return;}
   let previousAttempt:string|null=null;try{previousAttempt=options.storage?.getItem(UPDATE_ATTEMPT_KEY)??null;}catch{}
   try{if(!options.storage)throw Error('storage unavailable');options.storage.setItem(UPDATE_ATTEMPT_KEY,JSON.stringify({from:options.currentVersion,to:state.version,at:clock()}));}catch{if(!manual){publish({manualOnly:true,message:'자동 업데이트를 완료할 수 없어 직접 확인이 필요해요'});return;}}
   reloading=true;
   const canReload=()=>!disposed&&options.isVisible()&&!options.isBusy();
   void Promise.resolve(options.reload(canReload)).then(applied=>{if(applied===false){reloading=false;try{options.storage?.setItem(UPDATE_ATTEMPT_KEY,previousAttempt??'');}catch{}}}).catch(()=>{reloading=false;publish({manualOnly:true,message:'업데이트를 완료하지 못했어요. 다시 눌러주세요'});});
  },500);
 }
 async function check(manual=false){
  if(disposed||inFlight||reloading||!options.isVisible())return;
  if(!manual&&clock()-lastCheck<15000){reloadWhenSafe();return;}
  inFlight=true;lastCheck=clock();controller=new AbortController();const timeout=setTimeout(()=>controller?.abort(),10000);publish({checking:true,message:''});
  try{const r=await(options.fetcher||fetch)('/api/version',{cache:'no-store',credentials:'same-origin',signal:controller.signal});if(!r.ok)throw Error('version unavailable');const data:unknown=await r.json();if(!data||typeof data!=='object'||!validBuildVersion((data as {version?:unknown}).version))throw Error('invalid version');if(disposed)return;const version=(data as {version:string}).version;if(version===options.currentVersion){if(applyTimer)clearTimeout(applyTimer);publish({version:null,manualOnly:false,message:manual?'최신 버전이에요':''});}else{publish({version,manualOnly:false,message:''});reloadWhenSafe();}}
  catch{if(!disposed&&manual)publish({message:'업데이트를 확인하지 못했어요. 연결 후 다시 눌러주세요'});}
  finally{clearTimeout(timeout);inFlight=false;controller=undefined;publish({checking:false});}
 }
 return {check,resume:()=>reloadWhenSafe(),apply:()=>reloadWhenSafe(true),dispose(){disposed=true;controller?.abort();if(applyTimer)clearTimeout(applyTimer);},getState:()=>state};
}
