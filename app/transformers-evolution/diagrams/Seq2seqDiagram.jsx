import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss, ghostBox, FS, FSV } from './helpers';

export function Seq2seqDiagram() {
  const { box } = getDiagramHelpers();
  return (<svg viewBox="0 0 280 160" className={`${ss} min-w-[190px]`} xmlns="http://www.w3.org/2000/svg">{defs}
    {ghostBox(92,16,96,18,"same-length RNN mapping","GHOST: Earlier RNN setups often emitted one output per input step. Seq2Seq splits the job into an encoder and a decoder so input and output lengths can differ.",FSV)}
    {box(14,42,34,20,C.token,"x₁","First source token.",FS)}
    {box(14,68,34,20,C.token,"x₂","Second source token.",FS)}
    {box(14,94,34,20,C.token,"x₃","Third source token.",FS)}
    {box(80,56,48,44,C.novel,"Encoder\nLSTM","Encoder RNN/LSTM reads the whole source sequence and updates its hidden state at each step.",FS)}
    {arr(48,52,80,66)}{arr(48,78,80,78)}{arr(48,104,80,90)}
    {lbl(50,32,"source",FSV,"#666")}
    {box(148,62,34,32,C.novel,"fixed\nvector","Final encoder state c. The whole source sequence is compressed into one vector. This bottleneck is exactly what attention later relaxes.",FS)}
    {arr(128,78,148,78)}{lbl(138,72,"c",FSV,C.novel)}
    {box(202,56,54,44,C.gate,"Decoder\nLSTM","Decoder RNN/LSTM is initialized from c and generates output tokens one step at a time until an end token.",FS)}
    {arr(182,78,202,78)}
    {lbl(230,32,"target",FSV,"#666")}
    {box(190,118,24,20,C.token,"y₁","First output token.",FS)}
    {box(218,118,24,20,C.token,"y₂","Second output token.",FS)}
    {box(246,118,24,20,C.token,"y₃","Third output token.",FS)}
    {arr(229,100,202,118)}{arr(229,100,230,118)}{arr(229,100,258,118)}
    {lbl(102,118,"read entire source",FSV,"#666")}
    {lbl(230,151,"Encoder compresses input into one vector; decoder expands it into a new sequence",FS,C.novel,220)}</svg>);
}
