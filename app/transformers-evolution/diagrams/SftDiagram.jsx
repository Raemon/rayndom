import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss } from './helpers';

export function SftDiagram() {
  const { box } = getDiagramHelpers();
  return (<svg viewBox="0 0 220 130" style={{...ss,minWidth:190}} xmlns="http://www.w3.org/2000/svg">{defs}{lbl(110,10,"Instruction Tuning (SFT)")}
    {box(5,24,65,20,C.attn,"Pre-trained LM","Predicts next token. Fluent but treats everything as text continuation — ignores instructions.",6.5)}
    {arr(70,34,80,34)}
    {box(82,20,130,28,C.novel,"Diverse (Instruction, Response) Pairs","Thousands of tasks: 'Summarize this' → summary, 'Translate to French' → translation, 'Write code for...' → code. Diversity is key — trains the model to recognize instruction FORMAT.",6)}
    {arr(150,48,150,58)}
    {box(82,60,130,18,C.novel,"Fine-tune (Cross-Entropy)","Standard supervised loss on ideal responses. Much cheaper than pre-training — hours not months.",6.5)}
    {arr(150,78,150,86)}
    {box(50,88,120,18,C.ffn,"Instruction-Following LM","Answers questions, follows formatting requests, generalizes to unseen instruction types.",6.5)}
    {lbl(110,118,"Essential first step before RLHF",6.5,C.novel)}
    {lbl(110,128,"FLAN (2021) → InstructGPT SFT → Alpaca → all chat models",6,"#666")}</svg>);
}
