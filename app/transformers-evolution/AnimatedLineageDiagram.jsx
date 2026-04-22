'use client';
import { useEffect, useState } from 'react';

const stageDefinitions = [
  {
    id: 'perceptron',
    label: 'Perceptron',
    detail: 'A single learned node combines inputs into one decision.',
    detailLines: ['A single learned node combines inputs into one decision.'],
  },
  {
    id: 'mlpNoBackprop',
    label: 'Multilayer network with no backprop',
    detail: 'Adding layers makes the network expressive enough in theory, but the hidden layers still have no practical training rule.',
    detailLines: ['Adding layers makes the network expressive enough in theory,', 'but the hidden layers still have no practical training rule.'],
  },
  {
    id: 'mlpBackprop',
    label: 'Backpropagation',
    detail: 'The same multilayer network becomes trainable once error signals can flow backward through it.',
    detailLines: ['The same multilayer network becomes trainable once error signals can flow', 'backward through it.'],
  },
  {
    id: 'rnnCell',
    label: 'Single recurrent cell',
    detail: 'A recurrent cell is the earlier learned network plus a hidden-state input, so the same core can be reused over time.',
    detailLines: ['A recurrent cell is the earlier learned network plus a hidden-state input,', 'so the same core can be reused over time.'],
  },
  {
    id: 'unrolledRnn',
    label: 'Unrolled RNN',
    detail: 'That same recurrent cell is then repeated across several timesteps so sequence processing becomes visible.',
    detailLines: ['That same recurrent cell is then repeated across several timesteps', 'so sequence processing becomes visible.'],
  },
  {
    id: 'lstmCellDetail',
    label: 'Single LSTM cell detail',
    detail: 'Before showing a whole sequence, the gates and cell state are unpacked inside one upgraded recurrent cell.',
    detailLines: ['Before showing a whole sequence, the gates and cell state are unpacked', 'inside one upgraded recurrent cell.'],
  },
  {
    id: 'fullLstm',
    label: 'Full LSTM',
    detail: 'The upgraded cell now repeats across time, preserving longer-range state with gated memory.',
    detailLines: ['The upgraded cell now repeats across time, preserving longer-range state', 'with gated memory.'],
  },
  {
    id: 'word2vec',
    label: 'Word2Vec',
    detail: 'Words become dense vectors, so meaning can live in geometry instead of one-hot IDs.',
    detailLines: ['Words become dense vectors, so meaning can live in geometry', 'instead of one-hot IDs.'],
  },
  {
    id: 'seq2seq',
    label: 'Seq2Seq',
    detail: 'An encoder reads one sequence and a decoder writes another from one compressed state.',
    detailLines: ['An encoder reads one sequence and a decoder writes another', 'from one compressed state.'],
  },
  {
    id: 'attention',
    label: 'Attention',
    detail: 'The decoder can now look back at every encoder state instead of one bottleneck vector.',
    detailLines: ['The decoder can now look back at every encoder state', 'instead of one bottleneck vector.'],
  },
  {
    id: 'resnet',
    label: 'Residual Connections',
    detail: 'Skip paths make very deep blocks trainable and later become part of every Transformer block.',
    detailLines: ['Skip paths make very deep blocks trainable and later become part', 'of every Transformer block.'],
  },
  {
    id: 'tokenization',
    label: 'Subword Tokenization',
    detail: 'Text is split into reusable pieces so rare words no longer collapse into unknown tokens.',
    detailLines: ['Text is split into reusable pieces so rare words no longer', 'collapse into unknown tokens.'],
  },
  {
    id: 'transformer',
    label: 'The Transformer',
    detail: 'Parallel self-attention replaces recurrence, while positional signals and skip paths keep order and depth stable.',
    detailLines: ['Parallel self-attention replaces recurrence, while positional signals', 'and skip paths keep order and depth stable.'],
  },
  {
    id: 'gpt1',
    label: 'GPT-1',
    detail: 'A decoder is first pre-trained on raw text, then adapted with much smaller supervised data.',
    detailLines: ['A decoder is first pre-trained on raw text, then adapted', 'with much smaller supervised data.'],
  },
  {
    id: 'bert',
    label: 'BERT',
    detail: 'A Transformer encoder uses masked tokens so both left and right context shape each representation.',
    detailLines: ['A Transformer encoder uses masked tokens so both left and right context', 'shape each representation.'],
  },
  {
    id: 'gpt2',
    label: 'GPT-2',
    detail: 'The same decoder recipe scales up and starts showing useful zero-shot behavior.',
    detailLines: ['The same decoder recipe scales up and starts showing', 'useful zero-shot behavior.'],
  },
  {
    id: 'scalinglaws',
    label: 'Scaling Laws',
    detail: 'Smooth power laws turn giant training runs from guesswork into something more engineerable.',
    detailLines: ['Smooth power laws turn giant training runs from guesswork', 'into something more engineerable.'],
  },
  {
    id: 'gpt3',
    label: 'GPT-3',
    detail: 'A bigger decoder can infer tasks from examples placed directly in the prompt.',
    detailLines: ['A bigger decoder can infer tasks from examples', 'placed directly in the prompt.'],
  },
  {
    id: 'vit',
    label: 'ViT',
    detail: 'Images become patch tokens, showing that the same sequence machinery can handle vision too.',
    detailLines: ['Images become patch tokens, showing that the same sequence machinery', 'can handle vision too.'],
  },
  {
    id: 'moe',
    label: 'Mixture of Experts',
    detail: 'A router sends each token through only a few specialists instead of every feed-forward block.',
    detailLines: ['A router sends each token through only a few specialists', 'instead of every feed-forward block.'],
  },
  {
    id: 'rope',
    label: 'RoPE',
    detail: 'Position is encoded by rotating queries and keys, so relative distance survives to longer contexts.',
    detailLines: ['Position is encoded by rotating queries and keys, so relative distance', 'survives to longer contexts.'],
  },
  {
    id: 'sft',
    label: 'Instruction Tuning',
    detail: 'The pre-trained model is shown many examples of what a good answer should look like.',
    detailLines: ['The pre-trained model is shown many examples', 'of what a good answer should look like.'],
  },
  {
    id: 'rlhf',
    label: 'RLHF',
    detail: 'Human preference pairs train a reward model, then policy updates push responses toward what people prefer.',
    detailLines: ['Human preference pairs train a reward model, then policy updates push', 'responses toward what people prefer.'],
  },
  {
    id: 'cot',
    label: 'Chain-of-Thought',
    detail: 'Extra reasoning tokens become extra serial compute, even without changing the model weights.',
    detailLines: ['Extra reasoning tokens become extra serial compute,', 'even without changing the model weights.'],
  },
  {
    id: 'chinchilla',
    label: 'Chinchilla',
    detail: 'For a fixed compute budget, feeding more tokens often beats making the network even larger.',
    detailLines: ['For a fixed compute budget, feeding more tokens often beats', 'making the network even larger.'],
  },
  {
    id: 'flash',
    label: 'FlashAttention',
    detail: 'The attention math stays the same, but tiled kernels avoid writing the full matrix to slow memory.',
    detailLines: ['The attention math stays the same, but tiled kernels avoid writing', 'the full matrix to slow memory.'],
  },
  {
    id: 'gpt4',
    label: 'GPT-4 / Multimodal',
    detail: 'Image embeddings join text embeddings, so one model can reason across both together.',
    detailLines: ['Image embeddings join text embeddings, so one model can reason', 'across both together.'],
  },
  {
    id: 'longctx',
    label: 'Long Context',
    detail: 'Long windows come from combining better positions, better kernels, and training that actually uses them.',
    detailLines: ['Long windows come from combining better positions, better kernels,', 'and training that actually uses them.'],
  },
  {
    id: 'ttc',
    label: 'Test-Time Compute',
    detail: 'Harder questions can now trigger longer reasoning traces and more verification at inference time.',
    detailLines: ['Harder questions can now trigger longer reasoning traces', 'and more verification at inference time.'],
  },
  {
    id: 'ssm',
    label: 'SSM Hybrids',
    detail: 'State-space layers offer linear-cost sequence mixing, often alongside sparse attention.',
    detailLines: ['State-space layers offer linear-cost sequence mixing,', 'often alongside sparse attention.'],
  },
  {
    id: 'tooluse',
    label: 'Tool Use',
    detail: 'The model stops only talking and starts calling tools, then reading the results back in.',
    detailLines: ['The model stops only talking and starts calling tools,', 'then reading the results back in.'],
  },
  {
    id: 'scaffold',
    label: 'Agent Scaffolding',
    detail: 'Long-running agents add external memory, fresh-context loops, and orchestration around the same core model.',
    detailLines: ['Long-running agents add external memory, fresh-context loops,', 'and orchestration around the same core model.'],
  },
];

const stageIndexesByType = {
  perceptron: [0],
  backprop: [1, 2],
  rnn: [3, 4],
  lstm: [5, 6],
  word2vec: [7],
  seq2seq: [8],
  attention: [9],
  resnet: [10],
  tokenization: [11],
  transformer: [12],
  gpt1: [13],
  bert: [14],
  gpt2: [15],
  scalinglaws: [16],
  gpt3: [17],
  vit: [18],
  moe: [19],
  rope: [20],
  sft: [21],
  rlhf: [22],
  cot: [23],
  chinchilla: [24],
  flash: [25],
  gpt4: [26],
  longctx: [27],
  ttc: [28],
  ssm: [29],
  tooluse: [30],
  scaffold: [31],
};

const layerNodeYs = [148, 210, 272];
const hiddenLayerNodeYs = [162, 210, 258];
const ltsmGateXs = [170, 270, 370];
const recurrentStepXs = [170, 350, 530];
const recurrentCellTopY = 124;
const recurrentCellWidth = 132;
const recurrentCellHeight = 164;
const transformerTokenXs = [442, 528, 614, 700];
const transformerTokenLabels = ['tok1', 'tok2', 'tok3', 'tok4'];
const embeddingTokenXs = [334, 430, 526, 622];
const embeddingTokenLabels = ['king', 'queen', 'cat', 'dog'];
const seqEncoderXs = [380, 462, 544];
const seqDecoderXs = [664, 746, 828];
const compactDiagramWidth = 500;
const compactDiagramHeight = 660;
const lateSceneScale = 0.66;
const lateSceneOffsetX = 4;
const lateSceneOffsetY = 158;
const earlySceneScale = 0.82;
const earlySceneOffsetX = 16;
const earlySceneOffsetY = 176;
const labelSizeMultiplier = 1.55;
const parkedPostLstmPositions = {
  word2vec: { x: -188, y: -172, scale: 0.82 },
  seq2seq: { x: -86, y: -48, scale: 0.82 },
  attention: { x: -86, y: -48, scale: 0.82 },
  resnet: { x: -380, y: -12, scale: 0.82 },
  tokenization: { x: -14, y: -230, scale: 0.86 },
  transformer: { x: -114, y: -76, scale: 0.9 },
  gpt1: { x: -82, y: -4, scale: 0.82 },
  bert: { x: 12, y: -58, scale: 0.82 },
  gpt2: { x: -140, y: -24, scale: 0.82 },
  scalinglaws: { x: 14, y: -6, scale: 0.78 },
  gpt3: { x: -438, y: 28, scale: 0.82 },
  vit: { x: 38, y: 54, scale: 0.8 },
  moe: { x: -396, y: 22, scale: 0.8 },
  rope: { x: 56, y: -90, scale: 0.78 },
  sft: { x: -82, y: 68, scale: 0.82 },
  rlhf: { x: -96, y: 102, scale: 0.8 },
  cot: { x: -388, y: 96, scale: 0.8 },
  chinchilla: { x: 22, y: 28, scale: 0.78 },
  flash: { x: -394, y: 138, scale: 0.8 },
  gpt4: { x: 34, y: 92, scale: 0.82 },
  longctx: { x: -112, y: 154, scale: 0.84 },
  ttc: { x: -386, y: 118, scale: 0.8 },
  ssm: { x: 6, y: 170, scale: 0.8 },
  tooluse: { x: -382, y: 194, scale: 0.8 },
  scaffold: { x: -380, y: 218, scale: 0.78 },
};

const getDiagramStageIndexes = type => stageIndexesByType[type] ?? [stageDefinitions.length - 1];

export const getTargetStageIndex = (type, showFinalSubstage = true) => {
  const namedStageIndexes = getDiagramStageIndexes(type);
  return showFinalSubstage ? namedStageIndexes[namedStageIndexes.length - 1] : namedStageIndexes[0];
};

const getVisibilityStyle = ({ isVisible, opacity = 1, x = 0, y = 0, scale = 1 }) => {
  return {
    opacity: isVisible ? opacity : 0,
    transform: `translate(${x}px, ${y}px) scale(${isVisible ? scale : 0.9})`,
    transformOrigin: 'center center',
    transformBox: 'fill-box',
    transition: 'opacity 320ms ease, transform 420ms ease',
  };
};

const getMotionStyle = ({ opacity = 1, x = 0, y = 0, scale = 1 }) => {
  return {
    opacity,
    transform: `translate(${x}px, ${y}px) scale(${scale})`,
    transformOrigin: 'center center',
    transformBox: 'fill-box',
    transition: 'opacity 320ms ease, transform 420ms ease',
  };
};

const getStageOpacity = (stageIndex, revealStage, afterOpacity = 0.24, hiddenOpacity = 0) => {
  if (stageIndex < revealStage) return hiddenOpacity;
  return stageIndex === revealStage ? 1 : afterOpacity;
};

const Node = ({ cx, cy, r = 11, fill = '#f6f1e8', opacity = 1 }) => {
  return <circle cx={cx} cy={cy} r={r} fill={fill} stroke="#111111" strokeWidth="1.2" opacity={opacity} />;
};

const Box = ({ x, y, width, height, fill = 'transparent', opacity = 1, dashed = false, stroke = '#111111' }) => {
  return <rect x={x} y={y} width={width} height={height} fill={fill} stroke={stroke} strokeWidth="1.2" opacity={opacity} strokeDasharray={dashed ? '5 4' : undefined} />;
};

const Line = ({ x1, y1, x2, y2, opacity = 1, dashed = false, markerEnd = 'url(#arrowhead)' }) => {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#111111" strokeWidth="1.2" opacity={opacity} strokeDasharray={dashed ? '4 4' : undefined} markerEnd={markerEnd} />;
};

const Label = ({ x, y, children, anchor = 'middle', opacity = 1, size = 12, fill = '#111111', fontFamily }) => {
  return <text x={x} y={y} textAnchor={anchor} fontSize={size * labelSizeMultiplier} fill={fill} opacity={opacity} fontFamily={fontFamily}>{children}</text>;
};

const Dot = ({ cx, cy, r = 3, fill = '#111111', opacity = 1 }) => {
  return <circle cx={cx} cy={cy} r={r} fill={fill} opacity={opacity} />;
};

const TokenChip = ({ x, y, label, width = 56, height = 24, opacity = 1, fill = '#f6f1e8' }) => {
  return (
    <g opacity={opacity}>
      <Box x={x - width / 2} y={y - height / 2} width={width} height={height} fill={fill} opacity={1} />
      <Label x={x} y={y + 4} size={10}>{label}</Label>
    </g>
  );
};

const Panel = ({ x, y, width, height, title, opacity = 1, fill = '#f6f1e8', dashed = false, stroke = '#111111', titleAnchor = 'start', titleX }) => {
  return (
    <g opacity={opacity}>
      <Box x={x} y={y} width={width} height={height} fill={fill} opacity={1} dashed={dashed} stroke={stroke} />
      <Label x={titleX ?? x + 12} y={y + 18} anchor={titleAnchor} size={10}>{title}</Label>
    </g>
  );
};

const DiagramStageText = ({ label, detailLines, isFallback }) => {
  return (
    <g>
      <Label x={250} y={34} size={18}>{label}</Label>
      {detailLines.map((detailLine, detailLineIndex) => (
        <Label key={`${label}-${detailLineIndex}`} x={250} y={72 + detailLineIndex * 20} size={11} fill="#3d3d3d" fontFamily="Arial, sans-serif">{detailLine}</Label>
      ))}
      {isFallback ? <Label x={250} y={72 + detailLines.length * 20 + 4} size={9} fill="#8b3b1f">Later innovations still route through this early arc for now.</Label> : null}
    </g>
  );
};

const NetworkInset = ({ x, y, width, height, opacity = 1, showBox = false }) => {
  const inputLayerX = x + width * 0.18;
  const hiddenLayerX = x + width * 0.5;
  const outputLayerX = x + width * 0.82;
  const inputNodeOffsets = [0.18, 0.5, 0.82];
  const hiddenNodeOffsets = [0.24, 0.5, 0.76];
  return (
    <g opacity={opacity}>
      {showBox ? <Box x={x} y={y} width={width} height={height} fill="transparent" opacity={0.5} dashed /> : null}
      {inputNodeOffsets.map(sourceOffset => {
        const sourceY = y + height * sourceOffset;
        return hiddenNodeOffsets.map(targetOffset => {
          const targetY = y + height * targetOffset;
          return <Line key={`${sourceOffset}-${targetOffset}-${x}`} x1={inputLayerX + 6} y1={sourceY} x2={hiddenLayerX - 6} y2={targetY} opacity={0.18} markerEnd={undefined} />;
        });
      })}
      {hiddenNodeOffsets.map(sourceOffset => {
        const sourceY = y + height * sourceOffset;
        return inputNodeOffsets.map(targetOffset => {
          const targetY = y + height * targetOffset;
          return <Line key={`${sourceOffset}-${targetOffset}-${outputLayerX}`} x1={hiddenLayerX + 6} y1={sourceY} x2={outputLayerX - 6} y2={targetY} opacity={0.18} markerEnd={undefined} />;
        });
      })}
      {inputNodeOffsets.map(offset => <Node key={`i-${offset}-${x}`} cx={inputLayerX} cy={y + height * offset} r={5} opacity={0.7} />)}
      {hiddenNodeOffsets.map(offset => <Node key={`h-${offset}-${x}`} cx={hiddenLayerX} cy={y + height * offset} r={5} fill="#f3e6c9" opacity={0.8} />)}
      {inputNodeOffsets.map(offset => <Node key={`o-${offset}-${x}`} cx={outputLayerX} cy={y + height * offset} r={5} opacity={0.7} />)}
    </g>
  );
};

const PerceptronToNetwork = ({ stageIndex }) => {
  const isPerceptronStage = stageIndex === 0;
  const isNetworkVisible = stageIndex >= 1;
  const showBackprop = stageIndex === 2;
  const isRecurrentStage = stageIndex >= 3;
  const isSingleRecurrentCellStage = stageIndex === 3;
  const showUnrolledRnn = stageIndex >= 4;
  const inputX = 74;
  const hiddenX = 170;
  const outputX = 334;
  const perceptronHiddenX = 202;
  const perceptronOutputX = 328;
  const hiddenCenterOffsetX = isPerceptronStage ? perceptronHiddenX - hiddenX : 0;
  const outputCenterOffsetX = isPerceptronStage ? perceptronOutputX - outputX : 0;
  const extraHiddenNodeYs = [162, 258];
  const networkCenterX = (inputX + outputX) / 2;
  const recurrentAnchorCellX = recurrentStepXs[1];
  const recurrentAnchorLeftX = recurrentAnchorCellX - recurrentCellWidth / 2;
  const singleRecurrentCellLeftX = 118;
  const singleRecurrentCellTopY = 108;
  const singleRecurrentCellWidth = 346;
  const singleRecurrentCellHeight = 204;
  const singleRecurrentCellCenterX = singleRecurrentCellLeftX + singleRecurrentCellWidth / 2;
  const recurrentShellLeftX = showUnrolledRnn ? recurrentAnchorLeftX : isSingleRecurrentCellStage ? singleRecurrentCellLeftX : recurrentAnchorLeftX;
  const recurrentShellTopY = showUnrolledRnn ? recurrentCellTopY : isSingleRecurrentCellStage ? singleRecurrentCellTopY : recurrentCellTopY;
  const recurrentShellWidth = showUnrolledRnn ? recurrentCellWidth : isSingleRecurrentCellStage ? singleRecurrentCellWidth : recurrentCellWidth;
  const recurrentShellHeight = showUnrolledRnn ? recurrentCellHeight : isSingleRecurrentCellStage ? singleRecurrentCellHeight : recurrentCellHeight;
  const recurrentShellRightX = recurrentShellLeftX + recurrentShellWidth;
  const recurrentNetworkOffsetX = isSingleRecurrentCellStage ? singleRecurrentCellCenterX - networkCenterX : recurrentAnchorCellX - networkCenterX;
  const recurrentNetworkOffsetY = isSingleRecurrentCellStage ? 0 : -4;
  const recurrentNetworkScale = showUnrolledRnn ? 0.44 : isSingleRecurrentCellStage ? 0.84 : 0.48;
  const recurrentNetworkOpacity = showUnrolledRnn ? 0.28 : isSingleRecurrentCellStage ? 0.74 : 0.4;
  return (
    <g style={getMotionStyle({ opacity: isRecurrentStage ? recurrentNetworkOpacity : 1, x: isRecurrentStage ? recurrentNetworkOffsetX : 0, y: isRecurrentStage ? recurrentNetworkOffsetY : 0, scale: isRecurrentStage ? recurrentNetworkScale : 1 })}>
      {layerNodeYs.map(inputY => (
        <Node key={`input-${inputY}`} cx={inputX} cy={inputY} r={8} />
      ))}

      <g style={getMotionStyle({ opacity: isPerceptronStage ? 0.9 : 0.18 })}>
        {layerNodeYs.map(inputY => (
          <Line key={`perceptron-edge-${inputY}`} x1={82} y1={inputY} x2={190} y2={210} markerEnd={undefined} opacity={1} />
        ))}
        <Line x1={224} y1={210} x2={316} y2={210} opacity={1} />
      </g>

      <g style={getVisibilityStyle({ isVisible: isNetworkVisible, opacity: showBackprop ? 0.34 : 0.28, x: 0, y: 0, scale: 1 })}>
        {layerNodeYs.map(sourceY => hiddenLayerNodeYs.map(targetY => (
          <Line key={`network-in-${sourceY}-${targetY}`} x1={inputX + 8} y1={sourceY} x2={hiddenX - 10} y2={targetY} opacity={1} markerEnd={undefined} />
        )))}
        {hiddenLayerNodeYs.map(sourceY => layerNodeYs.map(targetY => (
          <Line key={`network-out-${sourceY}-${targetY}`} x1={hiddenX + 10} y1={sourceY} x2={outputX - 8} y2={targetY} opacity={1} markerEnd={undefined} />
        )))}
      </g>

      <g style={getVisibilityStyle({ isVisible: isNetworkVisible, opacity: 1, x: 0, y: 0, scale: 1 })}>
        {extraHiddenNodeYs.map(nodeY => (
          <Node key={`hidden-extra-${nodeY}`} cx={hiddenX} cy={nodeY} r={10} fill="#f3e6c9" />
        ))}
        {extraHiddenNodeYs.map(nodeY => (
          <Node key={`output-extra-${nodeY}`} cx={outputX} cy={nodeY} r={8} opacity={0.88} />
        ))}
      </g>

      <g style={getMotionStyle({ x: hiddenCenterOffsetX, scale: isPerceptronStage ? 2.2 : 1 })}>
        <Node cx={hiddenX} cy={210} r={10} fill="#f3e6c9" />
      </g>

      <g style={getMotionStyle({ x: outputCenterOffsetX, scale: isPerceptronStage ? 1 : 1.06 })}>
        <Node cx={outputX} cy={210} r={8} opacity={0.88} />
      </g>

      <g style={getVisibilityStyle({ isVisible: showBackprop, opacity: 1, x: 0, y: 0, scale: 1 })}>
        <path d="M334 142 C286 118, 246 122, 182 150" fill="none" stroke="#8b3b1f" strokeWidth="1.8" markerEnd="url(#arrowhead)" />
        <path d="M334 210 C286 210, 246 210, 182 210" fill="none" stroke="#8b3b1f" strokeWidth="1.8" markerEnd="url(#arrowhead)" />
        <path d="M334 278 C286 302, 246 298, 182 270" fill="none" stroke="#8b3b1f" strokeWidth="1.8" markerEnd="url(#arrowhead)" />
        <Label x={366} y={128} anchor="start" fill="#8b3b1f">error flows backward</Label>
        <Label x={366} y={144} anchor="start" size={10} fill="#8b3b1f">so hidden layers can learn</Label>
      </g>

      <g style={getVisibilityStyle({ isVisible: isRecurrentStage, opacity: 1, x: 0, y: 0, scale: 1 })}>
        <Box x={recurrentShellLeftX} y={recurrentShellTopY} width={recurrentShellWidth} height={recurrentShellHeight} fill="#f6f1e8" opacity={1} />
        <g style={getVisibilityStyle({ isVisible: !showUnrolledRnn, opacity: 1, x: 0, y: 0, scale: 1 })}>
          <Line x1={recurrentShellLeftX - 46} y1={210} x2={recurrentShellLeftX} y2={210} />
          <Label x={recurrentShellLeftX - 54} y={202} anchor="end" size={10}>x_t</Label>
          <Line x1={recurrentShellRightX} y1={210} x2={recurrentShellRightX + 52} y2={210} />
          <Label x={recurrentShellRightX + 62} y={202} anchor="start" size={10}>h_t</Label>
          <path d={`M${recurrentShellRightX - 4} ${recurrentShellTopY} C${recurrentShellRightX + 48} ${recurrentShellTopY - 52}, ${recurrentShellLeftX - 48} ${recurrentShellTopY - 52}, ${recurrentShellLeftX + 4} ${recurrentShellTopY}`} fill="none" stroke="#111111" strokeWidth="1.2" markerEnd="url(#arrowhead)" />
          {isSingleRecurrentCellStage ? <Label x={singleRecurrentCellCenterX} y={singleRecurrentCellTopY + singleRecurrentCellHeight - 18} size={9} fill="#6b5f4b">same trained network, now reused over time</Label> : null}
        </g>
      </g>
    </g>
  );
};

const RecurrentCore = ({ cellX, cellY, opacity = 1 }) => {
  const coreInputX = cellX - 28;
  const stateInputX = cellX - 2;
  const hiddenX = cellX + 26;
  const outputX = cellX + 52;
  const namedCoreInputYs = [cellY + 64, cellY + 100];
  const namedHiddenYs = [cellY + 48, cellY + 82, cellY + 116];
  return (
    <g opacity={opacity}>
      {namedCoreInputYs.map(inputY => namedHiddenYs.map(hiddenY => (
        <Line key={`rnn-core-in-${cellX}-${inputY}-${hiddenY}`} x1={coreInputX + 6} y1={inputY} x2={hiddenX - 8} y2={hiddenY} opacity={0.2} markerEnd={undefined} />
      )))}
      {namedHiddenYs.map(hiddenY => (
        <Line key={`rnn-core-state-${cellX}-${hiddenY}`} x1={stateInputX + 6} y1={cellY + 82} x2={hiddenX - 8} y2={hiddenY} opacity={0.16} markerEnd={undefined} />
      ))}
      {namedHiddenYs.map(hiddenY => (
        <Line key={`rnn-core-out-${cellX}-${hiddenY}`} x1={hiddenX + 8} y1={hiddenY} x2={outputX - 8} y2={cellY + 82} opacity={0.22} markerEnd={undefined} />
      ))}
      {namedCoreInputYs.map(inputY => <Node key={`rnn-core-input-${cellX}-${inputY}`} cx={coreInputX} cy={inputY} r={5} opacity={0.82} />)}
      <Node cx={stateInputX} cy={cellY + 82} r={5} fill="#dfeadf" opacity={0.92} />
      {namedHiddenYs.map(hiddenY => <Node key={`rnn-core-hidden-${cellX}-${hiddenY}`} cx={hiddenX} cy={hiddenY} r={6} fill="#f3e6c9" opacity={0.96} />)}
      <Node cx={outputX} cy={cellY + 82} r={6} opacity={0.9} />
      <Label x={cellX + 10} y={cellY + 24} size={9} fill="#6b5f4b">learned transform</Label>
    </g>
  );
};

const RecurrentCell = ({ cellX, opacity = 1 }) => {
  return (
    <g opacity={opacity}>
      <Box x={cellX - recurrentCellWidth / 2} y={recurrentCellTopY} width={recurrentCellWidth} height={recurrentCellHeight} fill="#f6f1e8" opacity={1} />
      <RecurrentCore cellX={cellX} cellY={recurrentCellTopY + 32} opacity={1} />
    </g>
  );
};

const RnnSequence = ({ stageIndex }) => {
  const showUnrolledRnn = stageIndex >= 4;
  const anchorCellX = recurrentStepXs[1];
  const peerCellXs = [recurrentStepXs[0], recurrentStepXs[2]];
  const namedRecurrentStepXs = recurrentStepXs;
  return (
    <g style={getVisibilityStyle({ isVisible: showUnrolledRnn, opacity: 1, x: 0, y: 0, scale: 1 })}>
        {peerCellXs.map(cellX => (
          <RecurrentCell key={`rnn-peer-cell-${cellX}`} cellX={cellX} opacity={1} />
        ))}
        {namedRecurrentStepXs.map((cellX, cellIndex) => {
          const isAnchorCell = cellX === anchorCellX;
          const cellLeftX = cellX - recurrentCellWidth / 2;
          const cellRightX = cellX + recurrentCellWidth / 2;
          const inputLabel = `x${cellIndex + 1}`;
          const outputLabel = cellIndex < namedRecurrentStepXs.length - 1 ? `h${cellIndex + 1}` : 'h_t';
          return (
            <g key={`rnn-sequence-connectors-${cellX}`}>
              {!isAnchorCell ? <Line x1={cellLeftX - 46} y1={210} x2={cellLeftX} y2={210} /> : null}
              <Label x={cellLeftX - 54} y={202} anchor="end" size={10}>{inputLabel}</Label>
              {cellIndex < namedRecurrentStepXs.length - 1 ? <Line x1={cellRightX} y1={210} x2={namedRecurrentStepXs[cellIndex + 1] - recurrentCellWidth / 2} y2={210} /> : <Line x1={cellRightX} y1={210} x2={cellRightX + 52} y2={210} />}
              {cellIndex < namedRecurrentStepXs.length - 1 ? <Label x={cellRightX + 10} y={202} anchor="start" size={10}>{outputLabel}</Label> : <Label x={cellRightX + 62} y={202} anchor="start" size={10}>{outputLabel}</Label>}
            </g>
          );
        })}
        <Label x={350} y={306} size={10} fill="#6b5f4b">...</Label>
    </g>
  );
};

const SingleLstmCellDetail = ({ stageIndex }) => {
  const isVisible = stageIndex >= 5;
  const isMainFocus = stageIndex === 5;
  const namedGateXs = ltsmGateXs;
  const gateLabels = ['forget gate', 'input gate', 'output gate'];
  return (
    <g style={getVisibilityStyle({ isVisible, opacity: isMainFocus ? 1 : 0.34, x: 0, y: isMainFocus ? 8 : 0, scale: isMainFocus ? 1 : 0.9 })}>
      <Box x={110} y={108} width={320} height={214} fill="#f6f1e8" opacity={1} />
      <Line x1={68} y1={220} x2={110} y2={220} />
      <Label x={56} y={212} anchor="end" size={10}>x_t</Label>
      <Line x1={430} y1={220} x2={478} y2={220} />
      <Label x={488} y={212} anchor="start" size={10}>h_t</Label>
      <line x1="132" y1="142" x2="408" y2="142" stroke="#2d6a4f" strokeWidth="1.5" />
      <Label x={414} y={138} anchor="start" size={9} fill="#2d6a4f">cell state</Label>
      <Box x={142} y={170} width={256} height={100} fill="transparent" opacity={0.35} dashed stroke="#6b5f4b" />
      <Label x={270} y={286} size={10} fill="#6b5f4b">faded learned transforms from the earlier network story</Label>
      {namedGateXs.map((gateX, gateIndex) => (
        <g key={`gate-${gateX}`}>
          <Box x={gateX - 36} y={170} width={72} height={72} fill="#dfeadf" opacity={1} />
          <NetworkInset x={gateX - 25} y={184} width={50} height={42} opacity={0.34} />
          <Label x={gateX} y={258} size={9}>{gateLabels[gateIndex]}</Label>
        </g>
      ))}
    </g>
  );
};

const FullLstm = ({ stageIndex }) => {
  const isVisible = stageIndex >= 6;
  const namedRecurrentStepXs = recurrentStepXs;
  return (
    <g style={getVisibilityStyle({ isVisible, opacity: 1, x: 0, y: 0, scale: 1 })}>
      {namedRecurrentStepXs.map((cellX, cellIndex) => (
        <g key={`lstm-step-${cellX}`}>
          <Box x={cellX - 62} y={124} width={124} height={164} fill="#f6f1e8" opacity={1} />
          <line x1={cellX - 46} y1="146" x2={cellX + 46} y2="146" stroke="#2d6a4f" strokeWidth="1.5" />
          <Box x={cellX - 40} y={184} width={26} height={52} fill="#dfeadf" opacity={1} />
          <Box x={cellX - 4} y={184} width={26} height={52} fill="#dfeadf" opacity={1} />
          <Box x={cellX + 32} y={184} width={26} height={52} fill="#dfeadf" opacity={1} />
          <NetworkInset x={cellX - 44} y={174} width={92} height={74} opacity={0.18} showBox />
          <Line x1={cellX - 110} y1={220} x2={cellX - 62} y2={220} />
          <Label x={cellX - 116} y={212} anchor="end" size={10}>{`x${cellIndex + 1}`}</Label>
          {cellIndex < namedRecurrentStepXs.length - 1 ? <Line x1={cellX + 62} y1={220} x2={namedRecurrentStepXs[cellIndex + 1] - 62} y2={220} /> : <Line x1={cellX + 62} y1={220} x2={cellX + 112} y2={220} />}
        </g>
      ))}
    </g>
  );
};

const PostLstmEvolution = ({ stageIndex }) => {
  const isVisible = stageIndex >= 7;
  const namedEmbeddingTokens = embeddingTokenLabels;
  const namedTransformerTokens = transformerTokenLabels;
  const namedSeqSourceLabels = ['src1', 'src2', 'src3'];
  const namedSeqTargetLabels = ['tgt1', 'tgt2', 'tgt3'];
  const namedVitPatchPositions = [
    { x: 96, y: 170 },
    { x: 136, y: 170 },
    { x: 176, y: 170 },
    { x: 96, y: 210 },
    { x: 136, y: 210 },
    { x: 176, y: 210 },
    { x: 96, y: 250 },
    { x: 136, y: 250 },
    { x: 176, y: 250 },
  ];
  const namedScalingLinePoints = [
    'M94 474 C138 446, 192 430, 266 414',
    'M94 492 C142 470, 196 456, 266 444',
  ];
  const namedExpertXs = [858, 920, 982];
  const word2vecOpacity = getStageOpacity(stageIndex, 7, stageIndex >= 12 ? 0.1 : 0.2);
  const seq2seqOpacity = getStageOpacity(stageIndex, 8, stageIndex >= 12 ? 0.12 : 0.26);
  const attentionOpacity = getStageOpacity(stageIndex, 9, 0.3);
  const resnetOpacity = getStageOpacity(stageIndex, 10, 0.26);
  const tokenizationOpacity = getStageOpacity(stageIndex, 11, 0.24);
  const transformerOpacity = getStageOpacity(stageIndex, 12, 1);
  const gpt1Opacity = getStageOpacity(stageIndex, 13, 0.18);
  const bertOpacity = getStageOpacity(stageIndex, 14, stageIndex >= 29 ? 0.1 : 0.2);
  const gpt2Opacity = getStageOpacity(stageIndex, 15, 0.18);
  const scalingOpacity = getStageOpacity(stageIndex, 16, 0.2);
  const gpt3Opacity = getStageOpacity(stageIndex, 17, stageIndex >= 30 ? 0.08 : 0.18);
  const vitOpacity = getStageOpacity(stageIndex, 18, stageIndex >= 26 ? 0.18 : 0.24);
  const moeOpacity = getStageOpacity(stageIndex, 19, 0.22);
  const ropeOpacity = getStageOpacity(stageIndex, 20, 0.2);
  const sftOpacity = getStageOpacity(stageIndex, 21, 0.18);
  const rlhfOpacity = getStageOpacity(stageIndex, 22, 0.18);
  const cotOpacity = getStageOpacity(stageIndex, 23, stageIndex >= 28 ? 0.08 : 0.18);
  const chinchillaOpacity = getStageOpacity(stageIndex, 24, 0.2);
  const flashOpacity = getStageOpacity(stageIndex, 25, stageIndex >= 30 ? 0.08 : 0.18);
  const gpt4Opacity = getStageOpacity(stageIndex, 26, 0.24);
  const longContextOpacity = getStageOpacity(stageIndex, 27, 0.22);
  const ttcOpacity = getStageOpacity(stageIndex, 28, 0.2);
  const ssmOpacity = getStageOpacity(stageIndex, 29, 0.2);
  const toolUseOpacity = getStageOpacity(stageIndex, 30, 0.32);
  const scaffoldOpacity = getStageOpacity(stageIndex, 31, 1);
  const word2vecPosition = parkedPostLstmPositions.word2vec;
  const seq2seqPosition = parkedPostLstmPositions.seq2seq;
  const attentionPosition = parkedPostLstmPositions.attention;
  const resnetPosition = parkedPostLstmPositions.resnet;
  const tokenizationPosition = parkedPostLstmPositions.tokenization;
  const transformerPosition = parkedPostLstmPositions.transformer;
  const gpt1Position = parkedPostLstmPositions.gpt1;
  const bertPosition = parkedPostLstmPositions.bert;
  const gpt2Position = parkedPostLstmPositions.gpt2;
  const scalingPosition = parkedPostLstmPositions.scalinglaws;
  const gpt3Position = parkedPostLstmPositions.gpt3;
  const vitPosition = parkedPostLstmPositions.vit;
  const moePosition = parkedPostLstmPositions.moe;
  const ropePosition = parkedPostLstmPositions.rope;
  const sftPosition = parkedPostLstmPositions.sft;
  const rlhfPosition = parkedPostLstmPositions.rlhf;
  const cotPosition = parkedPostLstmPositions.cot;
  const chinchillaPosition = parkedPostLstmPositions.chinchilla;
  const flashPosition = parkedPostLstmPositions.flash;
  const gpt4Position = parkedPostLstmPositions.gpt4;
  const longContextPosition = parkedPostLstmPositions.longctx;
  const ttcPosition = parkedPostLstmPositions.ttc;
  const ssmPosition = parkedPostLstmPositions.ssm;
  const toolUsePosition = parkedPostLstmPositions.tooluse;
  const scaffoldPosition = parkedPostLstmPositions.scaffold;
  return (
    <g style={getVisibilityStyle({ isVisible, opacity: 1, x: 0, y: 0, scale: 1 })}>
      <g style={getMotionStyle({ opacity: word2vecOpacity, x: word2vecPosition.x, y: word2vecPosition.y, scale: word2vecPosition.scale })}>
        {embeddingTokenXs.map((tokenX, tokenIndex) => (
          <TokenChip key={`embedding-token-${tokenX}`} x={tokenX} y={228} label={namedEmbeddingTokens[tokenIndex]} />
        ))}
        <Panel x={252} y={258} width={330} height={118} title="embedding space" fill="transparent" dashed />
        <Line x1={334} y1={242} x2={334} y2={274} opacity={0.3} markerEnd={undefined} />
        <Line x1={430} y1={242} x2={382} y2={284} opacity={0.3} markerEnd={undefined} />
        <Line x1={526} y1={242} x2={340} y2={334} opacity={0.3} markerEnd={undefined} />
        <Line x1={622} y1={242} x2={392} y2={324} opacity={0.3} markerEnd={undefined} />
        <Line x1={292} y1={352} x2={292} y2={286} opacity={0.34} markerEnd={undefined} />
        <Line x1={292} y1={352} x2={420} y2={352} opacity={0.34} markerEnd={undefined} />
        <Dot cx={382} cy={286} fill="#8b3b1f" r={4} />
        <Dot cx={412} cy={282} fill="#8b3b1f" r={4} />
        <Dot cx={340} cy={334} fill="#2d6a4f" r={4} />
        <Dot cx={392} cy={324} fill="#2d6a4f" r={4} />
        <Label x={382} y={274} size={9} fill="#8b3b1f">king</Label>
        <Label x={412} y={270} size={9} fill="#8b3b1f">queen</Label>
        <Label x={340} y={346} size={9} fill="#2d6a4f">cat</Label>
        <Label x={392} y={338} size={9} fill="#2d6a4f">dog</Label>
      </g>

      <g style={getMotionStyle({ opacity: seq2seqOpacity, x: seq2seqPosition.x, y: seq2seqPosition.y, scale: seq2seqPosition.scale })}>
        <Label x={462} y={206} size={10} fill="#6b5f4b">encoder</Label>
        <Label x={746} y={206} size={10} fill="#6b5f4b">decoder</Label>
        {seqEncoderXs.map((cellX, cellIndex) => (
          <g key={`encoder-cell-${cellX}`}>
            <TokenChip x={cellX} y={236} label={namedSeqSourceLabels[cellIndex]} width={50} />
            <Box x={cellX - 28} y={266} width={56} height={92} fill="#f6f1e8" opacity={1} />
            {cellIndex < seqEncoderXs.length - 1 ? <Line x1={cellX + 28} y1={312} x2={seqEncoderXs[cellIndex + 1] - 28} y2={312} opacity={0.56} /> : null}
          </g>
        ))}
        {seqDecoderXs.map((cellX, cellIndex) => (
          <g key={`decoder-cell-${cellX}`}>
            <Box x={cellX - 28} y={266} width={56} height={92} fill="#f6f1e8" opacity={1} />
            <TokenChip x={cellX} y={388} label={namedSeqTargetLabels[cellIndex]} width={50} />
            {cellIndex < seqDecoderXs.length - 1 ? <Line x1={cellX + 28} y1={312} x2={seqDecoderXs[cellIndex + 1] - 28} y2={312} opacity={0.56} /> : null}
          </g>
        ))}
        <Node cx={604} cy={312} r={10} fill="#f3e6c9" />
        <Line x1={572} y1={312} x2={594} y2={312} opacity={0.7} />
        <Line x1={614} y1={312} x2={636} y2={312} opacity={0.7} />
        <Label x={604} y={248} size={9} fill="#8b3b1f">one bottleneck state</Label>
      </g>

      <g style={getMotionStyle({ opacity: attentionOpacity, x: attentionPosition.x, y: attentionPosition.y, scale: attentionPosition.scale })}>
        <path d="M746 296 C690 242, 612 242, 544 296" fill="none" stroke="#8b3b1f" strokeWidth="1.6" opacity={1} />
        <path d="M746 312 C688 292, 614 292, 462 312" fill="none" stroke="#8b3b1f" strokeWidth="1.6" opacity={1} />
        <path d="M746 328 C692 346, 618 354, 380 328" fill="none" stroke="#8b3b1f" strokeWidth="1.6" opacity={1} />
        <Label x={790} y={286} anchor="start" size={10} fill="#8b3b1f">soft alignment</Label>
      </g>

      <g style={getMotionStyle({ opacity: resnetOpacity, x: resnetPosition.x, y: resnetPosition.y, scale: resnetPosition.scale })}>
        <Panel x={854} y={214} width={152} height={110} title="residual block" />
        <Panel x={894} y={246} width={72} height={48} title="F(x)" titleAnchor="middle" titleX={930} />
        <path d="M828 270 C848 238, 848 226, 854 226" fill="none" stroke="#111111" strokeWidth="1.2" />
        <path d="M1006 226 C1016 226, 1016 238, 1030 270" fill="none" stroke="#111111" strokeWidth="1.2" />
        <Line x1={818} y1={270} x2={894} y2={270} opacity={0.84} markerEnd={undefined} />
        <Line x1={966} y1={270} x2={1038} y2={270} opacity={0.84} markerEnd={undefined} />
        <Label x={930} y={312} size={10} fill="#6b5f4b">x + F(x)</Label>
      </g>

      <g style={getMotionStyle({ opacity: tokenizationOpacity, x: tokenizationPosition.x, y: tokenizationPosition.y, scale: tokenizationPosition.scale })}>
        <Panel x={284} y={408} width={326} height={66} title="split rare text into reusable pieces" fill="transparent" dashed />
        <TokenChip x={362} y={444} label="token" width={62} />
        <TokenChip x={448} y={444} label="ization" width={76} />
        <TokenChip x={540} y={444} label="##ing" width={64} fill="#dfeadf" />
      </g>

      <g style={getMotionStyle({ opacity: transformerOpacity, x: transformerPosition.x, y: transformerPosition.y, scale: transformerPosition.scale })}>
        <Panel x={394} y={186} width={364} height={254} title="parallel token processing" fill="transparent" dashed stroke="#6b5f4b" />
        <Panel x={422} y={248} width={308} height={46} title="ffn + skip" titleAnchor="middle" titleX={576} />
        <Panel x={422} y={314} width={308} height={50} title="self-attention" titleAnchor="middle" titleX={576} />
        {transformerTokenXs.map((tokenX, tokenIndex) => (
          <g key={`transformer-token-${tokenX}`}>
            <TokenChip x={tokenX} y={404} label={namedTransformerTokens[tokenIndex]} width={54} />
            <Line x1={tokenX} y1={392} x2={tokenX} y2={364} opacity={0.46} markerEnd={undefined} />
            <Line x1={tokenX} y1={314} x2={tokenX} y2={294} opacity={0.26} markerEnd={undefined} />
            <Label x={tokenX} y={434} size={8} fill="#6b5f4b">+pos</Label>
          </g>
        ))}
        <path d="M442 382 C488 344, 650 344, 700 382" fill="none" stroke="#8b3b1f" strokeWidth="1.4" opacity={0.76} />
        <path d="M528 382 C558 360, 610 360, 614 382" fill="none" stroke="#8b3b1f" strokeWidth="1.4" opacity={0.76} />
        <path d="M614 382 C652 354, 676 352, 700 382" fill="none" stroke="#8b3b1f" strokeWidth="1.4" opacity={0.76} />
      </g>

      <g style={getMotionStyle({ opacity: gpt1Opacity, x: gpt1Position.x, y: gpt1Position.y, scale: gpt1Position.scale })}>
        <Panel x={348} y={454} width={174} height={70} title="pre-train on raw text" />
        <Panel x={572} y={454} width={128} height={70} title="fine-tune" />
        <Line x1={436} y1={454} x2={520} y2={432} opacity={0.44} />
        <Line x1={616} y1={454} x2={616} y2={432} opacity={0.44} />
        <Label x={436} y={490} size={9}>next-word loss</Label>
        <Label x={636} y={490} size={9}>labeled tasks</Label>
      </g>

      <g style={getMotionStyle({ opacity: bertOpacity, x: bertPosition.x, y: bertPosition.y, scale: bertPosition.scale })}>
        <Panel x={84} y={190} width={214} height={120} title="encoder + [MASK]" />
        <TokenChip x={130} y={226} label="river" width={54} />
        <TokenChip x={192} y={226} label="[MASK]" width={64} fill="#dfeadf" />
        <TokenChip x={258} y={226} label="fish" width={52} />
        <Panel x={116} y={252} width={150} height={24} title="bidirectional" titleAnchor="middle" titleX={191} />
        <path d="M130 238 C156 256, 232 256, 258 238" fill="none" stroke="#8b3b1f" strokeWidth="1.4" opacity={0.76} />
        <path d="M258 246 C224 274, 166 274, 130 246" fill="none" stroke="#8b3b1f" strokeWidth="1.4" opacity={0.76} />
      </g>

      <g style={getMotionStyle({ opacity: gpt2Opacity, x: gpt2Position.x, y: gpt2Position.y, scale: gpt2Position.scale })}>
        <Panel x={500} y={176} width={152} height={46} title="same decoder, scaled up" titleAnchor="middle" titleX={576} />
        <Line x1={530} y1={218} x2={530} y2={186} opacity={0.4} markerEnd={undefined} />
        <Line x1={576} y1={218} x2={576} y2={182} opacity={0.7} markerEnd={undefined} />
        <Line x1={622} y1={218} x2={622} y2={176} opacity={1} markerEnd={undefined} />
      </g>

      <g style={getMotionStyle({ opacity: scalingOpacity, x: scalingPosition.x, y: scalingPosition.y, scale: scalingPosition.scale })}>
        <Panel x={68} y={398} width={222} height={112} title="loss vs scale" fill="transparent" dashed />
        <Line x1={96} y1={488} x2={96} y2={420} opacity={0.42} markerEnd={undefined} />
        <Line x1={96} y1={488} x2={264} y2={488} opacity={0.42} markerEnd={undefined} />
        {namedScalingLinePoints.map((pathD, pathIndex) => (
          <path key={`scaling-path-${pathIndex}`} d={pathD} fill="none" stroke="#8b3b1f" strokeWidth="1.5" opacity={0.92 - pathIndex * 0.22} />
        ))}
        <Label x={152} y={506} size={9}>params / data / compute</Label>
      </g>

      <g style={getMotionStyle({ opacity: gpt3Opacity, x: gpt3Position.x, y: gpt3Position.y, scale: gpt3Position.scale })}>
        <Panel x={820} y={170} width={216} height={130} title="few-shot prompt" />
        <Label x={836} y={202} anchor="start" size={9}>EN: cat</Label>
        <Label x={836} y={218} anchor="start" size={9}>FR: chat</Label>
        <Label x={836} y={238} anchor="start" size={9}>EN: dog</Label>
        <Label x={836} y={254} anchor="start" size={9}>FR: chien</Label>
        <Label x={836} y={278} anchor="start" size={9} fill="#8b3b1f">EN: bird  -&gt; ?</Label>
      </g>

      <g style={getMotionStyle({ opacity: vitOpacity, x: vitPosition.x, y: vitPosition.y, scale: vitPosition.scale })}>
        <Panel x={70} y={150} width={150} height={150} title="image patches" />
        {namedVitPatchPositions.map(patchPosition => (
          <Box key={`vit-patch-${patchPosition.x}-${patchPosition.y}`} x={patchPosition.x} y={patchPosition.y} width={34} height={34} fill="transparent" opacity={0.52} />
        ))}
        <Line x1={220} y1={226} x2={376} y2={226} opacity={0.34} />
        <Label x={248} y={214} anchor="start" size={9}>patches become tokens</Label>
      </g>

      <g style={getMotionStyle({ opacity: moeOpacity, x: moePosition.x, y: moePosition.y, scale: moePosition.scale })}>
        <Panel x={826} y={302} width={208} height={120} title="router -> experts" />
        <Box x={848} y={338} width={48} height={38} fill="#dfeadf" opacity={1} />
        <Label x={872} y={362} size={9}>router</Label>
        {namedExpertXs.map(expertX => (
          <g key={`expert-${expertX}`}>
            <Box x={expertX - 24} y={342} width={48} height={30} fill="#f6f1e8" opacity={1} />
            <Label x={expertX} y={360} size={8}>expert</Label>
            <Line x1={896} y1={356} x2={expertX - 24} y2={356} opacity={0.3} markerEnd={undefined} />
          </g>
        ))}
      </g>

      <g style={getMotionStyle({ opacity: ropeOpacity, x: ropePosition.x, y: ropePosition.y, scale: ropePosition.scale })}>
        <Panel x={312} y={184} width={98} height={84} title="RoPE" titleAnchor="middle" titleX={361} />
        <circle cx="360" cy="228" r="24" fill="none" stroke="#111111" strokeWidth="1.2" opacity="0.45" />
        <path d="M360 228 L378 210" fill="none" stroke="#8b3b1f" strokeWidth="1.8" />
        <path d="M360 228 L348 248" fill="none" stroke="#2d6a4f" strokeWidth="1.8" />
        <Label x={360} y={258} size={8}>relative rotation</Label>
      </g>

      <g style={getMotionStyle({ opacity: sftOpacity, x: sftPosition.x, y: sftPosition.y, scale: sftPosition.scale })}>
        <Panel x={324} y={442} width={384} height={90} title="instruction -> response examples" />
        <Label x={344} y={476} anchor="start" size={9}>Write a haiku about rain.</Label>
        <Label x={344} y={494} anchor="start" size={9} fill="#6b5f4b">Soft drops on dark leaves ...</Label>
        <Label x={344} y={516} anchor="start" size={9}>Translate to French.</Label>
      </g>

      <g style={getMotionStyle({ opacity: rlhfOpacity, x: rlhfPosition.x, y: rlhfPosition.y, scale: rlhfPosition.scale })}>
        <Panel x={304} y={438} width={422} height={102} title="preferences -> reward model -> policy" />
        <Panel x={326} y={474} width={94} height={42} title="response A" titleAnchor="middle" titleX={373} />
        <Panel x={434} y={474} width={94} height={42} title="response B" titleAnchor="middle" titleX={481} />
        <Panel x={556} y={474} width={88} height={42} title="reward" titleAnchor="middle" titleX={600} />
        <Panel x={664} y={474} width={40} height={42} title="PPO" titleAnchor="middle" titleX={684} />
        <Line x1={528} y1={495} x2={556} y2={495} opacity={0.34} />
        <Line x1={644} y1={495} x2={664} y2={495} opacity={0.34} />
        <path d="M704 495 C726 488, 726 454, 642 454" fill="none" stroke="#8b3b1f" strokeWidth="1.4" opacity={0.78} />
      </g>

      <g style={getMotionStyle({ opacity: cotOpacity, x: cotPosition.x, y: cotPosition.y, scale: cotPosition.scale })}>
        <Panel x={820} y={322} width={214} height={110} title="think step by step" />
        <Label x={838} y={354} anchor="start" size={9}>60 x 2.5 = 150</Label>
        <Label x={838} y={372} anchor="start" size={9}>check units</Label>
        <Label x={838} y={390} anchor="start" size={9}>answer: 150 miles</Label>
      </g>

      <g style={getMotionStyle({ opacity: chinchillaOpacity, x: chinchillaPosition.x, y: chinchillaPosition.y, scale: chinchillaPosition.scale })}>
        <Line x1={122} y1={430} x2={238} y2={430} opacity={0.2} markerEnd={undefined} />
        <Line x1={166} y1={430} x2={166} y2={462} opacity={0.74} markerEnd={undefined} />
        <Line x1={216} y1={430} x2={216} y2={474} opacity={1} markerEnd={undefined} />
        <Label x={194} y={414} size={9} fill="#2d6a4f">more data at fixed compute</Label>
      </g>

      <g style={getMotionStyle({ opacity: flashOpacity, x: flashPosition.x, y: flashPosition.y, scale: flashPosition.scale })}>
        <Panel x={798} y={446} width={228} height={82} title="tile attention in SRAM" />
        <Box x={820} y={474} width={34} height={34} fill="transparent" opacity={0.48} />
        <Box x={856} y={474} width={34} height={34} fill="#dfeadf" opacity={1} />
        <Box x={892} y={474} width={34} height={34} fill="transparent" opacity={0.48} />
        <Line x1={930} y1={490} x2={972} y2={490} opacity={0.34} markerEnd={undefined} />
        <Label x={980} y={484} anchor="start" size={9}>SRAM</Label>
        <Label x={980} y={500} anchor="start" size={9} fill="#6b5f4b">avoid full NxN write</Label>
      </g>

      <g style={getMotionStyle({ opacity: gpt4Opacity, x: gpt4Position.x, y: gpt4Position.y, scale: gpt4Position.scale })}>
        <Line x1={220} y1={226} x2={394} y2={402} opacity={0.28} />
        <Label x={242} y={240} anchor="start" size={9}>image embeddings join text tokens</Label>
      </g>

      <g style={getMotionStyle({ opacity: longContextOpacity, x: longContextPosition.x, y: longContextPosition.y, scale: longContextPosition.scale })}>
        <Panel x={388} y={154} width={360} height={42} title="2K tokens  ->  100K+" titleAnchor="middle" titleX={568} fill="transparent" dashed />
        <Line x1={420} y1={182} x2={716} y2={182} opacity={0.34} markerEnd={undefined} />
        <Line x1={476} y1={176} x2={476} y2={188} opacity={0.5} markerEnd={undefined} />
        <Line x1={684} y1={176} x2={684} y2={188} opacity={0.86} markerEnd={undefined} />
      </g>

      <g style={getMotionStyle({ opacity: ttcOpacity, x: ttcPosition.x, y: ttcPosition.y, scale: ttcPosition.scale })}>
        <Panel x={802} y={314} width={234} height={118} title="extra reasoning budget" />
        <Label x={820} y={352} anchor="start" size={9}>draft</Label>
        <Label x={820} y={370} anchor="start" size={9}>check</Label>
        <Label x={820} y={388} anchor="start" size={9}>backtrack</Label>
        <Label x={820} y={406} anchor="start" size={9}>final answer</Label>
        <Line x1={906} y1={344} x2={982} y2={344} opacity={0.22} markerEnd={undefined} />
        <Line x1={906} y1={362} x2={1008} y2={362} opacity={0.42} markerEnd={undefined} />
        <Line x1={906} y1={380} x2={1024} y2={380} opacity={0.68} markerEnd={undefined} />
      </g>

      <g style={getMotionStyle({ opacity: ssmOpacity, x: ssmPosition.x, y: ssmPosition.y, scale: ssmPosition.scale })}>
        <Panel x={74} y={300} width={224} height={84} title="linear state mixer" />
        <Node cx={120} cy={344} r={6} fill="#dfeadf" />
        <Node cx={166} cy={344} r={6} fill="#dfeadf" />
        <Node cx={212} cy={344} r={6} fill="#dfeadf" />
        <Node cx={258} cy={344} r={6} fill="#dfeadf" />
        <Line x1={126} y1={344} x2={160} y2={344} opacity={0.44} />
        <Line x1={172} y1={344} x2={206} y2={344} opacity={0.44} />
        <Line x1={218} y1={344} x2={252} y2={344} opacity={0.44} />
        <Label x={186} y={370} size={9}>O(N) state updates</Label>
      </g>

      <g style={getMotionStyle({ opacity: toolUseOpacity, x: toolUsePosition.x, y: toolUsePosition.y, scale: toolUsePosition.scale })}>
        <Panel x={782} y={156} width={264} height={208} title="tool call loop" fill="transparent" dashed />
        <Panel x={808} y={198} width={76} height={42} title="model" titleAnchor="middle" titleX={846} />
        <Panel x={914} y={198} width={86} height={42} title="JSON call" titleAnchor="middle" titleX={957} />
        <Panel x={888} y={282} width={84} height={42} title="tool" titleAnchor="middle" titleX={930} />
        <Label x={930} y={352} size={9}>observation</Label>
        <Line x1={884} y1={219} x2={914} y2={219} opacity={0.34} />
        <Line x1={957} y1={240} x2={930} y2={282} opacity={0.34} />
        <path d="M930 324 C930 346, 832 346, 832 240" fill="none" stroke="#8b3b1f" strokeWidth="1.4" opacity={0.82} />
      </g>

      <g style={getMotionStyle({ opacity: scaffoldOpacity, x: scaffoldPosition.x, y: scaffoldPosition.y, scale: scaffoldPosition.scale })}>
        <Panel x={742} y={144} width={318} height={362} title="agent scaffold" fill="transparent" dashed />
        <Panel x={770} y={392} width={114} height={74} title="fresh context loop" />
        <Panel x={894} y={392} width={134} height={74} title="files as memory" />
        <Panel x={780} y={302} width={120} height={54} title="mode prompts" />
        <Panel x={918} y={302} width={100} height={54} title="permissions" />
        <Line x1={827} y1={392} x2={827} y2={356} opacity={0.34} />
        <Line x1={962} y1={392} x2={962} y2={356} opacity={0.34} />
        <path d="M1028 430 C1046 430, 1046 190, 846 190" fill="none" stroke="#2d6a4f" strokeWidth="1.5" opacity={0.82} />
        <Label x={962} y={486} size={9}>disk, git, todo files</Label>
      </g>
    </g>
  );
};

export const AnimatedLineageDiagram = ({ type, className, targetStageIndex }) => {
  const resolvedTargetStageIndex = targetStageIndex ?? getTargetStageIndex(type);
  const [displayStageIndex, setDisplayStageIndex] = useState(resolvedTargetStageIndex);

  useEffect(() => {
    if (displayStageIndex === resolvedTargetStageIndex) return;
    const direction = resolvedTargetStageIndex > displayStageIndex ? 1 : -1;
    const timer = window.setTimeout(() => {
      setDisplayStageIndex(currentStageIndex => currentStageIndex === resolvedTargetStageIndex ? currentStageIndex : currentStageIndex + direction);
    }, 240);
    return () => window.clearTimeout(timer);
  }, [displayStageIndex, resolvedTargetStageIndex]);

  const currentStage = stageDefinitions[displayStageIndex];
  const isFallbackType = stageIndexesByType[type] == null;
  const sceneScale = displayStageIndex < 7 ? earlySceneScale : lateSceneScale;
  const sceneOffsetX = displayStageIndex < 7 ? earlySceneOffsetX : lateSceneOffsetX;
  const sceneOffsetY = displayStageIndex < 7 ? earlySceneOffsetY : lateSceneOffsetY;

  return (
    <div className={className} style={{ maxWidth: `${compactDiagramWidth}px`, margin: '0 auto' }}>
      <svg viewBox={`0 0 ${compactDiagramWidth} ${compactDiagramHeight}`} className="w-full h-auto overflow-visible">
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 z" fill="#111111" />
          </marker>
        </defs>
        <g>
          <DiagramStageText label={currentStage.label} detailLines={currentStage.detailLines} isFallback={isFallbackType} />
          <g transform={`translate(${sceneOffsetX} ${sceneOffsetY}) scale(${sceneScale})`}>
            <g style={getMotionStyle({ opacity: displayStageIndex >= 7 ? 0.14 : 1, x: displayStageIndex >= 7 ? 12 : 0, y: displayStageIndex >= 7 ? 8 : 0, scale: displayStageIndex >= 7 ? 0.72 : 1 })}>
              <PerceptronToNetwork stageIndex={displayStageIndex} />
              <RnnSequence stageIndex={displayStageIndex} />
              <SingleLstmCellDetail stageIndex={displayStageIndex} />
              <FullLstm stageIndex={displayStageIndex} />
            </g>
            <PostLstmEvolution stageIndex={displayStageIndex} />
          </g>
        </g>
      </svg>
    </div>
  );
};
