import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss, DiagramTip, op, ghostBox, FS, FSV } from './helpers';

export function LstmDiagram() {
  const { box } = getDiagramHelpers();
  return (<svg viewBox="0 0 320 205" className={`${ss} min-w-[220px]`} xmlns="http://www.w3.org/2000/svg">{defs}
    <DiagramTip detail="Cell state: a 'conveyor belt' of long-term memory. Updated by ADDITION (not multiplication), so gradients flow unchanged — solving vanishing gradients.">
      <line x1={14} y1={28} x2={306} y2={28} stroke={C.cellState} strokeWidth={3}/>
      {lbl(160,19,"cₜ  (cell state — long-term memory)",FS,C.cellState)}
    </DiagramTip>
    {ghostBox(108,62,104,28,"hₜ = tanh(W·[hₜ₋₁,xₜ])","GHOST: In a simple RNN, one tanh is the entire computation — no gates, no separate memory. The LSTM replaces this with gated control.",FSV)}
    {op(54,58,"×","FORGET GATE output: element-wise multiply cell state by σ(forget). 0 = erase, 1 = keep.",{r:11,color:C.novel})}
    <line x1={54} y1={47} x2={54} y2={28} stroke={C.novel} strokeWidth={1} markerEnd="url(#ah)"/>
    {op(160,58,"×","INPUT GATE output: element-wise multiply candidate by σ(input). Controls what NEW info gets written.",{r:11,color:C.novel})}
    {op(160,28,"+","Additive update: cₜ = forget×cₜ₋₁ + input×candidate. ADDITION preserves gradients (the key insight vs RNN).",{r:11,color:C.novel})}
    {op(272,58,"×","OUTPUT GATE: element-wise multiply tanh(cₜ) by σ(output). Selects which memory dims to expose as hₜ.",{r:11,color:C.novel})}
    {op(54,96,"σ","Forget gate: σ(Wf·[hₜ₋₁, xₜ] + bf). Outputs 0–1 per dimension.",{r:11,color:C.novel})}
    {op(134,96,"σ","Input gate: σ(Wi·[hₜ₋₁, xₜ] + bi).",{r:11,color:C.novel})}
    {op(186,96,"tanh","Candidate values: tanh(Wc·[hₜ₋₁, xₜ] + bc). New info to potentially store.",{r:14,color:C.novel})}
    {op(272,96,"σ","Output gate: σ(Wo·[hₜ₋₁, xₜ] + bo).",{r:11,color:C.novel})}
    <line x1={54} y1={85} x2={54} y2={69} stroke={C.dim} strokeWidth={1} markerEnd="url(#ah)"/>
    <line x1={134} y1={85} x2={160} y2={69} stroke={C.dim} strokeWidth={1} markerEnd="url(#ah)"/>
    <line x1={186} y1={82} x2={160} y2={69} stroke={C.dim} strokeWidth={1} markerEnd="url(#ah)"/>
    <line x1={272} y1={85} x2={272} y2={69} stroke={C.dim} strokeWidth={1} markerEnd="url(#ah)"/>
    <line x1={160} y1={47} x2={160} y2={28} stroke={C.dim} strokeWidth={1} markerEnd="url(#ah)"/>
    <DiagramTip detail="tanh squashes cell state to [-1,1] before the output gate filters it.">
      <circle cx={246} cy={28} r={6} fill="none" stroke={C.cellState} strokeWidth={0.8}/>
      <text x={246} y={31} textAnchor="middle" fill={C.cellState} fontSize={FSV} fontFamily="sans-serif">th</text>
      <line x1={252} y1={28} x2={272} y2={47} stroke={C.dim} strokeWidth={1} markerEnd="url(#ah)"/>
    </DiagramTip>
    {box(28,130,236,22,C.token,"[hₜ₋₁ , xₜ] — concat input","Previous hidden state + current input. All four gates receive this same vector but learn different weights.")}
    <line x1={54} y1={130} x2={54} y2={107} stroke={C.dim} strokeWidth={1} markerEnd="url(#ah)"/>
    <line x1={134} y1={130} x2={134} y2={107} stroke={C.dim} strokeWidth={1} markerEnd="url(#ah)"/>
    <line x1={186} y1={130} x2={186} y2={110} stroke={C.dim} strokeWidth={1} markerEnd="url(#ah)"/>
    <line x1={272} y1={130} x2={272} y2={107} stroke={C.dim} strokeWidth={1} markerEnd="url(#ah)"/>
    {lbl(54,124,"f",FSV,C.novel)}{lbl(134,124,"i",FSV,C.novel)}{lbl(186,124,"c̃",FSV,C.novel)}{lbl(272,124,"o",FSV,C.novel)}
    {box(112,168,96,22,C.gate,"hₜ — output","Working memory passed to next step and higher layers.")}
    {arr(272,69,272,28)}
    <line x1={272} y1={58} x2={304} y2={58} stroke={C.dim} strokeWidth={1}/>
    <line x1={304} y1={58} x2={304} y2={179} stroke={C.dim} strokeWidth={1}/>
    <line x1={304} y1={179} x2={210} y2={179} stroke={C.dim} strokeWidth={1} markerEnd="url(#ah)"/>
    {lbl(160,198,"Gated memory with additive updates: gradients flow through hundreds of steps",FS,C.novel,280)}</svg>);
}
