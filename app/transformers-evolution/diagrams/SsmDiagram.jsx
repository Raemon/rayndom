import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss } from './helpers';

export function SsmDiagram({ onTip }) {
  const { t, box } = getDiagramHelpers(onTip);
  return (<svg viewBox="0 0 220 130" style={{...ss,minWidth:190}} xmlns="http://www.w3.org/2000/svg">{defs}{lbl(110,10,"SSM / Mamba vs Attention")}{lbl(55,24,"Transformer Attention",6,"#666")}{lbl(165,24,"Mamba / SSM",6,C.novel)}
    <g {...t("Standard attention: every token attends to every other. Powerful but O(N²). Prohibitive for very long sequences or on-device.")}><rect x={5} y={28} width={100} height={40} rx={3} fill={C.attn} opacity={0.12}/>{lbl(55,42,"All-to-all attention",6,C.attn)}{lbl(55,52,"O(N²) time & memory",6,C.attn)}{lbl(55,62,"Highly parallel (GPU ✓)",6,C.attn)}</g>
    <g {...t("SSMs replace N×N attention with a hidden state updated recurrently. O(N) time, O(1) memory per step. Can be parallelized via scan.")}><rect x={115} y={28} width={100} height={40} rx={3} fill={C.novel} opacity={0.12}/>{lbl(165,42,"Recurrent state update",6,C.novel)}{lbl(165,52,"O(N) time, O(1) memory",6,C.novel)}{lbl(165,62,"Parallel scan (GPU ✓)",6,C.novel)}</g>
    {box(115,76,100,20,C.novel,"Selective Gating","Mamba's key: input-dependent gating for selective remember/forget. Closed the quality gap with Transformers.",6.5)}
    {arr(55,68,55,100)}{arr(165,96,165,100)}
    {box(20,102,180,22,C.ffn,"Hybrid (Jamba)","Alternate SSM (efficient) + attention (precise retrieval) layers. O(N) scaling with attention-level quality.",6.5)}</svg>);
}
