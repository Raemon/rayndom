import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, vb, ss } from './helpers';

export function RopeDiagram({ onTip }) {
  const { t, box } = getDiagramHelpers(onTip);
  return (<svg viewBox={vb} style={ss} xmlns="http://www.w3.org/2000/svg">{defs}{lbl(105,10,"Rotary Position Embeddings")}{box(10,28,55,22,C.attn,"Query q","In standard attention, position was ADDED. RoPE ROTATES the vector based on position.",6.5)}{arr(65,39,75,39)}{box(77,24,56,30,C.novel,"Rotate by\nθ × pos","Each dimension pair rotated by angle ∝ position. Uses Euler's formula: e^(iθ). Different frequencies per dimension pair.",6.5)}{arr(133,39,145,39)}{box(147,28,55,22,C.attn,"Rotated q'","Position encoded in the vector's orientation.",6.5)}{box(10,72,55,22,C.attn,"Key k","Key at different position. Same rotation scheme, different angle.",6.5)}{arr(65,83,75,83)}{box(77,68,56,30,C.novel,"Rotate by\nθ × pos","Same rotation, different position. The q'·k' dot product: rotation angles SUBTRACT → depends only on RELATIVE distance.",6.5)}{arr(133,83,145,83)}{box(147,72,55,22,C.attn,"Rotated k'","",6.5)}{arr(175,50,175,58)}{arr(175,72,175,64)}
    <g {...t("Dot product q'·k' naturally encodes RELATIVE position. Models trained on length 4K can extrapolate because they learned relative patterns, not absolute ones.")}><rect x={140} y={56} width={70} height={14} rx={3} fill={C.novel} opacity={0.9}/><text x={175} y={65.5} textAnchor="middle" fill="#f0ece4" fontSize={7.5} fontFamily="sans-serif">q'·k' = f(relative pos)</text></g>
    {lbl(105,120,"Result depends only on distance, not absolute position",6.5,C.novel)}</svg>);
}
