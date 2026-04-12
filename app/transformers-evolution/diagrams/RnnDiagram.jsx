import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss, DiagramTip, op, ghostBox, FS, FSV } from './helpers';

export function RnnDiagram() {
  const { box } = getDiagramHelpers();
  return (<svg viewBox="0 0 300 168" className={`${ss} min-w-[220px]`} xmlns="http://www.w3.org/2000/svg">{defs}
    {lbl(45,14,"t−1",FSV,"#666")}{lbl(150,14,"t",FSV,"#666")}{lbl(268,14,"t+1",FSV,"#666")}
    {ghostBox(102,60,96,18,"feedforward","GHOST: A feedforward net processes each input independently — no memory. The RNN adds the recurrent connection.",FSV)}
    {box(12,34,56,24,C.gate,"hₜ₋₁","Hidden state at previous timestep. Carries memory of all prior inputs (in theory).")}
    {box(118,86,64,24,C.novel,"W·[ , ]","Learned weight matrix applied to concat of hₜ₋₁ and xₜ.")}
    {op(150,46,"tanh","THE KEY: tanh squashes the weighted sum to [-1,1]. hₜ = tanh(W·[hₜ₋₁, xₜ]). This recurrence gives the network memory.",{r:13,color:C.novel})}
    {arr(68,46,137,46)}{lbl(100,40,"hₜ₋₁",FSV,C.novel)}
    {arr(150,59,150,86)}{arr(150,110,150,120)}
    {arr(163,46,232,46)}{lbl(199,40,"hₜ",FSV,C.novel)}
    {box(232,34,56,24,C.gate,"hₜ₊₁","Next state. Same weights W at every step (weight sharing).")}
    {box(118,122,64,24,C.token,"xₜ","Input at current timestep.")}
    {lbl(150,118,"xₜ",FSV)}
    {box(122,18,56,16,C.ffn,"yₜ","Output at timestep t.")}
    {arr(150,33,150,22)}
    <DiagramTip detail="Recurrent connection: previous hidden state feeds into current computation. When unrolled, this creates a deep chain — but gradients vanish exponentially, limiting memory to ~10–20 steps.">
      <path d="M232,30 L218,10 L192,10" fill="none" stroke={C.novel} strokeWidth={1} strokeDasharray="3,2" markerEnd="url(#ah)"/>
      {lbl(238,22,"recur",FSV,C.novel)}
    </DiagramTip>
    {lbl(150,160,"Recurrence gives memory, but gradients vanish after ~10–20 steps",FS,C.novel,230)}</svg>);
}
