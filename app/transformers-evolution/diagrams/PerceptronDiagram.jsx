import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, vb, ss, DiagramTip } from './helpers';

export function PerceptronDiagram() {
  const { box } = getDiagramHelpers();
  return (<svg viewBox={vb} style={ss} xmlns="http://www.w3.org/2000/svg">{defs}{lbl(105,10,"The Perceptron (1958)")}
    {box(10,25,35,16,C.token,"x₁","Input feature 1. Could be a pixel intensity, sensor reading, or any numeric input.",6.5)}
    {box(10,50,35,16,C.token,"x₂","Input feature 2. The perceptron sees all inputs simultaneously — no notion of sequence or time.",6.5)}
    {box(10,75,35,16,C.token,"x₃","Input feature 3. Mark I Perceptron had 400 photocells as inputs.",6.5)}
    <DiagramTip detail="Learned weights: each connection has a trainable weight. If output is wrong, weights are nudged: w ← w + η(target − output)·x. This is the FIRST learning rule for a neural network.">{arr(45,33,80,48)}{arr(45,58,80,53)}{arr(45,83,80,58)}{lbl(63,38,"w₁",6,C.novel)}{lbl(63,62,"w₂",6,C.novel)}{lbl(63,80,"w₃",6,C.novel)}</DiagramTip>
    {box(80,40,50,26,C.novel,"Σ → threshold","THE KEY INNOVATION: Sum weighted inputs, apply threshold. If Σwᵢxᵢ > θ, output 1. Else 0. Weights are LEARNED from examples.",6.5)}
    {arr(130,53,145,53)}
    {box(145,44,50,18,C.ffn,"Output (0/1)","Binary classification. Can learn AND, OR, NOT — but NOT XOR. This limit killed funding for a decade.",6.5)}
    {lbl(105,105,"Limit: only linearly separable problems",6.5,C.novel)}
    {lbl(105,118,"(no hidden layers → no XOR)",6.5,"#666")}</svg>);
}
