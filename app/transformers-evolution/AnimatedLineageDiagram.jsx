'use client';
import { useEffect, useState } from 'react';

const stageDefinitions = [
  {
    id: 'perceptron',
    label: 'Perceptron',
    detail: 'A single learned node combines inputs into one decision.',
  },
  {
    id: 'mlpNoBackprop',
    label: 'Multilayer network with no backprop',
    detail: 'Adding layers makes the network expressive enough in theory, but the hidden layers still have no practical training rule.',
  },
  {
    id: 'mlpBackprop',
    label: 'Backpropagation',
    detail: 'The same multilayer network becomes trainable once error signals can flow backward through it.',
  },
  {
    id: 'rnnCell',
    label: 'Single recurrent cell',
    detail: 'A recurrent cell is the earlier learned network plus a hidden-state input, so the same core can be reused over time.',
  },
  {
    id: 'unrolledRnn',
    label: 'Unrolled RNN',
    detail: 'That same recurrent cell is then repeated across several timesteps so sequence processing becomes visible.',
  },
  {
    id: 'lstmCellDetail',
    label: 'Single LSTM cell detail',
    detail: 'Before showing a whole sequence, the gates and cell state are unpacked inside one upgraded recurrent cell.',
  },
  {
    id: 'fullLstm',
    label: 'Full LSTM',
    detail: 'The upgraded cell now repeats across time, preserving longer-range state with gated memory.',
  },
];

const stageIndexesByType = {
  perceptron: [0],
  backprop: [1, 2],
  rnn: [3, 4],
  lstm: [5, 6],
};

const layerNodeYs = [148, 210, 272];
const hiddenLayerNodeYs = [162, 210, 258];
const ltsmGateXs = [170, 270, 370];
const recurrentStepXs = [170, 350, 530];
const recurrentCellTopY = 124;
const recurrentCellWidth = 132;
const recurrentCellHeight = 164;

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

const Node = ({ cx, cy, r = 11, fill = '#f6f1e8', opacity = 1 }) => {
  return <circle cx={cx} cy={cy} r={r} fill={fill} stroke="#111111" strokeWidth="1.2" opacity={opacity} />;
};

const Box = ({ x, y, width, height, fill = 'transparent', opacity = 1, dashed = false, stroke = '#111111' }) => {
  return <rect x={x} y={y} width={width} height={height} fill={fill} stroke={stroke} strokeWidth="1.2" opacity={opacity} strokeDasharray={dashed ? '5 4' : undefined} />;
};

const Line = ({ x1, y1, x2, y2, opacity = 1, dashed = false, markerEnd = 'url(#arrowhead)' }) => {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#111111" strokeWidth="1.2" opacity={opacity} strokeDasharray={dashed ? '4 4' : undefined} markerEnd={markerEnd} />;
};

const Label = ({ x, y, children, anchor = 'middle', opacity = 1, size = 12, fill = '#111111' }) => {
  return <text x={x} y={y} textAnchor={anchor} fontSize={size} fill={fill} opacity={opacity}>{children}</text>;
};

const StageHeading = ({ label, detail, isFallback }) => {
  return (
    <div className="mb-4 font-sans">
      <div className="text-[0.72em] uppercase tracking-[0.18em] text-black">Animated Early Arc</div>
      <div className="mt-2 text-[1.15em] text-te-primary">{label}</div>
      <div className="mt-1 text-[0.92em] leading-relaxed text-te-secondary">{detail}</div>
      {isFallback ? <div className="mt-2 text-[0.76em] uppercase tracking-[0.14em] text-te-accent">Later innovations still route through this early arc for now.</div> : null}
    </div>
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
  const recurrentAnchorRightX = recurrentAnchorCellX + recurrentCellWidth / 2;
  const recurrentNetworkOffsetX = recurrentAnchorCellX - networkCenterX;
  const recurrentNetworkOffsetY = -4;
  const recurrentNetworkScale = showUnrolledRnn ? 0.44 : 0.48;
  const recurrentNetworkOpacity = showUnrolledRnn ? 0.28 : 0.4;
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

      <g style={getVisibilityStyle({ isVisible: isPerceptronStage, opacity: 1, x: 0, y: 0, scale: 1 })}>
        <Label x={perceptronHiddenX} y={330}>Perceptron</Label>
        <Label x={perceptronHiddenX} y={348} size={10} fill="#6b5f4b">weighted sum + threshold</Label>
      </g>

      <g style={getVisibilityStyle({ isVisible: isNetworkVisible && !isRecurrentStage, opacity: 1, x: 0, y: 0, scale: 1 })}>
        <Label x={204} y={84}>{showBackprop ? 'Trainable multilayer network' : 'Multilayer network with no backprop'}</Label>
        <Label x={204} y={102} size={10} fill="#6b5f4b">{showBackprop ? 'the original perceptron becomes one hidden unit as more trainable structure appears around it' : 'the original perceptron now sits inside a larger hidden layer, but training it remains impractical'}</Label>
      </g>

      <g style={getVisibilityStyle({ isVisible: showBackprop, opacity: 1, x: 0, y: 0, scale: 1 })}>
        <path d="M334 142 C286 118, 246 122, 182 150" fill="none" stroke="#8b3b1f" strokeWidth="1.8" markerEnd="url(#arrowhead)" />
        <path d="M334 210 C286 210, 246 210, 182 210" fill="none" stroke="#8b3b1f" strokeWidth="1.8" markerEnd="url(#arrowhead)" />
        <path d="M334 278 C286 302, 246 298, 182 270" fill="none" stroke="#8b3b1f" strokeWidth="1.8" markerEnd="url(#arrowhead)" />
        <Label x={366} y={128} anchor="start" fill="#8b3b1f">error flows backward</Label>
        <Label x={366} y={144} anchor="start" size={10} fill="#8b3b1f">so hidden layers can learn</Label>
      </g>

      <g style={getVisibilityStyle({ isVisible: isRecurrentStage, opacity: 1, x: 0, y: 0, scale: 1 })}>
        <Box x={recurrentAnchorLeftX} y={recurrentCellTopY} width={recurrentCellWidth} height={recurrentCellHeight} fill="#f6f1e8" opacity={1} />
        <g style={getVisibilityStyle({ isVisible: !showUnrolledRnn, opacity: 1, x: 0, y: 0, scale: 1 })}>
          <Line x1={recurrentAnchorLeftX - 46} y1={210} x2={recurrentAnchorLeftX} y2={210} />
          <Label x={recurrentAnchorLeftX - 54} y={202} anchor="end" size={10}>x_t</Label>
          <Line x1={recurrentAnchorRightX} y1={210} x2={recurrentAnchorRightX + 52} y2={210} />
          <Label x={recurrentAnchorRightX + 62} y={202} anchor="start" size={10}>h_t</Label>
          <path d={`M${recurrentAnchorRightX - 4} 124 C${recurrentAnchorRightX + 44} 72, ${recurrentAnchorLeftX - 44} 72, ${recurrentAnchorLeftX + 4} 124`} fill="none" stroke="#111111" strokeWidth="1.2" markerEnd="url(#arrowhead)" />
          <Label x={recurrentAnchorCellX} y={90} size={10}>the earlier learned network now sits inside one recurrent cell</Label>
          <Label x={recurrentAnchorCellX} y={310}>Single recurrent cell</Label>
          <Label x={recurrentAnchorCellX} y={326} size={10} fill="#6b5f4b">we zoom out, keep the trained network visible, and route the previous hidden state back into it</Label>
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
        <Label x={350} y={96}>The same recurrent cell, unrolled across time</Label>
        <Label x={350} y={114} size={10} fill="#6b5f4b">the middle cell is still the earlier trained network, while neighboring timesteps fade in around it</Label>
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
      <Label x={270} y={88}>A single LSTM cell exposes the gates explicitly</Label>
      <Label x={270} y={104} size={10} fill="#6b5f4b">each gate is still built from learned transforms, but now it controls memory flow</Label>
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
      <Label x={350} y={92}>Full LSTM sequence</Label>
      <Label x={350} y={108} size={10} fill="#2d6a4f">the upgraded recurrent cell repeats across time while carrying a gated cell state</Label>
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

  return (
    <div className={className}>
      <StageHeading label={currentStage.label} detail={currentStage.detail} isFallback={isFallbackType} />
      <svg viewBox="0 0 700 420" className="w-full h-auto overflow-visible">
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 z" fill="#111111" />
          </marker>
        </defs>
        <g>
          <PerceptronToNetwork stageIndex={displayStageIndex} />
          <RnnSequence stageIndex={displayStageIndex} />
          <SingleLstmCellDetail stageIndex={displayStageIndex} />
          <FullLstm stageIndex={displayStageIndex} />
        </g>
      </svg>
    </div>
  );
};
