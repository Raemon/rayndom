import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss, FS, FSV } from './helpers';

export function Word2vecDiagram() {
  const { box } = getDiagramHelpers();
  const vbw = '0 0 260 158';
  return (<svg viewBox={vbw} className={`${ss} min-w-[180px]`} xmlns="http://www.w3.org/2000/svg">{defs}
    {lbl(58, 18, '|V|-dim', FSV, '#666')}
    {lbl(130, 18, 'd ≪ |V|', FSV, '#666')}
    {lbl(202, 18, 'd-dim', FSV, '#666')}
    {box(8, 24, 98, 46, C.dim, 'One-Hot\nsparse vector', 'Sparse input: 10,000+ dims, all zeros except one. Similar words are far apart in one-hot space.', FS)}
    {lbl(108, 47, 'eᵢ', FSV, '#666')}
    {arr(106, 47, 114, 47)}
    {lbl(110, 58, 'lookup', FSV, '#666')}
    {box(116, 30, 36, 40, C.novel, 'Embedding\nmatrix', 'THE KEY INNOVATION: Project into dense ~300-dim space. Learned by predicting context words. No hidden layer — just a lookup.', FS)}
    {lbl(134, 26, 'W', FSV, C.novel)}
    {arr(152, 47, 160, 47)}
    {lbl(156, 58, 'v = Weᵢ', FSV, '#666')}
    {box(162, 30, 48, 40, C.novel, 'Dense\nvector', 'Semantic vector. Similar words → similar vectors. Linear relationships emerge.', FS)}
    {lbl(186, 26, 'v', FSV, C.novel)}
    {lbl(130, 80, 'Skip-gram: maximize P(context | center)', FS, '#666')}
    {box(12, 88, 44, 22, C.gate, '…sat', 'Context word (position −2)', FS)}
    {box(60, 88, 44, 22, C.gate, 'the', 'Context word (position −1)', FS)}
    {box(108, 88, 44, 22, C.gate, 'on', 'Context word (position +1)', FS)}
    {box(156, 88, 44, 22, C.gate, 'a…', 'Context word (position +2)', FS)}
    {arr(130, 122, 34, 99)}{arr(130, 122, 82, 99)}{arr(130, 122, 130, 99)}{arr(130, 122, 178, 99)}
    {lbl(82, 112, 'P(w|center)', FSV, '#666')}
    {box(85, 122, 90, 28, C.token, 'Center\n“cat”', 'Given center word, maximize probability of actual neighbors.', FS)}
    {lbl(130, 152, 'One-hot |V|-dim input is compressed to a short dense vector by predicting neighbor words.', FS, C.novel)}</svg>);
}
