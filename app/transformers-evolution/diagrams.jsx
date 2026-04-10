import { PerceptronDiagram } from './diagrams/PerceptronDiagram';
import { BackpropDiagram } from './diagrams/BackpropDiagram';
import { RnnDiagram } from './diagrams/RnnDiagram';
import { LstmDiagram } from './diagrams/LstmDiagram';
import { Word2vecDiagram } from './diagrams/Word2vecDiagram';
import { AttentionDiagram } from './diagrams/AttentionDiagram';
import { ResnetDiagram } from './diagrams/ResnetDiagram';
import { TransformerDiagram } from './diagrams/TransformerDiagram';
import { Gpt1Diagram } from './diagrams/Gpt1Diagram';
import { BertDiagram } from './diagrams/BertDiagram';
import { Gpt2Diagram } from './diagrams/Gpt2Diagram';
import { Gpt3Diagram } from './diagrams/Gpt3Diagram';
import { VitDiagram } from './diagrams/VitDiagram';
import { MoeDiagram } from './diagrams/MoeDiagram';
import { RopeDiagram } from './diagrams/RopeDiagram';
import { SftDiagram } from './diagrams/SftDiagram';
import { RlhfDiagram } from './diagrams/RlhfDiagram';
import { CotDiagram } from './diagrams/CotDiagram';
import { ChinchillaDiagram } from './diagrams/ChinchillaDiagram';
import { FlashDiagram } from './diagrams/FlashDiagram';
import { Gpt4Diagram } from './diagrams/Gpt4Diagram';
import { LongctxDiagram } from './diagrams/LongctxDiagram';
import { TtcDiagram } from './diagrams/TtcDiagram';
import { SsmDiagram } from './diagrams/SsmDiagram';
import { AgenticDiagram } from './diagrams/AgenticDiagram';
import { ScalingLawsDiagram } from './diagrams/ScalingLawsDiagram';
import { ToolUseDiagram } from './diagrams/ToolUseDiagram';
import { ScaffoldDiagram } from './diagrams/ScaffoldDiagram';

const diagramComponents = {
  perceptron: PerceptronDiagram,
  backprop: BackpropDiagram,
  rnn: RnnDiagram,
  lstm: LstmDiagram,
  word2vec: Word2vecDiagram,
  attention: AttentionDiagram,
  resnet: ResnetDiagram,
  transformer: TransformerDiagram,
  gpt1: Gpt1Diagram,
  bert: BertDiagram,
  gpt2: Gpt2Diagram,
  gpt3: Gpt3Diagram,
  vit: VitDiagram,
  moe: MoeDiagram,
  rope: RopeDiagram,
  sft: SftDiagram,
  rlhf: RlhfDiagram,
  cot: CotDiagram,
  chinchilla: ChinchillaDiagram,
  flash: FlashDiagram,
  gpt4: Gpt4Diagram,
  longctx: LongctxDiagram,
  ttc: TtcDiagram,
  ssm: SsmDiagram,
  agentic: AgenticDiagram,
  scalinglaws: ScalingLawsDiagram,
  tooluse: ToolUseDiagram,
  scaffold: ScaffoldDiagram,
};

function Diagram({ type }) {
  const Component = diagramComponents[type];
  if (!Component) return null;
  return <Component />;
}

export { Diagram };
