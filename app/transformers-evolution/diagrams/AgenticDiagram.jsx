import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, vb, ss } from './helpers';

export function AgenticDiagram({ onTip }) {
  const { t, box } = getDiagramHelpers(onTip);
  return (<svg viewBox={vb} style={ss} xmlns="http://www.w3.org/2000/svg">{defs}{lbl(105,10,"Agentic Tool Use")}{box(55,20,100,16,C.token,"User Request","Complex task needing multiple actions, not just text.",6.5)}{arr(105,36,105,42)}{box(55,44,100,16,C.novel,"Plan: decompose task","Model creates multi-step plan. Can revise based on results.",6.5)}{arr(105,60,105,66)}{box(10,68,60,18,C.novel,"Tool Call","Structured JSON → web search, code exec, file ops, APIs. Sandboxed.",6.5)}{box(140,68,60,18,C.gate,"Observe Result","Tool output fed back to context. Model reads errors, results, decides next step.",6.5)}{arr(140,77,72,77)}
    <path d="M200,77 L205,77 L205,50 L157,50" fill="none" stroke={C.dim} strokeWidth={0.8} strokeDasharray="2,2" markerEnd="url(#ah)"/>{lbl(210,64,"loop",5.5)}
    {box(55,94,100,16,C.novel,"Iterate: next action","Plan→act→observe→re-plan until done. Needs ~99% per-step accuracy.",6.5)}{arr(105,110,105,116)}{box(55,118,100,12,C.ffn,"Final Output","Fixed code, written report, collected data.",6.5)}</svg>);
}
