'use client';
import { useState } from 'react';
import { data } from './data';
import { TransformerRow } from './TransformerRow';
import GlossarySidebar from './GlossarySidebar';

export default function TransformerLineageTable() {
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [rows, setRows] = useState(data);
  const [collapsed, setCollapsed] = useState(true);
  const [expandedRowIdx, setExpandedRowIdx] = useState(null);

  const headers = ["Year", "Innovation",  "Problem", "Why Not Sooner?", "Architecture","Examples"];
  const widths = ["1%", "18%", "24%", "22%", "22%", "10%"];
  const toggleCollapsed = () => {
    setCollapsed(c => !c);
    setExpandedRowIdx(null);
  };

  return (
    <div className="flex font-[var(--font-cormorant-garamond),Georgia,serif] bg-te-bg">
      {/* <GlossarySidebar onSelectPost={setSelectedPostId} /> */}
    <div className="flex-1 text-te-primary relative">
      <div className="max-w-[2000px] mx-auto py-8 px-5">
        {/* Header */}
        <div className="mb-8 flex justify-between items-end flex-wrap gap-4">
          <button onClick={toggleCollapsed} className="text-[0.82em] uppercase tracking-widest px-3 py-1.5 text-te-secondary hover:text-te-primary transition-colors cursor-pointer">
            {collapsed ? '▸ Expand rows' : '▾ Collapse rows'}
          </button>
        </div>

        {/* Table */}
        <table className="w-full border-separate border-spacing-y-1.5">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="text-left px-3.5 py-2.5 font-semibold uppercase tracking-widest text-black border-b border-black/[0.08] sticky top-0 bg-te-bg z-10 text-[0.78em]" style={{ width: widths[i] }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <TransformerRow
                key={idx}
                row={row}
                collapsed={collapsed ? expandedRowIdx !== idx : false}
                onToggleExpand={collapsed ? () => setExpandedRowIdx(currentIdx => currentIdx === idx ? null : idx) : undefined}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}
