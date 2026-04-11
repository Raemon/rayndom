import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss, ghostBox, op, FS, FSV } from './helpers';

export function MoeDiagram() {
  const { box } = getDiagramHelpers();
  const vb2 = '0 0 260 162';
  return (<svg viewBox={vb2} className={`${ss} min-w-[180px]`} xmlns="http://www.w3.org/2000/svg">{defs}
{ghostBox(6,24,50,70,'Dense FFN','Predecessor: one shared MLP; every token uses the same weights — full compute per token.',FSV)}
{lbl(31,98,'(replaced)',FSV,C.dim)}
{box(72,12,176,18,C.token,'Token embedding xₜ','Per-token hidden vector entering the MoE layer.',FS)}
{arr(160,30,160,38)}{lbl(172,35,'hₜ',FSV,C.dim)}
{box(70,40,180,20,C.novel,'Router / gate','Learned scores over experts; top-k indices + softmax weights (typical k=2).',FS)}
{arr(118,60,42,74)}{lbl(72,65,'top-2 route',FSV,C.novel)}
{arr(160,60,160,74)}{lbl(172,65,'router logits',FSV,C.dim)}
{arr(202,60,222,74)}{lbl(218,65,'top-2 route',FSV,C.novel)}
{box(10,76,54,22,C.ffn,'Expert 1','Sparse FFN; runs only when selected for this token.',FS)}
{box(103,76,54,22,C.ffn,'Expert 2','',FS)}
{box(196,76,54,22,C.ffn,'Expert N','Many experts total; only k active.',FS)}
{op(37,108,'×','Scalar multiply router weight w₁ with expert output y₁.',{r:8,color:C.dim,fill:'none'})}
{op(130,108,'×','w₂ · y₂',{r:8,color:C.dim,fill:'none'})}
{op(223,108,'×','wₖ · yₖ',{r:8,color:C.dim,fill:'none'})}
{arr(37,98,37,100)}{arr(130,98,130,100)}{arr(223,98,223,100)}
{arr(37,116,152,126)}{arr(130,116,160,124)}{arr(223,116,168,126)}
{op(160,132,'+','Sum of top-k weighted expert outputs = layer output.',{r:9,color:C.dim,fill:'none'})}
{lbl(200,134,'Σ wᵢyᵢ',FSV,C.dim)}
{lbl(130,156,'SPARSE EXPERTS PER TOKEN — LARGE PARAM POOL, SMALL ACTIVE SET PER STEP',FSV,'#444')}
</svg>);
}
