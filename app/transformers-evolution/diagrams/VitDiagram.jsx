import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss, DiagramTip } from './helpers';

export function VitDiagram() {
  const { box } = getDiagramHelpers();
  return (<svg viewBox="0 0 220 130" style={{...ss,minWidth:190}} xmlns="http://www.w3.org/2000/svg">{defs}{lbl(110,10,"Vision Transformer (ViT)")}
    <DiagramTip detail="Input image split into non-overlapping patches (e.g., 16×16 pixels). This replaces CNN convolutions — the Transformer processes patches as if they were word tokens."><rect x={5} y={20} width={40} height={40} rx={2} fill="none" stroke={C.novel} strokeWidth={1}/><line x1={5} y1={33} x2={45} y2={33} stroke={C.novel} strokeWidth={0.4} opacity={0.5}/><line x1={5} y1={46} x2={45} y2={46} stroke={C.novel} strokeWidth={0.4} opacity={0.5}/><line x1={18} y1={20} x2={18} y2={60} stroke={C.novel} strokeWidth={0.4} opacity={0.5}/><line x1={32} y1={20} x2={32} y2={60} stroke={C.novel} strokeWidth={0.4} opacity={0.5}/>{lbl(23,70,"Image→Patches",5.5,C.novel)}</DiagramTip>
    {arr(47,40,55,40)}{box(57,28,42,24,C.novel,"Linear Proj","Each patch flattened and projected into model embedding dim. The ONLY image-specific part.",6.5)}{arr(99,40,107,40)}
    {box(109,20,16,14,C.gate,"CLS","Learnable class token. Final repr → classification.",5.5)}{box(109,36,16,14,C.token,"P₁","Patch 1",5.5)}{box(109,52,16,14,C.token,"P₂","",5.5)}{box(109,68,16,14,C.token,"..","",5.5)}{lbl(117,90,"+Pos Enc",5.5)}{arr(130,46,138,46)}
    {box(140,26,70,42,C.attn,"Transformer Encoder","IDENTICAL to text Transformer. Patches attend to each other like words. Needs large-scale data to match CNNs.",6.5)}{arr(175,68,175,80)}{box(140,82,70,18,C.ffn,"Classify","MLP on [CLS] token output. Proved Transformers generalize beyond text.",6.5)}</svg>);
}
