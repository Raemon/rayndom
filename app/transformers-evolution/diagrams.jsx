import { AnimatedLineageDiagram } from './AnimatedLineageDiagram';

function Diagram({ type, className, targetStageIndex }) {
  if (!className) return <AnimatedLineageDiagram type={type} targetStageIndex={targetStageIndex} />;
  return <div className={className}><AnimatedLineageDiagram type={type} targetStageIndex={targetStageIndex} /></div>;
}

export { Diagram };
