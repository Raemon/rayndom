import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, vb, ss } from './helpers';

export function Gpt1Diagram() {
  const { box } = getDiagramHelpers();
  return (<svg viewBox={vb} style={ss} xmlns="http://www.w3.org/2000/svg">{defs}{lbl(105,10,"GPT-1: Pre-train → Fine-tune")}{box(10,22,60,18,C.token,"Unlabeled Text","Massive corpus. No human labels needed — model learns by predicting the next word.")}{arr(70,31,80,31)}{box(80,20,80,22,C.attn,"Transformer Decoder ×12","Same attention + FFN blocks, but decoder-only: causal masking means each token only sees previous tokens. 117M params.",7)}{arr(120,42,120,56)}{box(45,58,120,18,C.novel,"Pre-train: Predict Next Token","THE INNOVATION: Simple next-token objective on billions of words teaches grammar, facts, reasoning. No task-specific labels.",6.5)}{arr(105,76,105,84)}{box(45,86,120,18,C.novel,"Fine-tune on Labeled Data","Add a task-specific head, train briefly on labeled examples. Pre-trained knowledge transfers — very few labels needed.",7)}{arr(105,104,105,112)}{box(55,114,100,14,C.ffn,"Task Output (QA, NLI, etc.)","Same base model, different heads. This paradigm became the template for all subsequent LLMs.",6.5)}</svg>);
}
