import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss, ghostBox, FS, FSV } from './helpers';

export function Gpt1Diagram() {
  const { box } = getDiagramHelpers();
  const vbw = '0 0 260 198';
  return (<svg viewBox={vbw} className={`${ss} min-w-[180px]`} xmlns="http://www.w3.org/2000/svg">{defs}
    {ghostBox(12, 6, 236, 24, 'Before: random init → lots of labels → task-only training', 'Pre-GPT baseline: no unsupervised pre-training; hard to generalize from small labeled sets.', FSV)}
    {box(20, 38, 220, 22, C.token, 'Unlabeled text corpus', 'Massive corpus. No human labels needed — model learns by predicting the next word.', FS)}
    {arr(130, 60, 130, 68)}
    {lbl(155, 64, 'token stream', FSV, '#666')}
    {box(18, 68, 224, 26, C.attn, 'Causal Transformer decoder ×12', 'Same attention + FFN blocks, but decoder-only: causal masking means each token only sees previous tokens. 117M params.', FS)}
    {arr(130, 94, 130, 102)}
    {lbl(155, 98, 'hidden states', FSV, '#666')}
    {box(22, 102, 216, 24, C.novel, 'Pre-train: predict next token', 'THE INNOVATION: Simple next-token objective on billions of words teaches grammar, facts, reasoning. No task-specific labels.', FS)}
    {arr(130, 126, 130, 134)}
    {lbl(155, 130, 'LM logits → loss', FSV, '#666')}
    {box(22, 134, 216, 24, C.novel, 'Fine-tune on labeled data', 'Add a task-specific head, train briefly on labeled examples. Pre-trained knowledge transfers — very few labels needed.', FS)}
    {arr(130, 158, 130, 166)}
    {lbl(155, 162, 'task gradients', FSV, '#666')}
    {box(40, 166, 180, 22, C.ffn, 'Task outputs (QA, NLI, …)', 'Same base model, different heads. This paradigm became the template for all subsequent LLMs.', FS)}
    {lbl(130, 194, 'Unsupervised next-token pre-training, then brief supervised fine-tuning, beats training from scratch on labels alone.', FS, C.novel)}</svg>);
}
