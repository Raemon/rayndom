import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, vb, ss } from './helpers';

export function CotDiagram({ onTip }) {
  const { t, box } = getDiagramHelpers(onTip);
  return (<svg viewBox={vb} style={ss} xmlns="http://www.w3.org/2000/svg">{defs}{lbl(105,10,"Chain-of-Thought Prompting")}{box(10,24,190,16,C.token,"Q: Roger has 5 balls. Buys 2 cans of 3. How many?","Without CoT, model jumps to answer and often fails on multi-step problems.",6.5)}{arr(105,40,105,48)}{box(20,50,170,14,C.novel,"Step 1: Started with 5 balls.","THE INNOVATION: Generate intermediate steps. Each step = more compute allocated to the problem.",6.5)}{arr(105,64,105,70)}{box(20,72,170,14,C.novel,"Step 2: 2 cans × 3 = 6 new balls.","Each step conditions on previous steps. Complex reasoning = chain of simple steps.",6.5)}{arr(105,86,105,92)}{box(20,94,170,14,C.novel,"Step 3: 5 + 6 = 11.","Model 'thinks out loud.' Without CoT: 18% on GSM8K. With CoT: 57%. Same model.",6.5)}{arr(105,108,105,114)}{box(60,116,90,12,C.ffn,"Answer: 11","Correct. Achieved by changing the PROMPT, not the model weights.",6.5)}</svg>);
}
