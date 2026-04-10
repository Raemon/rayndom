import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss } from './helpers';

export function RlhfDiagram() {
  const { box } = getDiagramHelpers();
  return (<svg viewBox="0 0 220 130" style={{...ss,minWidth:190}} xmlns="http://www.w3.org/2000/svg">{defs}{lbl(110,10,"RLHF Pipeline")}{box(5,22,50,20,C.attn,"Base LM","Pre-trained but not aligned. Fluent but may be unhelpful, harmful, or dishonest.")}{arr(55,32,65,32)}{box(67,22,50,20,C.token,"Generate Responses","Multiple candidates per prompt. These become reward model training data.",6.5)}{arr(117,32,127,32)}{box(129,22,45,20,C.novel,"Human Prefs","Humans compare response pairs. Easier than writing ideal responses. Thousands of comparisons.",6)}{arr(151,42,151,52)}{box(109,54,85,20,C.novel,"Reward Model","Neural net trained on preferences. Predicts scalar score ≈ human judgment. Automates the signal.",6.5)}{arr(151,74,151,82)}{box(109,84,85,20,C.novel,"PPO + KL Penalty","RL fine-tunes LM to maximize reward, with KL constraint preventing divergence from base model (avoids 'reward hacking').",6.5)}{arr(109,94,60,94)}{box(5,84,53,20,C.ffn,"Aligned LM","More helpful, harmless, honest. Powers ChatGPT, Claude. Can iterate with fresh feedback.",6.5)}<path d="M28,84 L28,50 L60,50 L60,32" fill="none" stroke={C.dim} strokeWidth={0.8} strokeDasharray="2,2" markerEnd="url(#ah)"/>{lbl(20,66,"iterate",5.5)}</svg>);
}
