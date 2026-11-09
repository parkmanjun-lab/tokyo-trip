'use client';
import {Component,Suspense,type ReactNode} from 'react';
type Props={children:ReactNode,fallback:ReactNode,errorFallback?:ReactNode};
class PanelBoundary extends Component<Props,{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?(this.props.errorFallback??<p className="form-hint" role="alert">이 안내를 불러오지 못했어요. 다른 기능은 계속 이용할 수 있어요. 작성 중인 내용을 저장한 뒤 새로고침해주세요</p>):this.props.children;}
}
export default function AsyncPanel(props:Props){return <PanelBoundary {...props}><Suspense fallback={props.fallback}>{props.children}</Suspense></PanelBoundary>;}
