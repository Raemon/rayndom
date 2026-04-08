import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, vb, ss } from './helpers';

export function TtcDiagram({ onTip }) {
  const { t, box } = getDiagramHelpers(onTip);
  return (<svg viewBox={vb} style={ss} xmlns="http://www.w3.org/2000/svg">{defs}{lbl(105,10,"Test-Time Compute Scaling")}{box(55,20,100,16,C.token,"Hard Problem","Problem where a single pass would likely fail.",6.5)}{arr(105,36,105,44)}{box(35,46,140,16,C.novel,"Think: break this down...","Model generates extended reasoning. Each token = more compute. Trained via RL to produce useful chains.",6.5)}{arr(105,62,105,70)}{box(35,72,60,16,C.novel,"Verify ✓","Checks own work. Process reward models score reasoning quality.",6.5)}{box(115,72,60,16,C.novel,"Backtrack ↺","If wrong, abandon path, try alternative. Adaptive: harder problems get more thinking.",6.5)}<path d="M175,77 L190,77 L190,50 L177,50" fill="none" stroke={C.dim} strokeWidth={0.8} strokeDasharray="2,2" markerEnd="url(#ah)"/>{lbl(198,64,"retry",5.5)}{arr(105,88,105,96)}{box(35,98,140,16,C.novel,"Think more: approach B...","Can spend 10–100× more tokens 'thinking' than in final answer.",6.5)}{arr(105,114,105,118)}{box(55,120,100,10,C.ffn,"Final Answer","Quality scales with inference compute, not just training compute.",6.5)}</svg>);
}
