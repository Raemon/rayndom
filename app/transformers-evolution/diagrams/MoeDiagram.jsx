import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, vb, ss } from './helpers';

export function MoeDiagram() {
  const { box } = getDiagramHelpers();
  return (<svg viewBox={vb} style={ss} xmlns="http://www.w3.org/2000/svg">{defs}{lbl(105,10,"Mixture of Experts")}{box(65,18,80,16,C.token,"Input Token","Each token routed independently. Dense model: all params. MoE: only top-k experts.",6.5)}{arr(105,34,105,42)}{box(55,44,100,20,C.novel,"Router / Gate","Learned network computing probability over experts per token. Top-k selection (usually 2). Load-balancing loss prevents collapse.",6.5)}{arr(75,64,35,74)}{arr(105,64,105,74)}{arr(135,64,175,74)}{box(10,76,50,22,C.ffn,"Expert 1","Independent FFN. Can specialize (e.g., code vs. prose). Same structure as standard Transformer FFN.")}{box(80,76,50,22,C.ffn,"Expert 2","Only selected experts compute. Rest skipped = conditional computation.")}{box(150,76,50,22,C.ffn,"Expert N","Mixtral: 8 experts. Switch Transformer: 128. More = more params, same per-token cost.")}{lbl(105,72,"top-k",5.5,C.novel)}{arr(35,98,80,108)}{arr(105,98,105,108)}{arr(175,98,130,108)}{box(60,110,90,16,C.novel,"Weighted Sum","Router weights × expert outputs. Total params 8× larger with same inference cost.",6.5)}</svg>);
}
