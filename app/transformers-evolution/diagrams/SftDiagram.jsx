import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss, FS, FSV } from './helpers';

export function SftDiagram() {
  const { box } = getDiagramHelpers();
  const vbw = '0 0 260 156';
  return (<svg viewBox={vbw} style={{...ss,minWidth:200}} xmlns="http://www.w3.org/2000/svg">{defs}
    {box(8, 22, 78, 26, C.attn, 'Pre-trained LM', 'Next-token objective only — fluent continuation but no notion of “follow this instruction”.', FS)}
    {arr(86, 35, 96, 35)}{lbl(91, 31, 'base params θ', FSV, '#666')}
    {box(98, 16, 154, 38, C.novel, 'Instruction ↔ response data', 'Many (prompt, ideal answer) pairs teach format and task coverage — diversity matters more than sheer size.', FS)}
    {arr(175, 54, 175, 64)}{lbl(182, 59, '(x, y) batches', FSV, '#666')}
    {box(98, 66, 154, 26, C.novel, 'Supervised fine-tune', 'Minimize cross-entropy on assistant tokens; cheap vs. pre-training.', FS)}
    {arr(175, 92, 175, 102)}{lbl(182, 97, '∇θ CE loss', FSV, '#666')}
    {box(48, 104, 164, 26, C.ffn, 'Instruction-tuned LM', 'Follows prompts, roles, and formats; usual bridge before preference optimization (RLHF / DPO).', FS)}
    {lbl(130, 142, 'Short supervised fine-tuning on diverse instructions aligns a base LM to user intent before reward-based polish.', FS, C.novel)}</svg>);
}
