import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss, FS, FSV } from './helpers';

export function Gpt3Diagram() {
  const { box } = getDiagramHelpers();
  const vb2 = '0 0 260 164';
  return (<svg viewBox={vb2} className={`${ss} min-w-[180px]`} xmlns="http://www.w3.org/2000/svg">{defs}
{box(10,8,240,22,C.novel,'Prompt = instruction +\nfew-shot examples + query','Weights never update on the new task: format and skill are read from the context window.',FS)}
{lbl(130,40,'demonstrations → query (one concatenated context)',FS,'#666')}
{box(12,44,112,20,C.gate,'Ex.1: Q: 2+3? → A: 5','Shot 1: model should infer Q→A pattern.',FS)}
{box(136,44,112,20,C.gate,'Ex.2: Q: 7×4? → A: 28','More shots usually improve reliability.',FS)}
{arr(68,64,68,72)}{lbl(78,68,'tokens →',FSV,C.dim)}
{arr(192,64,192,72)}{lbl(202,68,'tokens →',FSV,C.dim)}
{box(38,74,184,20,C.token,'Query: Q: 12÷3? → A: ???','Model continues distribution over next tokens as if it learned arithmetic from examples only.',FS)}
{arr(130,94,130,102)}{lbl(188,99,'context → transformer',FSV,C.dim)}
{box(28,104,204,24,C.attn,'175B autoregressive decoder\n(~96 layers)','Same architectural family as GPT-2; strong few-shot behavior appears mainly at very large scale.',FS)}
{arr(130,128,130,136)}{lbl(188,133,'next-token logits',FSV,C.dim)}
{box(82,138,96,20,C.ffn,'Output: 4','Predicted answer token without task-specific training.',FS)}
{lbl(130,158,'IN-CONTEXT LEARNING: TASK FROM PROMPT — NO GRADIENT STEPS ON NEW TASK',FSV,'#444')}
</svg>);
}
