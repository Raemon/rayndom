import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss, DiagramTip, op, FS, FSV } from './helpers';

export function ResnetDiagram() {
  const { box } = getDiagramHelpers();
  const vbw = '0 0 260 174';
  return (<svg viewBox={vbw} style={ss} xmlns="http://www.w3.org/2000/svg">{defs}
    {box(35, 22, 60, 20, C.token, 'Input', 'Activation from previous layer.', FS)}
    {lbl(102, 32, 'x', FSV, C.token)}
    {arr(65, 42, 65, 48)}
    {lbl(52, 44, 'x', FSV, '#666')}
    {box(35, 48, 60, 22, C.ffn, 'Conv + ReLU', 'Weight layer 1. Learns features.', FS)}
    {arr(65, 70, 65, 76)}
    {lbl(52, 72, 'F path', FSV, '#666')}
    {box(35, 76, 60, 22, C.ffn, 'Conv', 'Weight layer 2. Together these learn the residual F(x).', FS)}
    {arr(65, 98, 65, 92)}
    {lbl(52, 94, 'F(x)', FSV, '#666')}
    <DiagramTip detail="THE KEY INNOVATION: Skip connection carries input x directly to the output. The layers only need to learn F(x) = desired − x, not the full mapping. If F(x)=0, this block is a no-op (identity). This makes depth free — extra layers can't hurt.">
      <path d="M95,32 L178,32 L178,102 L76,102" fill="none" stroke={C.novel} strokeWidth={1.2} markerEnd="url(#ah)"/>
    </DiagramTip>
    {lbl(188, 64, 'x skip', FSV, C.novel)}
    {op(65, 102, '+', 'Element-wise add: output before activation is F(x) + x.', { r: 10, color: C.novel, fill: 'none' })}
    {arr(65, 112, 65, 118)}
    {lbl(52, 114, 'sum', FSV, '#666')}
    {box(35, 118, 60, 20, C.ffn, 'ReLU', 'Nonlinearity after the residual sum.', FS)}
    {arr(65, 138, 65, 144)}
    {lbl(52, 140, 'y', FSV, '#666')}
    {box(35, 144, 60, 18, C.novel, 'Output y', 'y = ReLU(F(x) + x). Gradients flow through both paths.', FS)}
    {box(168, 48, 82, 40, C.dim, 'Degradation\n(no skip)', 'Without skip: 56-layer net has HIGHER error than 20-layer. Not overfitting — optimization failure.', FS)}
    {lbl(130, 168, 'Residual sum lets very deep nets train; the same idea appears inside every Transformer block.', FS, C.novel)}</svg>);
}
