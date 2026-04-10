import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss, DiagramTip, ghostBox, FS, FSV } from './helpers';

export function LongctxDiagram() {
  const { box } = getDiagramHelpers();
  return (<svg viewBox="0 0 260 158" style={{...ss,minWidth:190}} xmlns="http://www.w3.org/2000/svg">{defs}
    <DiagramTip detail="Early LMs were trained for hundreds to a couple thousand tokens; length was limited by quadratic attention memory, weak length extrapolation, and short-document corpora.">
      {ghostBox(14,20,48,16,"~2K window","512–2K token budgets were typical before long-context systems matured.",FS)}
    </DiagramTip>
    <DiagramTip detail="Modern stacks reach 128K–1M+ tokens by combining better position scaling, IO-aware attention, distributed kernels, and curricula that teach models to use length.">
      <rect x={14} y={20} width={232} height={16} rx={2} fill="none" stroke={C.novel} strokeWidth={1}/>
      {lbl(220,31,"128K–1M+ span",FS,C.novel)}
    </DiagramTip>
    {box(14,44,112,24,C.novel,"RoPE + NTK-style scaling","Rescale or interpolate rotary bases so attention stays coherent far past pretraining lengths.",FS)}
    {box(134,44,112,24,C.novel,"FlashAttention-2 (tiling)","Cuts attention memory from materialized N×N to a streaming tile footprint.",FS)}
    {box(14,74,112,24,C.novel,"Ring / shard attention","Partition sequence across devices and pass K,V blocks in a ring so no single GPU holds all pairs.",FS)}
    {box(134,74,112,24,C.novel,"Progressive length curriculum","Gradually increase training context so weights actually learn to exploit the extra span.",FS)}
    {arr(130,98,130,106)}{lbl(188,102,"stacked enablers",FS,"#666")}
    {box(30,108,200,26,C.ffn,"Long-context LM pass","Together these let one forward pass cover codebases, books, or hour-long chats.",FS)}
    {lbl(130,152,"Long context pairs scaled position methods, memory-aware attention, distributed kernels, and training that teaches models to use length.",FS,C.novel)}
  </svg>);
}
