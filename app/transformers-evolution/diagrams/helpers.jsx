'use client';
import Tooltip from '@/app/common/Tooltip';
import { C } from '../colors';

export const FS = 9;
export const FSV = 9;

const arrM = <marker id="ah" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto"><path d="M0,0 L7,2.5 L0,5" fill={C.dim}/></marker>;

export const defs = <defs>{arrM}</defs>;
export const vb = "0 0 210 130";
export const ss = "block w-full h-auto";

const diagramTooltipContentClass =
  '!bg-[#fff] !text-[#1a1a1a] border border-neutral-300 shadow-lg text-[0.85em] leading-normal rounded-md p-2 font-[inherit]';

function getBalancedWrappedLines(text, maxWidth, fontSize) {
  const normalizedText = String(text ?? '');
  const maxCharsPerLine = maxWidth ? Math.max(1, Math.floor(maxWidth / Math.max(fontSize * 0.62, 1))) : null;
  const wrapSegment = segment => {
    const trimmedSegment = segment.trim();
    if (!trimmedSegment) return [''];
    if (!maxCharsPerLine || trimmedSegment.length <= maxCharsPerLine || !/\s/.test(trimmedSegment)) return [trimmedSegment];
    const words = trimmedSegment.split(/\s+/);
    const wordCount = words.length;
    const prefixLengths = [0];
    for (const word of words) prefixLengths.push(prefixLengths[prefixLengths.length - 1] + word.length);
    const getLineLength = (startIdx, endIdx) => prefixLengths[endIdx] - prefixLengths[startIdx] + Math.max(0, endIdx - startIdx - 1);
    const estimatedLineCount = Math.max(2, Math.ceil(trimmedSegment.length / maxCharsPerLine));
    const targetLineLength = trimmedSegment.length / estimatedLineCount;
    const bestCostByLineCount = Array.from({ length: estimatedLineCount + 1 }, () => Array(wordCount + 1).fill(Infinity));
    const previousBreakByLineCount = Array.from({ length: estimatedLineCount + 1 }, () => Array(wordCount + 1).fill(-1));
    bestCostByLineCount[0][0] = 0;
    for (let lineCount = 1; lineCount <= estimatedLineCount; lineCount += 1) {
      for (let endWordIdx = 1; endWordIdx <= wordCount; endWordIdx += 1) {
        for (let startWordIdx = lineCount - 1; startWordIdx < endWordIdx; startWordIdx += 1) {
          const lineLength = getLineLength(startWordIdx, endWordIdx);
          const overflow = Math.max(0, lineLength - maxCharsPerLine);
          const cost = bestCostByLineCount[lineCount - 1][startWordIdx] + Math.pow(lineLength - targetLineLength, 2) + overflow * overflow * 8;
          if (cost < bestCostByLineCount[lineCount][endWordIdx]) {
            bestCostByLineCount[lineCount][endWordIdx] = cost;
            previousBreakByLineCount[lineCount][endWordIdx] = startWordIdx;
          }
        }
      }
    }
    if (!Number.isFinite(bestCostByLineCount[estimatedLineCount][wordCount])) return [trimmedSegment];
    const balancedLines = [];
    let currentLineCount = estimatedLineCount;
    let currentWordIdx = wordCount;
    while (currentLineCount > 0) {
      const previousWordIdx = previousBreakByLineCount[currentLineCount][currentWordIdx];
      if (previousWordIdx < 0) return [trimmedSegment];
      balancedLines.unshift(words.slice(previousWordIdx, currentWordIdx).join(' '));
      currentWordIdx = previousWordIdx;
      currentLineCount -= 1;
    }
    return balancedLines;
  };
  return normalizedText.split('\n').flatMap(segment => wrapSegment(segment));
}

function renderWrappedSvgText(x, y, text, fontSize, color, maxWidth, opacity) {
  const wrappedLines = getBalancedWrappedLines(text, maxWidth, fontSize);
  if (wrappedLines.length === 1) return <text x={x} y={y} textAnchor="middle" fill={color} fontSize={fontSize} fontFamily="sans-serif" opacity={opacity}>{wrappedLines[0]}</text>;
  return <text x={x} y={y} textAnchor="middle" fill={color} fontSize={fontSize} fontFamily="sans-serif" opacity={opacity}>{wrappedLines.map((line, idx) => <tspan key={idx} x={x} dy={idx === 0 ? `${-(wrappedLines.length - 1) * 0.55}em` : '1.1em'}>{line}</tspan>)}</text>;
}

/** SVG group with hover tooltip (must use `g`, not `span`, inside `<svg>`). */
export function DiagramTip({ detail, children }) {
  return (
    <Tooltip
      as="g"
      content={detail}
      placement="top-start"
      maxWidth={300}
      noMargin
      contentClassName={diagramTooltipContentClass}
      wrapperClassName="cursor-help"
    >
      {children}
    </Tooltip>
  );
}

export function getDiagramHelpers() {
  const box = (x,y,w,h,fill,label,detail,fs=FS) => { return (
    <Tooltip
      as="g"
      content={detail}
      placement="top-start"
      maxWidth={300}
      noMargin
      contentClassName={diagramTooltipContentClass}
      wrapperClassName="cursor-help"
    >
      <rect x={x} y={y} width={w} height={h} rx={3} fill={fill} opacity={0.9}/>
      {renderWrappedSvgText(x+w/2, y+h/2+3, label, fs, "#f0ece4", w - 8)}
    </Tooltip>
  ); };
  return { box };
}

export const arr = (x1,y1,x2,y2) => <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.dim} strokeWidth={1} markerEnd="url(#ah)"/>;
export const lbl = (x,y,text,fs=FS,color="#666",maxWidth) => renderWrappedSvgText(x, y, text, fs, color, maxWidth ?? (String(text ?? '').trim().length > 24 && /\s/.test(String(text ?? '')) ? Math.max(36, Math.min(252, 2 * Math.min(x, 260 - x) - 8)) : null));

/** Pointwise op circle — σ, tanh, +, × — per design principles: circles for element-wise ops. */
export function op(x, y, symbol, detail, { r=9, color=C.dim, fill='none' }={}) {
  return (
    <DiagramTip detail={detail}>
      <circle cx={x} cy={y} r={r} fill={fill} stroke={color} strokeWidth={1.2}/>
      <text x={x} y={y+3.5} textAnchor="middle" fill={color} fontSize={FS} fontFamily="sans-serif" fontWeight={600}>{symbol}</text>
    </DiagramTip>
  );
}

/** Ghost box — dimmed version of a predecessor's element, shown for visual diffing. */
export function ghostBox(x, y, w, h, label, detail, fs=FSV) {
  const sz = fs;
  return (
    <DiagramTip detail={detail}>
      <rect x={x} y={y} width={w} height={h} rx={3} fill="none" stroke={C.dim} strokeWidth={0.8} strokeDasharray="3,2" opacity={0.5}/>
      {renderWrappedSvgText(x+w/2, y+h/2+3, label, sz, C.dim, w - 8, 0.5)}
    </DiagramTip>
  );
}
