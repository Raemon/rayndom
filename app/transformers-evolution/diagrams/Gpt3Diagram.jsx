import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, vb, ss } from './helpers';

export function Gpt3Diagram() {
  const { box } = getDiagramHelpers();
  return (<svg viewBox={vb} style={ss} xmlns="http://www.w3.org/2000/svg">{defs}{lbl(105,10,"GPT-3: In-Context Learning")}{box(10,22,190,14,C.novel,"Prompt: Instruction + Few-Shot Examples","THE INNOVATION: Put examples in the input. Model 'learns' the task from context — no gradient updates.",6.5)}{lbl(105,44,"Example prompt:",6,"#666")}{box(10,48,93,12,C.gate,"Q: 2+3? → A: 5","Few-shot example 1. Model recognizes the Q→A pattern.",6)}{box(107,48,93,12,C.gate,"Q: 7×4? → A: 28","Example 2. More examples = better, but even zero often works.",6)}{box(40,64,130,12,C.token,"Q: 12÷3? → A: ???","Actual query. Model continues the inferred pattern.",6.5)}{arr(105,76,105,82)}{box(30,84,150,22,C.attn,"175B Transformer, 96 Layers","Same decoder arch. In-context learning EMERGES at scale — doesn't work smaller. ~$4.6M to train.",7)}{arr(105,106,105,112)}{box(60,114,90,14,C.ffn,"Output: 4","Correct answer, zero training on arithmetic. Task inferred from context.",6.5)}</svg>);
}
