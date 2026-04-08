import { C } from '../colors';

const arrM = <marker id="ah" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto"><path d="M0,0 L7,2.5 L0,5" fill={C.dim}/></marker>;

export const defs = <defs>{arrM}</defs>;
export const vb = "0 0 210 130";
export const ss = { display:'block', width:'100%', height:'auto', minWidth:180 };

export function getDiagramHelpers(onTip) {
  const t = (detail) => ({ onMouseEnter: (e) => onTip({ text: detail, x: e.clientX, y: e.clientY }), onMouseLeave: () => onTip(null), style: { cursor: 'help' } });
  const box = (x,y,w,h,fill,label,detail,fs=7.5) => { const lines = label.split('\n'); const sz = fs+1.5; return (<g {...t(detail)}><rect x={x} y={y} width={w} height={h} rx={3} fill={fill} opacity={0.9}/>{lines.length === 1 ? <text x={x+w/2} y={y+h/2+3} textAnchor="middle" fill="#f0ece4" fontSize={sz} fontFamily="sans-serif">{label}</text> : <text x={x+w/2} y={y+h/2+3} textAnchor="middle" fill="#f0ece4" fontSize={sz} fontFamily="sans-serif">{lines.map((l,i) => <tspan key={i} x={x+w/2} dy={i===0?`${-(lines.length-1)*0.55}em`:'1.1em'}>{l}</tspan>)}</text>}</g>); };
  return { t, box };
}

export const arr = (x1,y1,x2,y2) => <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.dim} strokeWidth={1} markerEnd="url(#ah)"/>;
export const lbl = (x,y,text,fs=6.5,color="#666") => <text x={x} y={y} textAnchor="middle" fill={color} fontSize={fs+1.5} fontFamily="sans-serif">{text}</text>;
