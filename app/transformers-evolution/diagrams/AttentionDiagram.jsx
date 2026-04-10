import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss, DiagramTip, op, ghostBox, FS, FSV } from './helpers';

export function AttentionDiagram() {
  const { box } = getDiagramHelpers();
  return (<svg viewBox="0 0 240 140" style={ss} xmlns="http://www.w3.org/2000/svg">{defs}
    {lbl(120,12,"Encoder Hidden States",FS)}
    {box(10,18,48,22,C.token,"h₁","Encoder state for position 1.")}
    {box(64,18,48,22,C.token,"h₂","Encoder state 2.")}
    {box(118,18,48,22,C.token,"h₃","Encoder state 3.")}
    {box(172,18,48,22,C.token,"h₄","Encoder state 4.")}
    {ghostBox(60,48,120,16,"fixed bottleneck vector","GHOST (predecessor): Without attention, the encoder compresses ALL input into one fixed vector. Long sentences lose detail.",FSV)}
    {arr(55,40,90,56)}{arr(115,40,120,56)}{arr(180,40,155,56)}
    {lbl(66,50,"score",FSV)}{lbl(152,50,"score",FSV)}
    {op(120,70,"σ","Softmax: converts raw scores into probability distribution (α weights sum to 1). Each decoder step gets its own distribution.",{r:11,color:C.novel})}
    {arr(120,56,120,59)}{lbl(130,58,"eᵢ",FSV,C.novel)}
    {lbl(108,85,"α₁…αₙ",FSV,C.novel)}
    {op(120,96,"Σ","Weighted sum: c = Σαᵢhᵢ. Each decoding step gets its own context — the decoder 'looks back' at different source words.",{r:12,color:C.novel})}
    {arr(34,40,110,90)}{arr(88,40,115,90)}{arr(142,40,125,90)}{arr(196,40,130,90)}
    {lbl(28,58,"×α₁",FSV,C.novel)}{lbl(78,58,"×α₂",FSV,C.novel)}{lbl(152,58,"×α₃",FSV,C.novel)}{lbl(202,58,"×α₄",FSV,C.novel)}
    {arr(120,81,120,84)}
    {box(55,115,130,22,C.gate,"Decoder sₜ","Decoder RNN receives context c + previous output → generates next token.")}
    {arr(120,108,120,115)}{lbl(132,112,"c",FSV,C.novel)}
    {lbl(120,145,"Dynamic weighted lookup replaces the fixed bottleneck",FS,C.novel)}</svg>);
}
