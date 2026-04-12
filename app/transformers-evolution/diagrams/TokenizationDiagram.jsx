import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss, FS, FSV } from './helpers';

export function TokenizationDiagram() {
  const { box } = getDiagramHelpers();
  const vbw = '0 0 260 156';
  return (<svg viewBox={vbw} className={`${ss} min-w-[180px]`} xmlns="http://www.w3.org/2000/svg">{defs}
    {box(10, 26, 74, 30, C.token, 'Raw text\n"tokenization"', 'User text arrives as ordinary characters before the model sees any ids.', FS)}
    {arr(84, 41, 98, 41)}
    {box(100, 20, 60, 42, C.dim, 'Start from\nsmall units', 'BPE begins from tiny pieces such as bytes or characters so every string is representable.', FS)}
    {lbl(130, 76, 'count frequent pairs', FSV, '#666')}
    {arr(160, 41, 174, 41)}
    {box(176, 20, 74, 42, C.novel, 'Merge common\nadjacent pairs', 'THE KEY INNOVATION: repeatedly merge the most frequent neighboring pair to build a compact subword vocabulary.', FS)}
    {arr(130, 86, 130, 102)}
    {box(72, 104, 116, 24, C.novel, 'token + ization', 'Rare words are split into reusable chunks instead of becoming [UNK].', FS)}
    {arr(188, 86, 188, 102)}
    {box(188, 104, 52, 24, C.token, 'ids', 'Each learned subword piece maps to a vocabulary id for the model.', FS)}
    {lbl(130, 146, 'Finite vocab, open-ended text coverage', FS, C.novel)}
  </svg>);
}
