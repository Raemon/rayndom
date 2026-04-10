import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, vb, ss } from './helpers';

export function Word2vecDiagram() {
  const { box } = getDiagramHelpers();
  return (<svg viewBox={vb} style={ss} xmlns="http://www.w3.org/2000/svg">{defs}{lbl(105,10,"Word2Vec: Skip-Gram")}
    {box(10,24,55,22,C.dim,"One-Hot\n[0,0,1,0...]","Sparse input: 10,000+ dims, all zeros except one. 'cat' and 'kitten' are equidistant.",6)}
    {arr(65,35,75,35)}
    {box(77,24,56,22,C.novel,"Embedding\nMatrix W","THE KEY INNOVATION: Project into dense ~300-dim space. Learned by predicting context words. No hidden layer — just a lookup.",6.5)}
    {arr(133,35,145,35)}
    {box(147,24,55,22,C.novel,"Dense\n[0.2,−0.5...]","Semantic vector. Similar words → similar vectors. Linear relationships emerge.",6)}
    {lbl(105,58,"Skip-gram objective: predict neighbors",6,"#666")}
    {box(10,64,40,16,C.gate,"...sat","Context word (position −2)",6)}{box(55,64,40,16,C.gate,"the","Context word (position −1)",6)}
    {box(115,64,40,16,C.gate,"on","Context word (position +1)",6)}{box(160,64,40,16,C.gate,"a...","Context word (position +2)",6)}
    {arr(105,58,30,64)}{arr(105,58,75,64)}{arr(105,58,135,64)}{arr(105,58,180,64)}
    {box(60,86,90,16,C.token,"center: \"cat\"","Given center word, maximize probability of actual neighbors.",6.5)}
    {lbl(105,115,"king − man + woman ≈ queen",6.5,C.novel)}
    {lbl(105,125,"Geometry encodes meaning",6.5,"#666")}</svg>);
}
