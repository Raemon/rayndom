'use client';
import Tooltip from '@/app/common/Tooltip';
import { glossary } from './glossary';

const sortedTerms = Object.keys(glossary).sort((a, b) => b.length - a.length);
const escaped = sortedTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
const jargonRegex = escaped.length > 0
  ? new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi')
  : null;

function findTerm(part) {
  const lower = part.toLowerCase();
  return sortedTerms.find(t => t.toLowerCase() === lower);
}

const EMPTY_SET = new Set();

export const JargonSpan = ({ term, matchedText, seenTerms = EMPTY_SET }) => {
  const def = glossary[term];
  const nextSeen = new Set(seenTerms);
  nextSeen.add(term);
  return (
    <Tooltip
      content={
        <>
          <strong className="text-te-accent">{term}:</strong>{' '}
          <JargonText seenTerms={nextSeen}>{def}</JargonText>
        </>
      }
      interactive
      leaveDelayMs={200}
      placement="bottom-start"
      maxWidth={300}
      zIndex={1000 + seenTerms.size * 10}
      contentClassName="!bg-white !text-[#1a1a1a] border border-neutral-300 shadow-lg text-[0.85em] leading-normal whitespace-pre-wrap font-['Source_Serif_4',Georgia,serif]"
      wrapperClassName="cursor-help border-b border-dashed border-black/30"
    >
      <span>{matchedText}</span>
    </Tooltip>
  );
};

export const JargonText = ({ children, seenTerms = EMPTY_SET }) => {
  if (typeof children !== 'string' || !jargonRegex) return children || null;
  const parts = children.split(jargonRegex);
  return parts.map((part, i) => {
    const term = findTerm(part);
    if (term && !seenTerms.has(term)) return <JargonSpan key={i} term={term} matchedText={part} seenTerms={seenTerms} />;
    return part;
  });
};
