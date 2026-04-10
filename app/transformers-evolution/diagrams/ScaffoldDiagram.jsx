import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss, ghostBox, FS, FSV } from './helpers';

export function ScaffoldDiagram() {
  const { box } = getDiagramHelpers();
  return (<svg viewBox="0 0 260 158" style={{...ss,minWidth:190}} xmlns="http://www.w3.org/2000/svg">{defs}
    {ghostBox(10,8,80,20,"Single long session","Context fills up, model performance degrades, loses track of plan.",FS)}
    {lbl(180,18,"RALPH outer loop",FS,C.novel)}
    {box(110,8,140,20,C.novel,"Reset context each iteration","Fresh context window every loop. State persists through files and git, not conversation.",FS)}
    {arr(180,28,180,36)}
    {box(110,38,140,22,C.gate,"Read state from disk","Source code, test output, TODO.md, git log — the model reads updated files each iteration.",FS)}
    {arr(180,60,180,68)}
    {box(110,70,140,22,C.token,"Agent session (inner loop)","Plan → tool call → observe → act. Standard agentic loop runs within one fresh context.",FS)}
    {arr(180,92,180,100)}
    {box(110,102,140,22,C.novel,"Commit & update files","Write changes, commit to git, update progress markers. Files are the persistent memory.",FS)}
    <path d="M250,113 L256,113 L256,32 L250,32" fill="none" stroke={C.novel} strokeWidth={1.2} strokeDasharray="3,2" markerEnd="url(#ah)"/>
    {lbl(264,72,"loop",FS,C.novel)}
    {box(10,38,90,24,C.ffn,"Persistent memory","SOUL.md, MEMORY.md, guardrails — identity and lessons that survive across sessions.",FS)}
    {arr(55,62,55,70)}
    {box(10,72,90,24,C.gate,"Prompt orchestration","40+ prompt fragments assembled per mode, tool set, and permission level.",FS)}
    {lbl(130,150,"Agent scaffolding solves context degradation (RALPH), dynamic prompting (Claude Code), and persistent memory (OpenClaw).",FS,C.novel)}
  </svg>);
}
