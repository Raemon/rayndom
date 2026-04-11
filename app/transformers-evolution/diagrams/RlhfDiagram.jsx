import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss, FS, FSV } from './helpers';

export function RlhfDiagram() {
  const { box } = getDiagramHelpers();
  const vbw = '0 0 275 168';
  return (<svg viewBox={vbw} className={`${ss} min-w-[200px]`} xmlns="http://www.w3.org/2000/svg">{defs}
    {box(8, 20, 62, 24, C.attn, 'Base LM', 'Pre-trained but not aligned — capable yet may be unsafe or unhelpful.', FS)}
    {arr(70, 32, 82, 32)}{lbl(76, 28, 'sample', FSV, '#666')}
    {box(84, 20, 78, 24, C.token, 'Rollouts', 'Generate several completions per prompt for ranking or RM training.', FS)}
    {arr(162, 32, 174, 32)}{lbl(168, 28, 'candidates', FSV, '#666')}
    {box(176, 20, 72, 24, C.novel, 'Human preferences', 'Pairwise labels which answer is better — cheaper than writing gold text.', FS)}
    {arr(212, 44, 212, 54)}{lbl(218, 49, 'ranked pairs', FSV, '#666')}
    {box(150, 56, 98, 24, C.novel, 'Reward model r_φ', 'Scores (prompt, response) to approximate human judgment.', FS)}
    {arr(212, 80, 212, 90)}{lbl(218, 85, 'scalar reward', FSV, '#666')}
    {box(142, 92, 114, 26, C.novel, 'PPO + KL to base', 'Policy gradient on LM; KL penalty keeps updates near the base model.', FS)}
    {arr(142, 105, 78, 105)}{lbl(110, 101, 'policy gradients', FSV, '#666')}
    {box(8, 92, 62, 24, C.ffn, 'Aligned LM', 'Helpful, safer responses; iterate with fresh human data.', FS)}
    <path d="M39,116 L39,72 L78,72 L78,44" fill="none" stroke={C.dim} strokeWidth={0.8} strokeDasharray="2,2" markerEnd="url(#ah)"/>
    {lbl(28, 92, 'reuse base', FSV, '#666')}
    {lbl(138, 158, 'Preference-labeled rollouts train a reward model; RL fine-tunes the LM toward higher reward without drifting too far.', FS, C.novel)}</svg>);
}
