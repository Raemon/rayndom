import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss, ghostBox, FS, FSV } from './helpers';

export function ToolUseDiagram() {
  const { box } = getDiagramHelpers();
  return (<svg viewBox="0 0 260 155" style={{...ss,minWidth:190}} xmlns="http://www.w3.org/2000/svg">{defs}
    {box(80,10,100,20,C.token,"User request","A task requiring actions beyond text generation — run code, search the web, edit files.",FS)}
    {ghostBox(188,10,62,18,"Text-only reply","Without tools, the model can only describe what to do, not do it.",FSV)}
    {arr(130,30,130,38)}{lbl(188,34,"parse intent",FS,"#666")}
    {box(80,40,100,20,C.novel,"Reason (ReAct)","Model decides what action to take next based on the goal and prior observations.",FS)}
    {arr(130,60,130,68)}{lbl(188,64,"structured JSON",FS,"#666")}
    {box(18,70,78,22,C.novel,'Tool call {"fn":…}',"JSON function call specifying which tool to invoke and with what arguments.",FS)}
    {box(164,70,78,22,C.gate,"Observe result","Tool stdout, errors, or data return into the context as new information.",FS)}
    {arr(96,81,164,81)}{lbl(130,77,"execute → stdout",FS,"#666")}
    <path d="M242,81 L248,81 L248,50 L180,50" fill="none" stroke={C.dim} strokeWidth={1} strokeDasharray="2,2" markerEnd="url(#ah)"/>
    {lbl(252,64,"loop",FS,"#666")}
    {arr(130,92,130,100)}{lbl(188,96,"converge",FS,"#666")}
    {box(80,102,100,20,C.ffn,"Final result","Executed code, retrieved data, or completed task — grounded in real tool output.",FS)}
    {lbl(130,148,"ReAct loops alternate reasoning and tool calls; reliability requires near-perfect structured output at each step.",FS,C.novel)}
  </svg>);
}
