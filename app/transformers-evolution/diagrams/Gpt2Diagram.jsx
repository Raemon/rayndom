import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, vb, ss } from './helpers';

export function Gpt2Diagram() {
  const { box } = getDiagramHelpers();
  return (<svg viewBox={vb} style={ss} xmlns="http://www.w3.org/2000/svg">{defs}{lbl(105,10,"GPT-2: Scale as a Variable")}{box(30,22,150,18,C.token,"Larger Dataset (WebText, 40GB)","Web-scraped dataset, much larger than GPT-1's BookCorpus. Data quality and diversity matter as much as model size.",6.5)}{arr(105,40,105,48)}{box(45,50,120,14,C.attn,"Transformer Decoder Block","Same architecture as GPT-1 but deeper. No new techniques — just scale the existing one.",6.5)}{box(48,66,120,14,C.attn,"Transformer Decoder Block","GPT-1: 12 layers. GPT-2: 48 layers, 1.5B params (13× increase).",6.5)}{box(51,82,120,14,C.attn,"...×48 layers, 1.5B params","Considered irresponsibly large at the time. OpenAI initially withheld the full model.",6.5)}{arr(105,96,105,104)}{box(30,106,150,22,C.novel,"Zero-Shot Task Performance","No fine-tuning needed. Model can summarize, translate, answer questions from pre-training alone. Scale itself created emergent capabilities.",6.5)}</svg>);
}
