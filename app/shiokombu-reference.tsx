import data from '../lib/shiokombu-reference.json';
export default function ShiokombuReference({title}:{title:string}){
 if(title.trim()!==data.title)return null;
 return <details className="recommendation-details product-reference"><summary>시오콘부 구매 참고 · 판매 후보</summary><p className="tip-caution">내 메모와 별도로 표시되는 참고 정보예요. 지점별 재고는 확인하지 못했어요</p><p style={{whiteSpace:'pre-line',overflowWrap:'anywhere'}}>{data.note}</p><div className="tip-sources">{data.sourceUrls.map((url,i)=><a key={url} href={url} target="_blank" rel="noopener noreferrer">상품·매장 공식 안내 {i+1}</a>)}</div></details>;
}
