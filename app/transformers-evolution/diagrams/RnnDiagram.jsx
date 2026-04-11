import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss, DiagramTip, op, ghostBox, FS, FSV } from './helpers';

export function RnnDiagram() {
  const { box } = getDiagramHelpers();
  return (<svg viewBox="0 0 240 140" className={`${ss} min-w-[180px]`} xmlns="http://www.w3.org/2000/svg">{defs}
    {lbl(45,14,"t−1",FSV,"#666")}{lbl(120,14,"t",FSV,"#666")}{lbl(195,14,"t+1",FSV,"#666")}
    {ghostBox(85,44,70,18,"feedforward","GHOST: A feedforward net processes each input independently — no memory. The RNN adds the recurrent connection.",FSV)}
    {box(20,30,50,24,C.gate,"hₜ₋₁","Hidden state at previous timestep. Carries memory of all prior inputs (in theory).")}
    {box(95,66,50,22,C.novel,"W·[ , ]","Learned weight matrix applied to concat of hₜ₋₁ and xₜ.")}
    {op(120,40,"tanh","THE KEY: tanh squashes the weighted sum to [-1,1]. hₜ = tanh(W·[hₜ₋₁, xₜ]). This recurrence gives the network memory.",{r:12,color:C.novel})}
    {arr(70,42,108,42)}{lbl(88,38,"hₜ₋₁",FSV,C.novel)}
    {arr(120,52,120,66)}{arr(120,88,120,96)}
    {arr(132,42,170,42)}{lbl(155,38,"hₜ",FSV,C.novel)}
    {box(170,30,50,24,C.gate,"hₜ₊₁","Next state. Same weights W at every step (weight sharing).")}
    {box(95,98,50,22,C.token,"xₜ","Input at current timestep.")}
    {lbl(108,96,"xₜ",FSV)}
    {box(95,18,50,14,C.ffn,"yₜ","Output at timestep t.")}
    {arr(120,40,120,32)}
    <DiagramTip detail="Recurrent connection: previous hidden state feeds into current computation. When unrolled, this creates a deep chain — but gradients vanish exponentially, limiting memory to ~10–20 steps.">
      <path d="M170,26 L160,10 L148,10" fill="none" stroke={C.novel} strokeWidth={1} strokeDasharray="3,2" markerEnd="url(#ah)"/>
      {lbl(176,16,"recur",FSV,C.novel)}
    </DiagramTip>
    {lbl(120,132,"Recurrence gives memory, but gradients vanish after ~10–20 steps",FS,C.novel)}</svg>);
}
