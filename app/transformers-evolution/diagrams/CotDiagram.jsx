import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss, op, FS, FSV } from './helpers';

export function CotDiagram() {
  const { box } = getDiagramHelpers();
  return (<svg viewBox="0 0 260 176" className={`${ss} min-w-[190px]`} xmlns="http://www.w3.org/2000/svg">{defs}
    {box(15,6,230,32,C.token,"Q: Roger has 5 balls.\nBuys 2 cans of 3. How many?","Without CoT, models often skip steps and fail multi-step word problems.",FS)}
    {arr(130,38,130,46)}{lbl(198,42,"tokens in context",FS,"#666")}
    {box(20,48,220,20,C.novel,"Step 1: Start with 5 balls.","Intermediate steps allocate more serial reasoning; each line conditions on prior text.",FS)}
    {arr(130,68,130,76)}{lbl(198,72,"condition on prior steps",FS,"#666")}
    {box(20,78,220,20,C.novel,"Step 2: 2 cans × 3 = 6 new balls.","Explicit arithmetic reduces error; same weights, different generation policy.",FS)}
    {op(238,88,"×","Pointwise multiply in the worked arithmetic line.",{r:8,color:C.novel,fill:'none'})}
    {arr(130,98,130,106)}{lbl(198,102,"intermediate numeric fact",FS,"#666")}
    {box(20,108,220,20,C.novel,"Step 3: 5 + 6 = 11.","CoT on GSM8K-style tasks: large gains from prompting alone in original results.",FS)}
    {op(238,118,"+","Pointwise sum before the final scalar answer.",{r:8,color:C.novel,fill:'none'})}
    {arr(130,128,130,134)}{lbl(198,131,"emit final answer",FS,"#666")}
    {box(70,136,120,20,C.ffn,"Answer: 11","Achieved by prompting for visible reasoning, not by updating weights.",FS)}
    {lbl(130,168,"Chain-of-thought prompting spends extra tokens so the model shows its work before the final answer.",FS,C.novel)}
  </svg>);
}
