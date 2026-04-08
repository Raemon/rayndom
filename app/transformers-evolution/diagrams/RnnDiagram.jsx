import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, vb, ss } from './helpers';

export function RnnDiagram({ onTip }) {
  const { t, box } = getDiagramHelpers(onTip);
  return (<svg viewBox={vb} style={ss} xmlns="http://www.w3.org/2000/svg">{defs}{lbl(105,10,"Simple Recurrent Network (Elman, 1990)")}
    {lbl(40,26,"t−1",6,"#666")}{lbl(105,26,"t",6,"#666")}{lbl(170,26,"t+1",6,"#666")}
    {box(18,60,44,20,C.gate,"hₜ₋₁","Hidden state at previous timestep. Carries memory of all prior inputs (in theory).",6.5)}
    {box(83,60,44,20,C.novel,"hₜ","THE KEY INNOVATION: hidden state combines current input with previous state. hₜ = tanh(W·[hₜ₋₁, xₜ]). This recurrence gives the network memory.",6.5)}
    {box(148,60,44,20,C.gate,"hₜ₊₁","Next state. Same weights applied at every step (weight sharing).",6.5)}
    {arr(62,70,81,70)}{arr(127,70,146,70)}
    {box(83,95,44,18,C.token,"xₜ","Input at current timestep. Could be a character, word, or signal sample.",6.5)}{arr(105,95,105,82)}
    {box(83,34,44,16,C.ffn,"yₜ","Output at timestep t.",6.5)}{arr(105,60,105,52)}
    <g {...t("Recurrent connection: previous hidden state feeds into current computation. When unrolled across time, this creates a deep chain — but gradients vanish exponentially, limiting memory to ~10–20 steps. This is the problem LSTMs will solve.")}><path d="M148,55 L140,40 L130,40" fill="none" stroke={C.novel} strokeWidth={1} strokeDasharray="3,2" markerEnd="url(#ah)"/>{lbl(155,42,"recur",5.5,C.novel)}</g>
    {lbl(105,122,"Problem: gradients vanish after ~10–20 steps",6.5,C.novel)}</svg>);
}
