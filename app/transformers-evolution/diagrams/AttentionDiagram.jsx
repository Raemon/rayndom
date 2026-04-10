import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, vb, ss } from './helpers';

export function AttentionDiagram() {
  const { box } = getDiagramHelpers();
  return (<svg viewBox={vb} style={ss} xmlns="http://www.w3.org/2000/svg">{defs}{lbl(105,10,"Seq2Seq + Attention")}{lbl(105,20,"Encoder Hidden States",6)}{box(10,24,40,18,C.token,"h₁","Encoder state for position 1. Captures input context up to that position.")}{box(55,24,40,18,C.token,"h₂","Encoder state 2.")}{box(100,24,40,18,C.token,"h₃","Encoder state 3.")}{box(145,24,40,18,C.token,"h₄","Encoder state 4.")}{box(45,54,120,20,C.novel,"Attention Weights α","THE KEY INNOVATION: Learned alignment scores how relevant each encoder state is to the current decoder step. Softmax-normalized into weights α₁...αₙ. Replaces the fixed bottleneck vector.")}{arr(50,42,70,54)}{arr(100,42,105,54)}{arr(160,42,140,54)}{box(65,84,80,18,C.novel,"Context Vector c","Weighted sum: c = Σ αᵢhᵢ. Each decoding step gets its own context — the decoder 'looks back' at different parts for each output.")}{arr(105,74,105,84)}{box(65,110,80,18,C.gate,"Decoder sₜ","Decoder RNN state receives context + previous output to generate the next token.")}{arr(105,102,105,110)}</svg>);
}
