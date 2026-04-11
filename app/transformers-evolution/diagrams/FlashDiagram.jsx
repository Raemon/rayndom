import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss, DiagramTip, op, ghostBox, FS, FSV } from './helpers';

export function FlashDiagram() {
  const { box } = getDiagramHelpers();
  return (<svg viewBox="0 0 260 172" className={`${ss} min-w-[190px]`} xmlns="http://www.w3.org/2000/svg">{defs}
    <DiagramTip detail="GPU HBM is large but high-latency. Classic attention reads/writes a dense N×N map here, which becomes the bandwidth bottleneck.">
      <rect x={6} y={18} width={102} height={112} rx={2} fill="none" stroke={C.token} strokeWidth={1} strokeDasharray="3,2"/>
      {lbl(57,30,"HBM (slow, large)",FS,C.token)}
      {box(12,36,28,18,C.token,"Q","Query block N×d stored in HBM.",FSV)}
      {box(44,36,28,18,C.token,"K","Key block.",FSV)}
      {box(12,58,28,18,C.token,"V","Value block.",FSV)}
      {ghostBox(12,80,88,18,"Full N×N scores","Naive attention materializes all pairwise logits in HBM before softmax.",FSV)}
      {box(12,102,88,22,C.dim,"Output O (tiles)","Partial outputs streamed back without ever holding the full attention matrix.",FS)}
    </DiagramTip>
    {arr(108,54,118,54)}{lbl(128,50,"move blocks",FS,"#666")}
    <DiagramTip detail="On-chip SRAM is small but extremely fast. FlashAttention fuses softmax with matmul in tiles that fit SRAM, using running max/sum statistics so outputs match exact attention.">
      <rect x={124} y={18} width={128} height={88} rx={2} fill="none" stroke={C.novel} strokeWidth={1}/>
      {lbl(188,30,"SRAM (fast, tiny)",FS,C.novel)}
      {box(132,36,34,18,C.novel,"Qᵢ","Current query tile resident in SRAM.",FSV)}
      {box(172,36,34,18,C.novel,"Kⱼ","Key tile for the active block.",FSV)}
      {box(132,58,74,22,C.novel,"Fused tile matmul","Fused block multiply accumulating into SRAM scratch.",FS)}
      {op(188,90,"σ","Online softmax via stable log-sum-exp updates per tile; numerically identical to reference attention.",{r:9,color:C.novel,fill:'none'})}
    </DiagramTip>
    {arr(188,106,100,114)}{lbl(142,110,"accumulated Oᵢ",FS,"#666")}
    {lbl(64,138,"Memory: full map in HBM → tile-sized working set only",FS,C.novel)}
    {lbl(64,150,"Speed: 2–4× typical attention; math matches exact softmax attention",FS,"#666")}
    {lbl(130,164,"FlashAttention keeps tiles in fast SRAM so attention avoids materializing the full N×N map in HBM.",FS,C.novel)}
  </svg>);
}
