'use client';
import { useState, useRef, useEffect } from 'react';

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
    setEditing(true);
  };
  if (editing) {
    return (
      <div className={className} onBlur={() => { onChange(draft); setEditing(false); }}>
        <textarea
          ref={ref}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Escape') { setDraft(value); setEditing(false); }
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onChange(draft); setEditing(false); }
          }}
          className="w-full min-h-[60px] p-1 font-[inherit] text-[length:inherit] leading-[inherit] border border-gray-300 bg-white/90 resize-y"
        />
      </div>
    );
  }
  return <div className={`${className} ${onClick ? 'cursor-pointer' : 'cursor-default'}`} onClick={handleClick} onDoubleClick={handleDoubleClick}>{children}</div>;
};
