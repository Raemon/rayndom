import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss, ghostBox, FS, FSV } from './helpers';

export function Gpt2Diagram() {
  const { box } = getDiagramHelpers();
  const vb2 = '0 0 260 158';
  return (<svg viewBox={vb2} style={ss} xmlns="http://www.w3.org/2000/svg">{defs}
{ghostBox(8,14,78,17,'Decoder layer','Single GPT-1-style decoder block: masked self-attention + FFN.',FSV)}
{ghostBox(11,35,72,17,'Decoder layer','',FSV)}
{ghostBox(14,56,66,17,'Decoder layer','',FSV)}
{ghostBox(17,77,60,19,'×12 layers · 117M','GPT-1 order-of-magnitude: dozen layers, ~117M parameters — same recipe, smaller scale.',FSV)}
{lbl(47,108,'GPT-1 (ghost)',FSV,C.dim)}
{box(100,14,152,20,C.token,'Larger corpus\n(WebText ~40GB)','Web-scraped text, far larger and more diverse than GPT-1 BookCorpus.',FS)}
{arr(176,34,176,42)}{lbl(196,39,'BPE token IDs',FSV,C.dim)}
{box(104,44,144,18,C.attn,'Transformer decoder block','Identical block family as GPT-1: causal self-attention then FFN.',FS)}
{box(107,66,138,18,C.attn,'Transformer decoder block','',FS)}
{box(110,86,132,20,C.attn,'… × 48 layers · 1.5B','GPT-2 largest: 48 layers, ~1.5B params — ~13× GPT-1 (medium). Withheld full weights initially.',FS)}
{arr(176,106,176,114)}{lbl(196,111,'LM hidden states',FSV,C.dim)}
{box(58,118,144,22,C.novel,'Zero-shot task performance','No fine-tuning: one pretrained model for summarization, translation, QA, etc. Capabilities emerge from scale.',FS)}
{lbl(130,150,'SAME DECODER FAMILY — SCALE DATA AND DEPTH — ZERO-SHOT WITHOUT NEW LOSSES',FSV,'#444')}
</svg>);
}
