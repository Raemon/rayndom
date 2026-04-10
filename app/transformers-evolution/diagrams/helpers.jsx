'use client';
import Tooltip from '@/app/common/Tooltip';
import { C } from '../colors';

const arrM = <marker id="ah" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto"><path d="M0,0 L7,2.5 L0,5" fill={C.dim}/></marker>;

export const defs = <defs>{arrM}</defs>;
export const vb = "0 0 210 130";
export const ss = { display:'block', width:'100%', height:'auto', minWidth:180 };

const diagramTooltipContentClass =
  '!bg-[#fff] !text-[#1a1a1a] border border-neutral-300 shadow-lg text-[0.85em] leading-normal rounded-md p-2 font-[inherit]';

/** SVG group with hover tooltip (must use `g`, not `span`, inside `<svg>`). */
export function DiagramTip({ detail, children }) {
  return (
    <Tooltip
      as="g"
      content={detail}
      placement="top-start"
      maxWidth={300}
      noMargin
      contentClassName={diagramTooltipContentClass}
      wrapperStyle={{ cursor: 'help' }}
    >
      {children}
    </Tooltip>
  );
}

export function getDiagramHelpers() {
  const box = (x,y,w,h,fill,label,detail,fs=7.5) => { const lines = label.split('\n'); const sz = fs+1.5; return (
    <Tooltip
      as="g"
      content={detail}
      placement="top-start"
      maxWidth={300}
      noMargin
      contentClassName={diagramTooltipContentClass}
      wrapperStyle={{ cursor: 'help' }}
    >
      <rect x={x} y={y} width={w} height={h} rx={3} fill={fill} opacity={0.9}/>
      {lines.length === 1 ? <text x={x+w/2} y={y+h/2+3} textAnchor="middle" fill="#f0ece4" fontSize={sz} fontFamily="sans-serif">{label}</text> : <text x={x+w/2} y={y+h/2+3} textAnchor="middle" fill="#f0ece4" fontSize={sz} fontFamily="sans-serif">{lines.map((l,i) => <tspan key={i} x={x+w/2} dy={i===0?`${-(lines.length-1)*0.55}em`:'1.1em'}>{l}</tspan>)}</text>}
    </Tooltip>
  ); };
  return { box };
}

export const arr = (x1,y1,x2,y2) => <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.dim} strokeWidth={1} markerEnd="url(#ah)"/>;
export const lbl = (x,y,text,fs=6.5,color="#666") => <text x={x} y={y} textAnchor="middle" fill={color} fontSize={fs+1.5} fontFamily="sans-serif">{text}</text>;
