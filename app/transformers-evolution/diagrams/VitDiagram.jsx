import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss, DiagramTip, ghostBox, op, FS, FSV } from './helpers';

export function VitDiagram() {
  const { box } = getDiagramHelpers();
  const vbw = '0 0 270 168';
  return (<svg viewBox={vbw} className={`${ss} min-w-[200px]`} xmlns="http://www.w3.org/2000/svg">{defs}
    {ghostBox(8, 20, 46, 32, 'CNN stem', 'Convolutional front-end with local receptive fields — ViT swaps this for patch tokens at scale.', FSV)}
    <DiagramTip detail="Input image split into non-overlapping patches (e.g., 16×16 pixels). Patches replace convolutions — the Transformer treats them like word tokens."><rect x={60} y={18} width={40} height={40} rx={2} fill="none" stroke={C.novel} strokeWidth={1}/><line x1={60} y1={32} x2={100} y2={32} stroke={C.novel} strokeWidth={0.4} opacity={0.5}/><line x1={60} y1={45} x2={100} y2={45} stroke={C.novel} strokeWidth={0.4} opacity={0.5}/><line x1={73} y1={18} x2={73} y2={58} stroke={C.novel} strokeWidth={0.4} opacity={0.5}/><line x1={87} y1={18} x2={87} y2={58} stroke={C.novel} strokeWidth={0.4} opacity={0.5}/>{lbl(80, 64, 'patch grid', FS, C.novel)}</DiagramTip>
    {arr(102, 38, 110, 38)}{lbl(106, 34, 'unfold', FS, '#666')}
    <rect x={114} y={28} width={8} height={3} fill={C.token} opacity={0.85}/><rect x={114} y={33} width={8} height={3} fill={C.token} opacity={0.85}/><rect x={114} y={38} width={8} height={3} fill={C.token} opacity={0.85}/><rect x={114} y={43} width={8} height={3} fill={C.token} opacity={0.85}/>
    {lbl(118, 52, 'N·P²·C', FSV, '#666')}
    {arr(126, 38, 134, 38)}{lbl(130, 34, 'rows', FSV, '#666')}
    {box(136, 22, 52, 32, C.novel, 'Linear\nprojection', 'Each patch flattened then projected to embedding dim d — the only image-specific layer.', FS)}
    {lbl(162, 18, '→ d_model', FSV, '#666')}
    {arr(190, 38, 198, 38)}{lbl(194, 34, 'patch embeds', FS, '#666')}
    {box(200, 14, 24, 14, C.gate, 'CLS', 'Learnable class token; its final state drives classification.', FS)}
    {box(200, 30, 24, 18, C.token, 'patches', 'One vector per patch after projection.', FS)}
    {lbl(212, 54, 'z_i', FSV, '#666')}
    {arr(226, 36, 232, 36)}{lbl(230, 32, 'stack', FSV, '#666')}
    {op(242, 36, '+', 'Add absolute position encodings to CLS and every patch embedding.', { r: 10, color: C.dim, fill: 'none' })}
    {arr(242, 46, 242, 64)}{lbl(248, 56, 'E', FSV, '#666')}
    {box(18, 64, 234, 34, C.attn, 'Transformer encoder', 'Same self-attention + FFN blocks as in NLP; patches attend across the whole image.', FS)}
    {arr(135, 98, 135, 106)}{lbl(142, 102, 'contextualized', FS, '#666')}
    {box(78, 108, 114, 22, C.ffn, 'Classifier on CLS', 'MLP on the final CLS vector — generalizes Transformers beyond language.', FS)}
    {lbl(135, 160, 'Images become patch token sequences; one linear map to d_model, then a standard Transformer and CLS head.', FS, C.novel)}</svg>);
}
