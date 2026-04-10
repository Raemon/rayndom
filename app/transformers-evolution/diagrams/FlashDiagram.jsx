import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss, DiagramTip } from './helpers';

export function FlashDiagram() {
  const { box } = getDiagramHelpers();
  return (<svg viewBox="0 0 220 135" style={{...ss,minWidth:190}} xmlns="http://www.w3.org/2000/svg">{defs}{lbl(110,10,"FlashAttention: IO-Aware Tiling")}
    <DiagramTip detail="GPU HBM: Large (40–80GB) but slow. Standard attention stores full N×N matrix here — the memory bottleneck."><rect x={5} y={20} width={95} height={95} rx={4} fill="none" stroke={C.token} strokeWidth={1} strokeDasharray="3,2"/>{lbl(52,32,"HBM (slow, large)",6.5,C.token)}{box(10,38,38,18,C.token,"Q","Query matrix. N×d.",6)}{box(52,38,38,18,C.token,"K","Key matrix.",6)}{box(10,60,38,18,C.token,"V","Value matrix.",6)}{box(10,88,80,14,C.dim,"Output O","Written back tile-by-tile. Full N×N never stored.",6)}</DiagramTip>
    {arr(100,50,120,50)}{lbl(110,46,"tile",5.5)}
    <DiagramTip detail="On-chip SRAM: ~20MB but very fast. FlashAttention computes attention in blocks that fit here, accumulating results without materializing the full matrix."><rect x={122} y={20} width={90} height={70} rx={4} fill="none" stroke={C.novel} strokeWidth={1.5}/>{lbl(167,32,"SRAM (fast, tiny)",6.5,C.novel)}</DiagramTip>
    {box(130,38,35,18,C.novel,"Qᵢ","Q tile in SRAM.",6)}{box(170,38,35,18,C.novel,"Kⱼ","K tile.",6)}{box(130,62,75,18,C.novel,"Compute Aᵢⱼ","Block attention in SRAM. Online softmax (log-sum-exp trick) — no full matrix needed.",6)}
    {arr(167,90,100,96)}{lbl(140,98,"write",5.5)}
    {lbl(167,108,"Memory: O(N²) → O(N)",6.5,C.novel)}{lbl(167,118,"Speed: 2–4× faster",6.5,C.novel)}{lbl(167,128,"Math: identical output",6.5,"#666")}</svg>);
}
