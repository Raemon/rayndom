import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss, ghostBox, FS, FSV } from './helpers';

export function TtcDiagram() {
  const { box } = getDiagramHelpers();
  return (<svg viewBox="0 0 260 168" style={{...ss,minWidth:190}} xmlns="http://www.w3.org/2000/svg">{defs}
    {box(80,14,100,20,C.token,"Hard prompt","Tasks where a single greedy decode often fails without extra deliberation.",FS)}
    {arr(130,34,130,42)}{lbl(188,38,"start reasoning trace",FS,"#666")}
    {ghostBox(158,14,92,18,"Single-pass guess","Baseline: one forward, immediate answer—no explicit scratch space.",FSV)}
    {box(50,44,160,20,C.novel,"Think: decompose…","Generate a long hidden chain; each token buys more serial compute at inference.",FS)}
    {arr(130,64,130,72)}{lbl(188,68,"draft plan + steps",FS,"#666")}
    {box(50,74,72,20,C.novel,"Verify ✓","Self-consistency checks, reward models, or symbolic tests score intermediate work.",FS)}
    {box(138,74,72,20,C.novel,"Backtrack ↺","Discard bad branches and resample; harder prompts naturally consume more tokens.",FS)}
    <path d="M210,84 L222,84 L222,54 L162,54" fill="none" stroke={C.dim} strokeWidth={1} strokeDasharray="2,2" markerEnd="url(#ah)"/>
    {lbl(228,68,"retry branch",FS,"#666")}
    {arr(130,94,130,102)}{lbl(188,98,"refine hypothesis",FS,"#666")}
    {box(50,104,160,20,C.novel,"Think more: plan B…","Inference-time compute can exceed final-answer length by orders of magnitude.",FS)}
    {arr(130,124,130,132)}{lbl(188,128,"emit answer",FS,"#666")}
    {box(80,134,100,20,C.ffn,"Final answer","Quality scales with test-time thinking budget, not only pretraining FLOPs.",FS)}
    {lbl(130,162,"Test-time compute lets a fixed model spend more inference tokens deliberating, verifying, and backtracking before answering.",FS,C.novel)}
  </svg>);
}
