'use client';

import { useState } from 'react';
import TransformerLineage2 from './TransformerLineage2';
import TransformerLineageTable from './TransformerLineageTable';
import TransformerLineageThreeColumn from './TransformerLineageThreeColumn';

const lineageViews = [
  { key: 'table', label: 'Table', Component: TransformerLineageTable },
  { key: 'split', label: 'Split', Component: TransformerLineage2 },
  { key: 'threeColumn', label: 'Three Column', Component: TransformerLineageThreeColumn },
];

export default function TransformerLineagePage() {
  const [activeViewKey, setActiveViewKey] = useState('table');
  const ActiveView = lineageViews.find(view => view.key === activeViewKey)?.Component ?? TransformerLineageTable;
  return (
    <div className="font-serif font-[var(--font-cormorant-garamond),Georgia,serif] bg-te-bg text-te-primary">
      {/* <header className="px-5 pt-8 pb-3 max-w-[2000px] mx-auto">
        <h1 className="font-[inherit] text-5xl font-normal text-te-primary tracking-[-0.02em] leading-none">
          The Transformer Lineage
        </h1>
      </header> */}
      <div className="max-w-[2000px] mx-auto px-5 pt-4">
        <div className="flex gap-4 text-[0.82em] uppercase tracking-widest text-black">
          {lineageViews.map(view => (
            <button key={view.key} type="button" onClick={() => setActiveViewKey(view.key)} className="cursor-pointer" style={{ textDecoration: activeViewKey === view.key ? 'underline' : 'none', textUnderlineOffset: '4px' }}>
              {view.label}
            </button>
          ))}
        </div>
      </div>
      <ActiveView />
    </div>
  );
}
