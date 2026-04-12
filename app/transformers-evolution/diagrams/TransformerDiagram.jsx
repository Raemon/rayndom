import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss, DiagramTip, op, FS, FSV } from './helpers';

export function TransformerDiagram() {
  const { box } = getDiagramHelpers();
  return (<svg viewBox="0 0 260 175" className={`${ss} min-w-[220px]`} xmlns="http://www.w3.org/2000/svg">{defs}
    {box(65,8,130,18,C.token,"Tokens + Pos Encoding","Embeddings SUMMED with positional encodings. Replaces recurrence — position injected as a signal.")}
    {arr(130,26,130,34)}
    {lbl(130,33,"x",FSV)}
    {box(35,36,190,18,C.novel,"Linear Projections → Q, K, V","THE KEY INNOVATION: Each token is projected into Q, K, V via three separate learned matrices. This SPLIT is the data operation — one vector becomes three.")}
    <line x1={70} y1={54} x2={70} y2={64} stroke={C.novel} strokeWidth={1.5} markerEnd="url(#ah)"/>
    <line x1={130} y1={54} x2={130} y2={64} stroke={C.novel} strokeWidth={1.5} markerEnd="url(#ah)"/>
    <line x1={190} y1={54} x2={190} y2={64} stroke={C.novel} strokeWidth={1.5} markerEnd="url(#ah)"/>
    {lbl(70,63,"Q",FSV,C.novel)}{lbl(130,63,"K",FSV,C.novel)}{lbl(190,63,"V",FSV,C.novel)}
    <DiagramTip detail="Multi-head: Q, K, V each split into h heads (e.g. 8). Each head attends independently — learns different relationship types (syntax, semantics, position).">
      <rect x={45} y={66} width={40} height={12} rx={2} fill={C.novel} opacity={0.6}/>
      <rect x={87} y={66} width={40} height={12} rx={2} fill={C.novel} opacity={0.6}/>
      <rect x={129} y={66} width={40} height={12} rx={2} fill={C.novel} opacity={0.6}/>
      <rect x={171} y={66} width={40} height={12} rx={2} fill={C.novel} opacity={0.6}/>
      {lbl(130,76,"split into h heads",FSV,C.novel)}
    </DiagramTip>
    {op(100,92,"·","Scaled dot-product: softmax(QKᵀ/√dₖ). Computes how much each token attends to every other. ALL positions in PARALLEL.",{r:12,color:C.novel})}
    <line x1={70} y1={78} x2={91} y2={85} stroke={C.dim} strokeWidth={1} markerEnd="url(#ah)"/>
    <line x1={130} y1={78} x2={109} y2={85} stroke={C.dim} strokeWidth={1} markerEnd="url(#ah)"/>
    {lbl(76,88,"Q",FSV,C.novel)}{lbl(118,88,"Kᵀ",FSV,C.novel)}
    {op(160,92,"×","Multiply attention weights by V. Each token's output = weighted sum of all V vectors.",{r:10,color:C.novel})}
    <line x1={112} y1={92} x2={150} y2={92} stroke={C.dim} strokeWidth={0.8} markerEnd="url(#ah)"/>
    {lbl(131,89,"weights",FSV)}
    <line x1={190} y1={78} x2={168} y2={85} stroke={C.dim} strokeWidth={1} markerEnd="url(#ah)"/>
    {lbl(184,88,"V",FSV,C.novel)}
    {arr(160,103,130,112)}
    {op(130,116,"+","Residual connection: input + attention output. Gradients flow through both paths (from ResNet).",{r:9})}
    <path d="M33,17 L22,17 L22,116 L121,116" fill="none" stroke={C.dim} strokeWidth={0.8} strokeDasharray="2,2" markerEnd="url(#ah)"/>
    {lbl(16,66,"skip",FSV)}
    {arr(130,125,130,132)}
    {box(65,132,130,16,C.dim,"LayerNorm","Normalizes across dimensions. Stabilizes training.")}
    {arr(130,148,130,154)}
    {box(65,154,130,18,C.ffn,"FFN: W₂·ReLU(W₁x)","Per-position. Where the model stores 'knowledge' — most parameters live here.")}
    {lbl(130,182,"Self-attention replaces recurrence: all positions computed in parallel",FS,C.novel)}</svg>);
}
