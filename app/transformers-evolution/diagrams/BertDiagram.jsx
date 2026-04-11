import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss, DiagramTip, ghostBox, FS, FSV } from './helpers';

export function BertDiagram() {
  const { box } = getDiagramHelpers();
  return (<svg viewBox="0 0 260 150" className={`${ss} min-w-[220px]`} xmlns="http://www.w3.org/2000/svg">{defs}
    {box(5,10,36,22,C.token,"[CLS]","Classification token. Its final representation = sentence-level embedding.")}
    {box(45,10,36,22,C.token,"The","Regular token — attends to ALL tokens left AND right.")}
    {box(85,10,44,22,C.novel,"[MASK]","15% of tokens replaced with [MASK]. Model predicts original using BOTH sides — forcing bidirectional understanding.")}
    {box(133,10,36,22,C.token,"sat","Can see [MASK] position, giving richer context than GPT.")}
    {box(173,10,36,22,C.token,"down","",FS)}
    {box(213,10,36,22,C.token,"[SEP]","Separator for sentence boundary.")}
    <line x1={5} y1={34} x2={249} y2={34} stroke={C.novel} strokeWidth={1.5} opacity={0.4}/>
    {lbl(130,44,"← Attends both directions →",FS,C.novel)}
    <DiagramTip detail="GHOST: GPT's causal mask only lets each token see LEFT context. BERT removes this restriction — every token sees every other.">
      <line x1={85} y1={38} x2={45} y2={38} stroke={C.dim} strokeWidth={0.6} strokeDasharray="2,2" opacity={0.4} markerEnd="url(#ah)"/>
      <line x1={129} y1={38} x2={170} y2={38} stroke={C.dim} strokeWidth={0.6} strokeDasharray="2,2" opacity={0.4} markerEnd="url(#ah)"/>
      {lbl(60,37,"←GPT only sees this",FSV,"#aaa")}{lbl(155,37,"BERT sees this too→",FSV,C.novel)}
    </DiagramTip>
    {box(25,52,210,26,C.attn,"Transformer Encoder","Same attention + FFN as original Transformer, but NO causal mask — every token sees every other. 12–24 layers.")}
    {arr(130,78,130,86)}
    {box(25,88,210,22,C.novel,"Predict [MASK] → original token","MLM: reconstruct masked tokens from bidirectional context. Representations are much richer for understanding tasks.")}
    {arr(130,110,130,118)}
    {box(45,120,170,20,C.ffn,"Downstream: QA, NLI, Sentiment","Fine-tune with task head. BERT dominated NLU benchmarks.")}
    {lbl(130,150,"Bidirectional masking produces richer representations than left-to-right",FS,C.novel)}</svg>);
}
