'use client';
import { useState, useRef, useEffect } from 'react';
import { Diagram } from './diagrams';
import { JargonText } from './JargonText';
import { EditableContent } from './EditableContent';
import { ExampleModels } from './ExampleModels';

const EditableCell = ({ value, onChange, className, children, onClick }) => {
  return (
    <td className={`${className}${onClick ? ' cursor-pointer' : ''}`} onClick={e => { if (e.target === e.currentTarget) onClick?.(); }}>
      <EditableContent value={value} onChange={onChange} onClick={onClick}>{children}</EditableContent>
    </td>
  );
};

const Cell = ({ text, collapsed: c }) => {
  const paragraphs = text.split('\n\n').filter(Boolean);
  const visible = c ? paragraphs.slice(0, 1) : paragraphs;
  return (
    <div className="overflow-hidden leading-relaxed whitespace-pre-line">
      {visible.map((p, i) => (
        <div key={i} className={i < visible.length - 1 ? 'mb-[0.6em]' : ''}>
          <JargonText wrapperClassName="cursor-help text-te-accent">{p}</JargonText>
        </div>
      ))}
    </div>
  );
};

export const TransformerRow = ({ row, collapsed, onRowChange, onToggleExpand }) => {
  const updateField = (field, val) => {
    onRowChange?.({ ...row, [field]: val });
  };
  return (
    <tr className="bg-te-row-even align-top text-[.86em] font-serif">
      <EditableCell
        value={String(row.year)}
        onChange={v => updateField("year", v)}
        onClick={onToggleExpand}
        className="px-2 py-3.5 font-semibold text-te-accent whitespace-nowrap rounded-l-md w-px"
      >
        {row.year}
      </EditableCell>
      <td className={`p-3.5 leading-[1.4]${onToggleExpand ? ' cursor-pointer' : ''}`} onClick={e => { if (e.target === e.currentTarget) onToggleExpand?.(); }}>
        <EditableContent value={row.name} onChange={v => updateField("name", v)} onClick={onToggleExpand} className="font-semibold text-te-primary">
          {row.name}
        </EditableContent>
        <EditableContent value={row.oneLiner} onChange={v => updateField("oneLiner", v)} onClick={onToggleExpand} className="text-te-secondary text-[0.9em] mt-1 font-normal">
          {row.oneLiner}
        </EditableContent>
        <EditableContent value={row.examples} onChange={v => updateField("examples", v)} onClick={onToggleExpand} className="text-te-accent text-[0.82em] mt-2 font-[system-ui,-apple-system,sans-serif] leading-[1.25]">
          <ExampleModels text={row.examples} itemClassName="mt-1" />
        </EditableContent>
      </td>
      <EditableCell
        value={row.problem}
        onChange={v => updateField("problem", v)}
        onClick={onToggleExpand}
        className="p-3.5 leading-relaxed text-sm font-sans"
      >
        <Cell text={row.problem} collapsed={collapsed} />
      </EditableCell>
      <td className={`p-2.5 min-w-[300px]${onToggleExpand ? ' cursor-pointer' : ''}`} onClick={onToggleExpand}>
        <Diagram type={row.diag} />
      </td>
      <EditableCell
        value={row.whyNotSooner}
        onChange={v => updateField("whyNotSooner", v)}
        onClick={onToggleExpand}
        className="p-3.5 text-te-secondary text-sm font-sans"
      >
        <Cell text={row.whyNotSooner} collapsed={collapsed} />
      </EditableCell>
      <EditableCell
        value={row.whoInvented}
        onChange={v => updateField("whoInvented", v)}
        onClick={onToggleExpand}
        className="p-3.5 text-te-secondary text-sm font-sans"
      >
        <Cell text={row.whoInvented} collapsed={collapsed} />
      </EditableCell>
    </tr>
  );
};
