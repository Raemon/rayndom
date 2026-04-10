import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss, DiagramTip, op, ghostBox, FS, FSV } from './helpers';

export function LstmDiagram() {
  const { box } = getDiagramHelpers();
  return (<svg viewBox="0 0 260 165" style={{...ss,minWidth:220}} xmlns="http://www.w3.org/2000/svg">{defs}
    <DiagramTip detail="Cell state: a 'conveyor belt' of long-term memory. Updated by ADDITION (not multiplication), so gradients flow unchanged — solving vanishing gradients.">
      <line x1={10} y1={30} x2={250} y2={30} stroke={C.cellState} strokeWidth={3}/>
      {lbl(130,23,"cₜ  (cell state — long-term memory)",FS,C.cellState)}
    </DiagramTip>
    {ghostBox(90,60,80,24,"hₜ = tanh(W·[hₜ₋₁,xₜ])","GHOST: In a simple RNN, one tanh is the entire computation — no gates, no separate memory. The LSTM replaces this with gated control.",FSV)}
    {op(42,52,"×","FORGET GATE output: element-wise multiply cell state by σ(forget). 0 = erase, 1 = keep.",{r:11,color:C.novel})}
    <line x1={42} y1={41} x2={42} y2={30} stroke={C.novel} strokeWidth={1} markerEnd="url(#ah)"/>
    {op(130,52,"×","INPUT GATE output: element-wise multiply candidate by σ(input). Controls what NEW info gets written.",{r:11,color:C.novel})}
    {op(130,30,"+","Additive update: cₜ = forget×cₜ₋₁ + input×candidate. ADDITION preserves gradients (the key insight vs RNN).",{r:11,color:C.novel})}
    {op(218,52,"×","OUTPUT GATE: element-wise multiply tanh(cₜ) by σ(output). Selects which memory dims to expose as hₜ.",{r:11,color:C.novel})}
    {op(42,82,"σ","Forget gate: σ(Wf·[hₜ₋₁, xₜ] + bf). Outputs 0–1 per dimension.",{r:11,color:C.novel})}
    {op(108,82,"σ","Input gate: σ(Wi·[hₜ₋₁, xₜ] + bi).",{r:11,color:C.novel})}
    {op(155,82,"tanh","Candidate values: tanh(Wc·[hₜ₋₁, xₜ] + bc). New info to potentially store.",{r:14,color:C.novel})}
    {op(218,82,"σ","Output gate: σ(Wo·[hₜ₋₁, xₜ] + bo).",{r:11,color:C.novel})}
    <line x1={42} y1={71} x2={42} y2={63} stroke={C.dim} strokeWidth={1} markerEnd="url(#ah)"/>
    <line x1={108} y1={71} x2={130} y2={63} stroke={C.dim} strokeWidth={1} markerEnd="url(#ah)"/>
    <line x1={155} y1={71} x2={130} y2={63} stroke={C.dim} strokeWidth={1} markerEnd="url(#ah)"/>
    <line x1={218} y1={71} x2={218} y2={63} stroke={C.dim} strokeWidth={1} markerEnd="url(#ah)"/>
    <line x1={130} y1={41} x2={130} y2={30} stroke={C.dim} strokeWidth={1} markerEnd="url(#ah)"/>
    <DiagramTip detail="tanh squashes cell state to [-1,1] before the output gate filters it.">
      <circle cx={200} cy={30} r={6} fill="none" stroke={C.cellState} strokeWidth={0.8}/>
      <text x={200} y={33} textAnchor="middle" fill={C.cellState} fontSize={FSV} fontFamily="sans-serif">th</text>
      <line x1={206} y1={30} x2={218} y2={41} stroke={C.dim} strokeWidth={1} markerEnd="url(#ah)"/>
    </DiagramTip>
    {box(30,110,200,20,C.token,"[hₜ₋₁ , xₜ] — concat input","Previous hidden state + current input. All four gates receive this same vector but learn different weights.")}
    <line x1={42} y1={110} x2={42} y2={93} stroke={C.dim} strokeWidth={1} markerEnd="url(#ah)"/>
    <line x1={108} y1={110} x2={108} y2={93} stroke={C.dim} strokeWidth={1} markerEnd="url(#ah)"/>
    <line x1={155} y1={110} x2={155} y2={96} stroke={C.dim} strokeWidth={1} markerEnd="url(#ah)"/>
    <line x1={218} y1={110} x2={218} y2={93} stroke={C.dim} strokeWidth={1} markerEnd="url(#ah)"/>
    {lbl(42,105,"f",FSV,C.novel)}{lbl(108,105,"i",FSV,C.novel)}{lbl(155,105,"c̃",FSV,C.novel)}{lbl(218,105,"o",FSV,C.novel)}
    {box(80,138,100,20,C.gate,"hₜ — output","Working memory passed to next step and higher layers.")}
    {arr(218,63,218,30)}
    <line x1={218} y1={52} x2={245} y2={52} stroke={C.dim} strokeWidth={1}/>
    <line x1={245} y1={52} x2={245} y2={148} stroke={C.dim} strokeWidth={1}/>
    <line x1={245} y1={148} x2={182} y2={148} stroke={C.dim} strokeWidth={1} markerEnd="url(#ah)"/>
    {lbl(130,162,"Gated memory with additive updates: gradients flow through hundreds of steps",FS,C.novel)}</svg>);
}
