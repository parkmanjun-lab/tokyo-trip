import data from './japanese-phrases.json';
export type Phrase={id:string,cat:string,ko:string,ja:string,aliases:string,note?:string,party?:boolean};
export const PHRASES:Phrase[]=data.phrases;
export const PHRASE_CATEGORIES=data.categories;
export function normalizePhraseQuery(text:string){return text.normalize('NFKC').toLowerCase().replace(/[\s?!.,。？、·/]/g,'');}
export function searchPhrases(query:string,category='all'){const terms=query.trim().toLowerCase().split(/\s+/).map(normalizePhraseQuery).filter(Boolean);return PHRASES.filter(p=>(category==='all'||p.cat===category)&&terms.every(t=>normalizePhraseQuery(`${p.ko} ${p.ja} ${p.aliases}`).includes(t)));}
export function phraseText(p:Phrase,party:number){return p.party?`予約していないのですが、${['','一名','二名','三名','四名'][party]}で入れますか。`:p.ja;}
export function phraseMeaning(p:Phrase,party:number){return p.party?`예약 없이 ${['','한 명','두 명','세 명','네 명'][party]}, 괜찮을까요?`:p.ko;}
export function localJapaneseVoice(voices:SpeechSynthesisVoice[]){return voices.find(v=>/^ja(?:[-_]|$)/i.test(v.lang)&&v.localService===true)||null;}
