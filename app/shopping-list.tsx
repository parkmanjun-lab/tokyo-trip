import {useRef} from 'react';
import {Check,Plus,Pencil,Trash2,ShoppingBag,X,MoreHorizontal} from 'lucide-react';
import {allCatalog} from '../lib/catalog';
import type {ShoppingItem} from '../lib/trip';
export type ShoppingDraft={id:string|null,place:string,item:string,base:ShoppingItem|null};
export const emptyShoppingDraft:ShoppingDraft={id:null,place:'',item:'',base:null};
export default function ShoppingList({items,pendingId,draft,locked,onDraft,onSubmit,onEdit,onToggle,onDelete,onComposition}:{items:ShoppingItem[],pendingId:string|null,draft:ShoppingDraft,locked:boolean,onDraft:(draft:ShoppingDraft)=>void,onSubmit:()=>void,onEdit:(item:ShoppingItem)=>boolean,onToggle:(id:string)=>void,onDelete:(id:string)=>void,onComposition:(active:boolean)=>void}){
 const itemInput=useRef<HTMLInputElement>(null);
 const done=items.filter(x=>x.done).length;
 return <><div className="section-top"><h2>쇼핑목록</h2><span className="progress-count"><b className="count-roll" key={done}>{done}</b><span> / {items.length}</span></span></div>
 <div className="progress-track shopping-progress" role="progressbar" aria-label="쇼핑 완료" aria-valuenow={done} aria-valuemin={0} aria-valuemax={items.length||1}><div style={{width:`${items.length?done/items.length*100:0}%`}}/></div>
 <form className={`shopping-add shopping-add-compact ${draft.id?'is-editing':''}`} onSubmit={e=>{e.preventDefault();onSubmit()}} onCompositionStart={()=>onComposition(true)} onCompositionEnd={()=>onComposition(false)}>
  <label><span>장소</span><input aria-label="구매할 장소" value={draft.place} onChange={e=>onDraft({...draft,place:e.target.value})} disabled={locked} maxLength={180} list="shopping-store-options" placeholder="매장 이름 · 미정이면 비워두기"/></label>
  <datalist id="shopping-store-options">{allCatalog.filter(p=>p.category.startsWith('쇼핑')).map(p=><option value={p.title} key={p.id}>{p.area}</option>)}</datalist>
  <div className="shopping-item-line"><label><span>물품</span><input ref={itemInput} aria-label="구매할 물품" value={draft.item} onChange={e=>onDraft({...draft,item:e.target.value})} disabled={locked} maxLength={180} required placeholder="살 물건 적기"/></label>
  <div className="shopping-form-actions">{draft.id&&<button type="button" className="text-button" disabled={locked} onClick={()=>onDraft(emptyShoppingDraft)}><X size={14}/>수정 취소</button>}<button type="submit" className="primary" aria-label={draft.id?'수정 저장':'물품 추가'} title={draft.id?'수정 저장':'물품 추가'} disabled={locked||!draft.item.trim()||(!draft.id&&items.length>=200&&!items.some(x=>x.id===pendingId))}>{draft.id?<Check size={16}/>:<Plus size={16}/>}<span className="shopping-submit-label">{draft.id?'저장':'추가'}</span></button></div></div>
 </form>
 {items.length>=200&&<p className="form-hint">쇼핑목록은 최대200개까지 저장할 수 있어요</p>}
 <div className="shopping-items">{items.map(item=><div className={`shopping-row ${item.done?'done':''}`} key={item.id}><label className="shopping-check"><input type="checkbox" checked={item.done} disabled={locked} onChange={()=>onToggle(item.id)} aria-label={`${item.item} 구매 완료`}/><span className="check-box">{item.done&&<Check size={15}/>}</span><span className="shopping-item-copy"><strong>{item.item}</strong><span>{item.place||'장소 미정'}</span></span></label><details className="shopping-item-menu" name="shopping-item-actions"><summary aria-label={`${item.item} 관리`} title={`${item.item} 관리`}><MoreHorizontal size={16}/></summary><div className="shopping-row-actions"><button type="button" aria-label={`${item.item} 수정`} disabled={locked} onClick={e=>{const menu=e.currentTarget.closest('details');menu?.removeAttribute('open');menu?.querySelector('summary')?.focus();if(onEdit(item))requestAnimationFrame(()=>itemInput.current?.focus())}}><Pencil size={14}/><span>수정</span></button><button type="button" className="shopping-delete" aria-label={`${item.item} 삭제`} disabled={locked} onClick={e=>{const menu=e.currentTarget.closest('details');menu?.removeAttribute('open');menu?.querySelector('summary')?.focus();onDelete(item.id)}}><Trash2 size={14}/><span>삭제</span></button></div></details></div>)}</div>
 {items.length===0&&<div className="empty"><ShoppingBag size={27}/><h3>여행에서 살 것을 적어보세요</h3><p>구매한 물품은 체크해서 함께 확인할 수 있어요</p></div>}
 </>;
}
