import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, vb, ss } from './helpers';

export function ResnetDiagram({ onTip }) {
  const { t, box } = getDiagramHelpers(onTip);
  return (<svg viewBox={vb} style={ss} xmlns="http://www.w3.org/2000/svg">{defs}{lbl(105,10,"Residual Learning: F(x) + x")}
    {box(30,24,60,16,C.token,"Input x","Activation from previous layer.",6.5)}
    {arr(60,40,60,48)}
    {box(30,50,60,18,C.ffn,"Conv + ReLU","Weight layer 1. Learns features.",6.5)}
    {arr(60,68,60,76)}
    {box(30,78,60,18,C.ffn,"Conv","Weight layer 2. Together these learn the RESIDUAL F(x).",6.5)}
    <g {...t("THE KEY INNOVATION: Skip connection carries input x directly to the output. The layers only need to learn F(x) = desired − x, not the full mapping. If F(x)=0, this block is a no-op (identity). This makes depth free — extra layers can't hurt.")}><path d="M92,32 L130,32 L130,92 L92,92" fill="none" stroke={C.novel} strokeWidth={2} markerEnd="url(#ah)"/>{lbl(140,62,"x (skip)",6,C.novel)}</g>
    {box(30,100,60,16,C.novel,"F(x) + x","Add skip connection to layer output, then ReLU. Gradients flow through both paths.",6.5)}
    {arr(60,96,60,100)}
    {lbl(105,125,"Enabled 152+ layers; used in every Transformer block",6.5,C.novel)}
    {box(150,50,50,30,C.dim,"Degradation","Without skip: 56-layer net has HIGHER error than 20-layer. Not overfitting — optimization failure.",6)}</svg>);
}
