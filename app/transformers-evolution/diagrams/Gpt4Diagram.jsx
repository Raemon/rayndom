import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, vb, ss, DiagramTip } from './helpers';

export function Gpt4Diagram() {
  const { box } = getDiagramHelpers();
  return (<svg viewBox={vb} style={ss} xmlns="http://www.w3.org/2000/svg">{defs}{lbl(105,10,"Multimodal Transformer")}
    <DiagramTip detail="Input image → processed by visual encoder. Pre-trained ViT or CLIP encodes patches into embeddings aligned with text space."><rect x={5} y={24} width={30} height={30} rx={2} fill="none" stroke={C.novel} strokeWidth={1}/><line x1={5} y1={34} x2={35} y2={34} stroke={C.novel} strokeWidth={0.4}/><line x1={5} y1={44} x2={35} y2={44} stroke={C.novel} strokeWidth={0.4}/><line x1={15} y1={24} x2={15} y2={54} stroke={C.novel} strokeWidth={0.4}/><line x1={25} y1={24} x2={25} y2={54} stroke={C.novel} strokeWidth={0.4}/>{lbl(20,62,"Image",6)}</DiagramTip>
    {arr(35,39,45,39)}{box(47,28,50,22,C.novel,"ViT Encoder","Vision model converts patches → embeddings. Pre-trained (e.g., CLIP) for vision-language alignment.",6.5)}{arr(97,39,107,39)}{box(109,30,35,18,C.novel,"Project","Linear proj maps visual embeddings into LM's token space.",6)}{arr(144,39,153,39)}
    {box(155,24,20,14,C.novel,"v₁","Visual token.",5.5)}{box(155,40,20,14,C.novel,"v₂","",5.5)}{box(177,24,20,14,C.token,"t₁","Text token.",5.5)}{box(177,40,20,14,C.token,"t₂","",5.5)}{lbl(176,62,"mixed",5.5)}{arr(176,64,105,74)}
    {box(30,76,150,22,C.attn,"Transformer Decoder","SAME decoder as text-only models. Visual and text tokens attend to each other. Cross-modal reasoning via standard self-attention.")}{arr(105,98,105,106)}{box(45,108,120,18,C.ffn,"Multimodal Output","Describe images, answer visual questions, reason about charts.",6.5)}</svg>);
}
