import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss, ghostBox, FS, FSV } from './helpers';

export function AgenticDiagram() {
  const { box } = getDiagramHelpers();
  return (<svg viewBox="0 0 260 158" style={{...ss,minWidth:190}} xmlns="http://www.w3.org/2000/svg">{defs}
    {box(80,12,100,20,C.token,"User request","Open-ended tasks that need actions beyond a single chat completion.",FS)}
    {ghostBox(188,12,62,18,"Chat-only reply","Baseline assistant answers in one shot without tools or environment feedback.",FSV)}
    {arr(130,32,130,40)}{lbl(188,36,"intent + constraints",FS,"#666")}
    {box(80,42,100,20,C.novel,"Plan: decompose","Model outlines ordered subgoals and can revise them as new facts arrive.",FS)}
    {arr(130,62,130,70)}{lbl(188,66,"structured intent",FS,"#666")}
    {box(18,72,78,22,C.novel,"Tool call","JSON or DSL invocations for search, code, filesystem, APIs—usually sandboxed.",FS)}
    {box(164,72,78,22,C.gate,"Observe result","Tool stdout, errors, or retrieval chunks return into the growing context.",FS)}
    {arr(96,83,164,83)}{lbl(130,79,"tool call → stdout / errors",FS,"#666")}
    <path d="M242,83 L248,83 L248,52 L140,52" fill="none" stroke={C.dim} strokeWidth={1} strokeDasharray="2,2" markerEnd="url(#ah)"/>
    {lbl(252,66,"re-plan loop",FS,"#666")}
    {box(80,100,100,20,C.novel,"Next action","Tight plan→act→observe cycles demand very high per-step reliability.",FS)}
    {arr(130,120,130,128)}{lbl(188,124,"stop or summarize",FS,"#666")}
    {box(80,130,100,20,C.ffn,"Final artifact","Shipped code, reports, or collected data after the loop converges.",FS)}
    {lbl(130,154,"Agentic loops interleave planning, tool calls, and observations until the model can return a grounded final artifact.",FS,C.novel)}
  </svg>);
}
