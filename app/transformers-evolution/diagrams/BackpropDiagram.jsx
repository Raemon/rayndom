import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss, DiagramTip, op, FS, FSV } from './helpers';

export function BackpropDiagram() {
  const { box } = getDiagramHelpers();
  return (<svg viewBox="0 0 240 130" className={`${ss} min-w-[180px]`} xmlns="http://www.w3.org/2000/svg">{defs}
    {lbl(30,12,"Input",FS,"#666")}{lbl(105,12,"Hidden",FS,"#666")}{lbl(190,12,"Output",FS,"#666")}
    {box(10,20,40,18,C.token,"x₁","",FSV)}{box(10,44,40,18,C.token,"x₂","",FSV)}{box(10,68,40,18,C.token,"x₃","",FSV)}
    {op(105,29,"σ","Hidden unit with activation. Learns internal representations the perceptron couldn't — solves XOR.",{r:9,color:C.gate})}
    {op(105,53,"σ","Multiple hidden layers = 'deep' network. Each layer builds more abstract features.",{r:9,color:C.gate})}
    {op(105,77,"σ","",{r:9,color:C.gate})}
    {box(170,42,40,20,C.ffn,"ŷ","Predicted output.")}
    <DiagramTip detail="Forward pass: inputs flow through weighted connections to produce output. Each connection has a learned weight.">
      {arr(50,29,96,29)}{arr(50,29,96,53)}{arr(50,53,96,29)}{arr(50,53,96,53)}{arr(50,53,96,77)}{arr(50,77,96,53)}{arr(50,77,96,77)}
      {lbl(75,26,"w",FSV)}
      {arr(114,29,168,52)}{arr(114,53,168,52)}{arr(114,77,168,52)}
      {lbl(142,42,"activations",FSV)}
    </DiagramTip>
    {arr(210,52,222,52)}{op(230,52,"−","Error = (y − ŷ)²",{r:8})}
    <DiagramTip detail="THE KEY INNOVATION: Error gradients flow BACKWARD through every layer via the chain rule. Each weight learns how much it contributed to the error and adjusts accordingly.">
      <path d="M230,60 L230,100 L195,100" fill="none" stroke={C.novel} strokeWidth={1.5} markerEnd="url(#ah)"/>
      <path d="M170,100 L130,100" fill="none" stroke={C.novel} strokeWidth={1.5} markerEnd="url(#ah)"/>
      <path d="M110,100 L60,100" fill="none" stroke={C.novel} strokeWidth={1.5} markerEnd="url(#ah)"/>
      {lbl(183,96,"∂E/∂w₃",FSV,C.novel)}{lbl(140,96,"∂E/∂w₂",FSV,C.novel)}{lbl(90,96,"∂E/∂w₁",FSV,C.novel)}
    </DiagramTip>
    {lbl(120,120,"Chain rule lets gradients flow backward through every layer",FS,C.novel)}</svg>);
}
