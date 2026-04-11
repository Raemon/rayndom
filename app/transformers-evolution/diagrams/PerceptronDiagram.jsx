import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss, DiagramTip, op, FS, FSV } from './helpers';

export function PerceptronDiagram() {
  const { box } = getDiagramHelpers();
  return (<svg viewBox="0 0 240 130" className={`${ss} min-w-[180px]`} xmlns="http://www.w3.org/2000/svg">{defs}
    {box(10,20,45,22,C.token,"x₁","Input feature 1. Could be a pixel intensity, sensor reading, or any numeric input.")}
    {box(10,50,45,22,C.token,"x₂","Input feature 2. The perceptron sees all inputs simultaneously — no notion of sequence or time.")}
    {box(10,80,45,22,C.token,"x₃","Input feature 3. Mark I Perceptron had 400 photocells as inputs.")}
    <DiagramTip detail="Learned weights: each connection has a trainable weight. If output is wrong, weights are nudged: w ← w + η(target − output)·x. This is the FIRST learning rule for a neural network.">
      {arr(55,31,90,51)}{arr(55,61,90,56)}{arr(55,91,90,61)}
      {lbl(72,36,"w₁",FSV,C.novel)}{lbl(72,68,"w₂",FSV,C.novel)}{lbl(72,88,"w₃",FSV,C.novel)}
    </DiagramTip>
    {op(105,56,"Σ","Sum weighted inputs: Σwᵢxᵢ. Produces a single scalar — the weighted evidence.",{r:12,color:C.novel})}
    {arr(117,56,133,56)}
    {op(148,56,"θ","THE KEY INNOVATION: Threshold function. If Σwᵢxᵢ > θ → output 1, else 0. Weights are LEARNED from examples.",{r:12,color:C.novel})}
    {arr(160,56,175,56)}
    {box(175,44,55,24,C.ffn,"Output (0/1)","Binary classification. Can learn AND, OR, NOT — but NOT XOR.")}
    {lbl(120,120,"Trainable weights + threshold: the first learned classifier",FS,C.novel)}</svg>);
}
