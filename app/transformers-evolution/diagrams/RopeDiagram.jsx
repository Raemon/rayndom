import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss, DiagramTip, op, ghostBox, FS, FSV } from './helpers';

export function RopeDiagram() {
  const { box } = getDiagramHelpers();
  const vbw = '0 0 260 158';
  return (<svg viewBox={vbw} className={`${ss} min-w-[180px]`} xmlns="http://www.w3.org/2000/svg">{defs}
    {ghostBox(12, 6, 236, 26, 'Before: q + p_m (absolute PE)', 'Additive position vectors fused into embeddings — encodes absolute index, weaker length extrapolation.', FSV)}
    {box(8, 40, 48, 22, C.attn, 'Query q', 'Raw query vector at position m before rotation.', FS)}
    {arr(56, 51, 66, 51)}{lbl(61, 46, 'q', FSV, '#666')}
    {op(76, 51, 'R', 'RoPE: rotate each conjugate dimension pair by angle θ_k · m (Euler / complex multiply).', { r: 10, color: C.novel, fill: 'none' })}
    {lbl(76, 66, 'θ·m', FSV, C.dim)}
    {arr(86, 51, 96, 51)}{lbl(91, 46, "q'", FSV, '#666')}
    {box(98, 40, 52, 22, C.attn, 'Rotated q′', 'Query with relative phase vs. keys baked in.', FS)}
    {box(8, 88, 48, 22, C.attn, 'Key k', 'Raw key vector at position n.', FS)}
    {arr(56, 99, 66, 99)}{lbl(61, 94, 'k', FSV, '#666')}
    {op(76, 99, 'R', 'Same frequency layout as queries; angle uses key position n instead of m.', { r: 10, color: C.novel, fill: 'none' })}
    {lbl(76, 114, 'θ·n', FSV, C.dim)}
    {arr(86, 99, 96, 99)}{lbl(91, 94, "k'", FSV, '#666')}
    {box(98, 88, 52, 22, C.attn, 'Rotated k′', 'Key vector after the same rotary map.', FS)}
    {arr(170, 62, 170, 68)}{lbl(176, 64, "q'", FSV, '#666')}
    {arr(170, 99, 170, 88)}{lbl(176, 92, "k'", FSV, '#666')}
    {box(132,68,76,20,C.novel,"q′·k′ ∝ f(m − n)","Because rotations compose, q′·k′ depends on θ(m−n): only relative distance matters — models extrapolate beyond training length more easily.")}
    {lbl(130, 148, 'RoPE rotates q and k so attention scores encode relative position, not a separate added PE vector.', FS, C.novel)}</svg>);
}
