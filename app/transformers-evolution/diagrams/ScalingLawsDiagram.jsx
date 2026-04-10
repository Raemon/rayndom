import { C } from '../colors';
import { getDiagramHelpers, arr, lbl, defs, ss, ghostBox, FS, FSV } from './helpers';

export function ScalingLawsDiagram() {
  const { box } = getDiagramHelpers();
  return (<svg viewBox="0 0 260 155" style={{...ss,minWidth:190}} xmlns="http://www.w3.org/2000/svg">{defs}
    {lbl(60,14,"log(Compute)",FS,"#666")}{lbl(200,14,"log(Loss)",FS,"#666")}
    {ghostBox(10,20,100,22,"Ad-hoc training","Before scaling laws, labs chose model size and data by intuition — no way to predict final performance.",FS)}
    {ghostBox(150,20,100,22,"Unpredictable","Each training run was a gamble; no formula connected inputs to outcomes.",FS)}
    {arr(60,42,60,50)}{arr(200,42,200,50)}
    {box(10,52,100,24,C.novel,"Power-law curves","Loss decreases as a smooth power law with compute, parameters, and data. Straight lines on log-log plots.",FS)}
    {box(150,52,100,24,C.novel,"Predictable loss","Given a FLOP budget, you can forecast the loss of a model before training it.",FS)}
    {arr(130,64,150,64)}
    {lbl(140,60,"extrapolate",FSV,"#666")}
    {arr(60,76,60,84)}{arr(200,76,200,84)}
    {box(10,86,240,26,C.novel,"Prescriptive: scale parameters > data","Kaplan recommended investing heavily in model size — later shown to be wrong by Chinchilla.",FS)}
    {lbl(130,148,"Scaling laws turned model development from guesswork into engineering — but the original parameter/data ratio was off by ~10×.",FS,C.novel)}
  </svg>);
}
