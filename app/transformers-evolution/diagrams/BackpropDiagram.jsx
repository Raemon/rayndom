import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, vb, ss, DiagramTip } from './helpers';

export function BackpropDiagram() {
  const { box } = getDiagramHelpers();
  return (<svg viewBox={vb} style={ss} xmlns="http://www.w3.org/2000/svg">{defs}{lbl(105,10,"Backpropagation (1986)")}
    {lbl(25,24,"Input",6,"#666")}{lbl(85,24,"Hidden",6,"#666")}{lbl(165,24,"Output",6,"#666")}
    {box(10,30,30,14,C.token,"x₁","",6)}{box(10,50,30,14,C.token,"x₂","",6)}{box(10,70,30,14,C.token,"x₃","",6)}
    {box(70,30,30,14,C.gate,"h₁","Hidden unit. Learns internal representations that the perceptron could not — solves XOR.",6)}{box(70,54,30,14,C.gate,"h₂","Multiple hidden layers = 'deep' network. Each layer builds more abstract features.",6)}{box(70,78,30,14,C.gate,"h₃","",6)}
    {box(150,44,30,14,C.ffn,"ŷ","Predicted output.",6)}
    <DiagramTip detail="Forward pass: inputs flow through weighted connections to produce output. Each connection has a learned weight.">{arr(40,37,68,37)}{arr(40,37,68,61)}{arr(40,57,68,37)}{arr(40,57,68,61)}{arr(40,57,68,85)}{arr(40,77,68,61)}{arr(40,77,68,85)}{arr(100,37,148,51)}{arr(100,61,148,51)}{arr(100,85,148,51)}</DiagramTip>
    {arr(180,51,195,51)}{box(195,44,10,14,C.dim,"E","Error = (y − ŷ)²",5.5)}
    <DiagramTip detail="THE KEY INNOVATION: Error gradients flow BACKWARD through every layer via the chain rule. Each weight learns how much it contributed to the error and adjusts accordingly. This is what makes deep learning possible."><path d="M195,60 L195,100 L170,100" fill="none" stroke={C.novel} strokeWidth={1.5} markerEnd="url(#ah)"/><path d="M150,100 L110,100" fill="none" stroke={C.novel} strokeWidth={1.5} markerEnd="url(#ah)"/><path d="M90,100 L50,100" fill="none" stroke={C.novel} strokeWidth={1.5} markerEnd="url(#ah)"/>{lbl(160,96,"∂E/∂w",5.5,C.novel)}{lbl(120,96,"∂E/∂w",5.5,C.novel)}{lbl(80,96,"∂E/∂w",5.5,C.novel)}</DiagramTip>
    {lbl(105,115,"← Gradients flow backward (chain rule)",6.5,C.novel)}</svg>);
}
