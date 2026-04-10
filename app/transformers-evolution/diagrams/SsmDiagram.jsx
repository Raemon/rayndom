import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss, DiagramTip, op, ghostBox, FS, FSV } from './helpers';

export function SsmDiagram() {
  const { box } = getDiagramHelpers();
  return (<svg viewBox="0 0 260 170" style={{...ss,minWidth:190}} xmlns="http://www.w3.org/2000/svg">{defs}
    {lbl(65,16,"Transformer attention",FS,"#666")}{lbl(195,16,"SSM / Mamba core",FS,C.novel)}
    <DiagramTip detail="Dense self-attention lets every token attend to every other in O(N²) time and memory—great quality, painful at megabase lengths.">
      <rect x={8} y={22} width={114} height={48} rx={2} fill={C.attn} opacity={0.08}/>
      {ghostBox(14,28,102,18,"All-to-all pairwise scores","Classic self-attention materializes broad receptive fields at quadratic cost.",FS)}
      {lbl(65,54,"O(N²) time & memory",FS,C.attn)}
      {lbl(65,64,"massively parallel matmuls",FS,C.attn)}
    </DiagramTip>
    <DiagramTip detail="Structured state-space models maintain a fixed-size state and recurrently ingest tokens in O(N) time with O(1) state per step, parallelized via scans.">
      <rect x={138} y={22} width={114} height={48} rx={2} fill={C.novel} opacity={0.08}/>
      {lbl(195,36,"Recurrent state update",FS,C.novel)}
      {lbl(195,46,"O(N) time, O(1) state",FS,C.novel)}
      {lbl(195,56,"parallel prefix scan on GPU",FS,C.novel)}
    </DiagramTip>
    {arr(65,70,65,86)}{lbl(48,78,"attention bottleneck",FS,"#666")}
    {arr(195,70,195,86)}{lbl(212,78,"sequential scan",FS,"#666")}
    {box(128,88,124,24,C.novel,"Selective gating","Input-dependent gates let Mamba remember or forget per channel, closing much of the quality gap.",FS)}
    {op(244,100,"×","Pointwise gate mixes projected input with the recurrent state update.",{r:8,color:C.gate,fill:'none'})}
    {box(40,118,180,26,C.ffn,"Hybrid stacks (e.g., Jamba)","Interleave SSM layers for cheap context with a few attention layers for precise retrieval.",FS)}
    {lbl(130,158,"SSMs trade all-to-all attention for recurrent state updates; selective gates and hybrid stacks recover transformer-like quality.",FS,C.novel)}
  </svg>);
}
