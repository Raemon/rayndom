'use client';
import Tooltip from '@/app/common/Tooltip';
import { glossary } from './glossary';
import { C } from './colors';

const sortedTerms = Object.keys(glossary).sort((a, b) => b.length - a.length);
const escaped = sortedTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
const jargonRegex = escaped.length > 0
  ? new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi')
  : null;

function findTerm(part) {
  const lower = part.toLowerCase();
  return sortedTerms.find(t => t.toLowerCase() === lower);
}

const MAX_DEPTH = 2;

export const JargonSpan = ({ term, matchedText, depth }) => {
  const def = glossary[term];
  const canNest = depth < MAX_DEPTH - 1;
  return (
    <Tooltip
      content={
        <>
          <strong style={{ color: C.textAccent }}>{term}:</strong>{' '}
          {canNest ? <JargonText depth={depth + 1}>{def}</JargonText> : def}
        </>
      }
      interactive={canNest}
      leaveDelayMs={canNest ? 200 : 0}
      placement="bottom-start"
      maxWidth={300}
      zIndex={1000 + depth * 10}
      contentClassName="!bg-white !text-[#1a1a1a] border border-neutral-300 shadow-lg text-[0.85em] leading-normal font-['Source_Serif_4',Georgia,serif]"
      wrapperStyle={{ cursor: 'help', borderBottom: '1px dashed rgba(0,0,0,0.3)' }}
    >
      <span>{matchedText}</span>
    </Tooltip>
  );
};

export const JargonText = ({ children, depth = 0 }) => {
  if (typeof children !== 'string' || !jargonRegex || depth >= MAX_DEPTH) return children || null;
  const parts = children.split(jargonRegex);
  return parts.map((part, i) => {
    const term = findTerm(part);
    if (term) return <JargonSpan key={i} term={term} matchedText={part} depth={depth} />;
    return part;
  });
};
