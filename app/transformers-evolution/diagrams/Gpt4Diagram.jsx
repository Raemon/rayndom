import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss, DiagramTip, FS, FSV } from './helpers';

export function Gpt4Diagram() {
  const { box } = getDiagramHelpers();
  const vb2 = '0 0 268 156';
  return (<svg viewBox={vb2} style={ss} xmlns="http://www.w3.org/2000/svg">{defs}
<DiagramTip detail="Raw image → fixed grid of patches. ViT/CLIP-style encoder maps each patch to a vector; sequence length grows with patch count.">
<rect x={6} y={18} width={28} height={28} fill="none" stroke={C.novel} strokeWidth={0.9}/>
<line x1={6} y1={28} x2={34} y2={28} stroke={C.novel} strokeWidth={0.35}/>
<line x1={6} y1={38} x2={34} y2={38} stroke={C.novel} strokeWidth={0.35}/>
<line x1={16} y1={18} x2={16} y2={46} stroke={C.novel} strokeWidth={0.35}/>
<line x1={24} y1={18} x2={24} y2={46} stroke={C.novel} strokeWidth={0.35}/>
{lbl(20,54,'patches',FS,C.dim)}
</DiagramTip>
{arr(34,32,44,32)}{lbl(50,29,'pixels',FSV,C.dim)}
{box(46,20,52,24,C.novel,'ViT encoder','Splits image into patches; stacked transformer blocks output one embedding per patch.',FS)}
{arr(98,32,108,32)}{lbl(114,29,'patch emb\n(high d)',FSV,C.dim)}
{box(110,22,38,20,C.novel,'Project W','Linear map aligns visual feature dim with language model d_model.',FS)}
{arr(148,32,158,32)}{lbl(164,29,'d_model',FSV,C.dim)}
<rect x={160} y={20} width={10} height={8} fill={C.novel} opacity={0.35}/>
<rect x={172} y={20} width={10} height={8} fill={C.novel} opacity={0.35}/>
{lbl(181,27,'…',FSV,C.dim)}
<rect x={186} y={20} width={22} height={8} fill={C.token} opacity={0.35}/>
<rect x={210} y={20} width={22} height={8} fill={C.token} opacity={0.35}/>
{lbl(166,38,'narrow P×d',FSV,C.dim)}{lbl(218,38,'text rows',FSV,C.dim)}
{box(158,44,24,14,C.novel,'v₁','Visual token embedding in LM space.',FSV)}
{box(184,44,24,14,C.novel,'v₂','',FSV)}
{box(210,44,24,14,C.token,'t₁','Text token embedding.',FSV)}
{box(236,44,22,14,C.token,'t₂','',FSV)}
{lbl(200,62,'interleaved sequence',FS,'#666')}
{arr(200,64,134,78)}{lbl(168,72,'concat / order',FSV,C.dim)}
{box(40,82,228,22,C.attn,'Transformer decoder','Same self-attention over mixed modalities: vision and text tokens attend to each other in one sequence.',FS)}
{arr(154,104,154,110)}{lbl(166,107,'hidden → LM head',FSV,C.dim)}
{box(52,112,204,20,C.ffn,'Multimodal output','Captions, VQA, chart reading — one forward pass over fused tokens.',FS)}
{lbl(134,148,'VISION AS EXTRA TOKENS IN ONE DECODER — DIMENSIONS ALIGNED BY PROJECTION',FSV,'#444')}
</svg>);
}
