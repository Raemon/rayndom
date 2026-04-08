import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss } from './helpers';

export function ChinchillaDiagram({ onTip }) {
  const { t, box } = getDiagramHelpers(onTip);
  return (<svg viewBox="0 0 220 130" style={{...ss,minWidth:190}} xmlns="http://www.w3.org/2000/svg">{defs}{lbl(110,10,"Compute-Optimal Scaling")}
    {lbl(55,24,"Model Size (params)",6,"#666")}{lbl(165,24,"Training Tokens",6,"#666")}
    {box(10,30,90,18,C.dim,"Gopher: 280B params","Previous approach: maximize model size. Undertrained on only 300B tokens.",6.5)}
    {box(120,30,90,18,C.dim,"300B tokens","~1 token per parameter. Far below optimal ratio.",6.5)}
    {lbl(110,58,"↓ Same compute budget, reallocated ↓",6.5,C.novel)}
    {box(10,66,90,18,C.novel,"Chinchilla: 70B params","4× smaller model. But better because properly trained.",6.5)}
    {box(120,66,90,18,C.novel,"1.4T tokens","~20 tokens per parameter. The compute-optimal ratio.",6.5)}
    {arr(55,84,55,92)}{arr(165,84,165,92)}
    {box(10,94,200,16,C.novel,"Chinchilla outperforms Gopher on all benchmarks","Same FLOP budget, dramatically better results. Proved bigger ≠ better without enough data.",6.5)}
    {lbl(110,120,"Optimal: ~20 training tokens per parameter",6.5,C.novel)}
    {lbl(110,130,"Reshaped Llama, Mistral, and all subsequent training",6,"#666")}</svg>);
}
