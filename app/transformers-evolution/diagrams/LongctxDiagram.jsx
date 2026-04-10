import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss, DiagramTip } from './helpers';

export function LongctxDiagram() {
  const { box } = getDiagramHelpers();
  return (<svg viewBox="0 0 220 130" style={{...ss,minWidth:190}} xmlns="http://www.w3.org/2000/svg">{defs}{lbl(110,10,"Long Context: 2K → 1M+")}
    <DiagramTip detail="Original: 512–2048 tokens. Limited by O(N²) memory, position encoding degradation, and lack of long-document training data."><rect x={10} y={24} width={30} height={12} rx={2} fill={C.dim}/>{lbl(25,33,"2K",5.5)}</DiagramTip>
    <DiagramTip detail="Modern: 128K–1M+. Required solving multiple independent problems simultaneously."><rect x={10} y={24} width={200} height={12} rx={2} fill="none" stroke={C.novel} strokeWidth={1}/>{lbl(200,33,"1M+",5.5,C.novel)}</DiagramTip>
    {box(10,46,95,18,C.novel,"RoPE + NTK Scaling","Adjust RoPE frequencies so model extrapolates to unseen positions. Based on Neural Tangent Kernel theory.",6.5)}
    {box(115,46,95,18,C.novel,"FlashAttention-2","Tiled attention: O(N²) → O(N) memory. Without it, 128K tokens ≈ 1TB attention memory.",6.5)}
    {box(10,72,95,18,C.novel,"Ring Attention","Split sequence across GPUs. Each computes on its segment. K,V blocks passed in ring topology.",6.5)}
    {box(115,72,95,18,C.novel,"Progressive Training","Train on longer documents gradually. Short-trained models can't use long context even if arch supports it.",6.5)}
    {arr(110,90,110,100)}{box(30,102,160,20,C.ffn,"128K–1M+ Context","All four combined. Process entire codebases, books, long conversations in one pass.",6.5)}</svg>);
}
