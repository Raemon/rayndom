'use client';
import { useState, useRef, useEffect, Children, cloneElement, isValidElement } from 'react';
import { JargonText } from './JargonText';

const renderWithJargonTooltips = node => {
  if (typeof node === 'string') return <JargonText>{node}</JargonText>;
  if (Array.isArray(node)) return Children.map(node, child => renderWithJargonTooltips(child));
  if (!isValidElement(node)) return node;
  if (node.type === JargonText || node.props.children == null) return node;
  return cloneElement(node, undefined, renderWithJargonTooltips(node.props.children));
};

export const EditableContent = ({ value, onChange, className, children, onClick }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef(null);
  const clickTimeoutRef = useRef(null);
  useEffect(() => { if (editing && ref.current) ref.current.focus(); }, [editing]);
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    };
  }, []);
  const handleClick = () => {
    if (!onClick || editing) return;
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      onClick();
      clickTimeoutRef.current = null;
    }, 200);
  };
  const handleDoubleClick = () => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    setDraft(value);
    setEditing(true);
  };
  if (editing) {
    return (
      <div className={`${className} relative whitespace-pre-wrap`} onBlur={() => { onChange(draft); setEditing(false); }}>
        <div className="invisible whitespace-pre-wrap">{draft || ' '}</div>
        <textarea
          ref={ref}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Escape') { setDraft(value); setEditing(false); }
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onChange(draft); setEditing(false); }
          }}
          className="absolute inset-0 h-full w-full overflow-hidden p-0 font-[inherit] text-[length:inherit] leading-[inherit] text-inherit bg-transparent resize-none outline-none whitespace-pre-wrap border-0"
        />
      </div>
    );
  }
  return <div className={`${className} ${onClick ? 'cursor-pointer' : 'cursor-default'} whitespace-pre-wrap`} onClick={handleClick} onDoubleClick={handleDoubleClick}>{renderWithJargonTooltips(children ?? value)}</div>;
};
