import data from './purchase-references.json';
export type PurchaseReference={id:string,title:string,aliases:string[],summary:string,notes:string[],candidateIds:string[],candidateDescriptions:Record<string,string|undefined>,sourceUrls:string[],checkedAt:string};
export const purchaseReferences=data as PurchaseReference[];
// A product/brand wish is not a confirmed branch. Never bind it after an address is entered.
export function purchaseReference(entry:{title:string,place:string,catalogId?:string}){return !entry.place.trim()&&!entry.catalogId?purchaseReferences.find(r=>r.title===entry.title.trim()):undefined;}
