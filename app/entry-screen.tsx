'use client';
import {useEffect,useState,type FormEvent} from 'react';
import {ArrowRight,MapPin,LoaderCircle} from 'lucide-react';
import AsyncPanel from './async-panel';
import {clearTripCache} from '../lib/trip-cache';
import {prefetchTrip,discardTripPrefetch} from '../lib/trip-client';
import Planner from './planner';
import StartupShell from './startup-shell';
import {installStartupCache} from '../lib/startup-cache';
function startOpening(){void prefetchTrip();}
import {ENTRY_FLAG_KEY,ENTRY_FLAG_VALUE,matchesEntryPhrase,hasEntryFlag} from '../lib/entry-display';
export default function EntryScreen(){
 const [entered,setEntered]=useState<boolean|null>(null);const [phrase,setPhrase]=useState('');const [remember,setRemember]=useState(true);const [error,setError]=useState('');const [notice,setNotice]=useState('');
 useEffect(()=>{installStartupCache();try{const ready=hasEntryFlag(localStorage.getItem(ENTRY_FLAG_KEY));if(ready)startOpening();setEntered(ready)}catch{setEntered(false)}},[]);
 function enter(event:FormEvent<HTMLFormElement>){event.preventDefault();if(!matchesEntryPhrase(phrase)){setError('입장 문구를 다시 확인해주세요');return;}setError('');setNotice('');try{if(remember)localStorage.setItem(ENTRY_FLAG_KEY,ENTRY_FLAG_VALUE);else localStorage.removeItem(ENTRY_FLAG_KEY);}catch{setNotice('이 브라우저가 저장을 차단해 다음 방문에는 입장 문구를 다시 입력해야 해요');}setPhrase('');startOpening();setEntered(true);}
 function reset(){clearTripCache();discardTripPrefetch();try{localStorage.removeItem(ENTRY_FLAG_KEY)}catch{}setEntered(false);setPhrase('');setError('');setNotice('');}
 if(entered===null)return <StartupShell/>;
 if(entered)return <>{notice&&<p className="entry-storage-notice" role="status">{notice}</p>}<AsyncPanel errorFallback={<div className="entry-loading" role="alert"><span>여행 화면을 불러오지 못했어요</span><button className="primary" type="button" onClick={()=>window.location.reload()}>다시 열기</button></div>} fallback={<StartupShell/>}><Planner onResetEntry={reset}/></AsyncPanel></>;
 return <main className="entry-screen"><div className="entry-panel"><div className="entry-mark"><span>東</span><MapPin size={18}/></div><p className="small-label">TOKYO · 2026.11.29—12.01</p><h1>도쿄 여행 노트</h1><p className="entry-intro">입장 문구를 입력해주세요</p><form onSubmit={enter}><label className="field"><span>입장 문구</span><input type="text" value={phrase} onChange={e=>{setPhrase(e.target.value);if(error)setError('')}} autoComplete="off" autoCapitalize="characters" spellCheck={false} placeholder="전달받은 문구" required maxLength={60} aria-invalid={!!error} aria-describedby={error?'entry-error':'entry-public-note'}/></label>{error&&<p className="entry-error" id="entry-error" role="alert">{error}</p>}<label className="entry-remember"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/><span>이 브라우저에서 기억하기</span></label><button className="primary" type="submit">여행 노트 열기 <ArrowRight size={16}/></button></form><p id="entry-public-note" className="entry-public-note">공개형 공유 노트예요. 입장 화면은 보안 기능이 아니며 누구나 여행 내용을 열람·수정할 수 있어요. 예약번호 등 민감한 정보는 적지 마세요</p></div></main>;
}
