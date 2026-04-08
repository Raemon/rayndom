'use client';
import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
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

const JargonSpan = ({ term, matchedText, depth }) => {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const hideRef = useRef(null);
  const def = glossary[term];
  const enter = (e) => {
    clearTimeout(hideRef.current);
    setShow(true);
    setPos({ x: e.clientX, y: e.clientY });
  };
  const leave = () => {
    hideRef.current = setTimeout(() => setShow(false), depth < MAX_DEPTH - 1 ? 200 : 0);
  };
  const keepOpen = () => clearTimeout(hideRef.current);
  return (
    <>
      <span
        onMouseEnter={enter}
        onMouseLeave={leave}
        style={{ cursor: 'help', borderBottom: '1px dashed rgba(0,0,0,0.3)' }}
      >
        {matchedText}
      </span>
      {show && createPortal(
        <div
          onMouseEnter={depth < MAX_DEPTH - 1 ? keepOpen : undefined}
          onMouseLeave={depth < MAX_DEPTH - 1 ? leave : undefined}
          style={{
            position: 'fixed',
            left: Math.min(pos.x + 12, window.innerWidth - 320),
            top: Math.max(pos.y + 16, 10),
            background: '#fff', border: '1px solid #ccc', borderRadius: 6,
            padding: '8px 12px', maxWidth: 300, fontSize: '0.85em',
            lineHeight: 1.5, color: '#1a1a1a', zIndex: 1000 + depth * 10,
            pointerEvents: depth < MAX_DEPTH - 1 ? 'auto' : 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            fontFamily: "'Source Serif 4', Georgia, serif",
          }}
        >
          <strong style={{ color: C.textAccent }}>{term}:</strong>{' '}
          {depth < MAX_DEPTH - 1 ? <JargonText depth={depth + 1}>{def}</JargonText> : def}
        </div>,
        document.body
      )}
    </>
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
