import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss, ghostBox, FS, FSV } from './helpers';

export function ChinchillaDiagram() {
  const { box } = getDiagramHelpers();
  return (<svg viewBox="0 0 260 155" className={`${ss} min-w-[190px]`} xmlns="http://www.w3.org/2000/svg">{defs}
    {lbl(75,18,"Model size (params)",FS,"#666")}{lbl(185,18,"Training tokens seen",FS,"#666")}
    {ghostBox(12,24,108,22,"Gopher-scale: 280B","Prior trend: push parameter count; ~1 token per parameter is severely undertrained.",FS)}
    {ghostBox(140,24,108,22,"~300B tokens","Huge model, modest token budget; compute skewed toward width over depth of data.",FS)}
    {lbl(130,52,"same FLOP budget, rebalanced",FS,C.novel)}
    {arr(66,46,66,58)}{arr(194,46,194,58)}{lbl(82,52,"fewer params",FS,"#666")}{lbl(210,52,"more tokens",FS,"#666")}
    {box(12,58,108,24,C.novel,"Chinchilla: 70B","Smaller model that wins because training tokens scale with the optimal Chinchilla ratio.",FS)}
    {box(140,58,108,24,C.novel,"~1.4T tokens","~20 tokens per parameter is the compute-efficient sweet spot for many dense LMs.",FS)}
    {arr(66,82,66,90)}{arr(194,82,194,90)}{lbl(82,86,"trained weights",FS,"#666")}{lbl(210,86,"seen data mass",FS,"#666")}
    {box(10,92,240,26,C.novel,"Same training compute, better downstream loss","Iso-FLOP comparison: properly fed smaller models beat oversized, data-starved ones.",FS)}
    {lbl(130,148,"Compute-optimal scaling trades model size for data until you reach ~20 training tokens per parameter.",FS,C.novel)}
  </svg>);
}
