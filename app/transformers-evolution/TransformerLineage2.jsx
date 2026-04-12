'use client';
import { useState } from 'react';
import { data } from './data';
import { Diagram } from './diagrams';

const tableHeaders = [
  { key: 'year', label: 'Year', className: 'w-px whitespace-nowrap' },
  { key: 'name', label: 'Name', className: 'min-w-[180px]' },
  { key: 'problem', label: 'Problem', className: 'w-[32%]' },
  { key: 'whyNotSooner', label: 'Why Not Sooner?', className: 'w-[32%]' },
];

const TransformerLineage2 = () => {
  const [hoveredDiag, setHoveredDiag] = useState(data[0]?.diag ?? null);
  const hoveredRow = data.find(row => row.diag === hoveredDiag) ?? data[0];

  return (
    <div className="flex font-serif text-te-primary">
      <div className="w-[820px] shrink-0 h-screen overflow-y-auto px-5">
        <table className="w-full table-fixed border-separate border-spacing-y-1.5">
          <thead>
            <tr>
              {tableHeaders.map(header => (
                <th key={header.key} className={`sticky top-0 z-10 bg-te-bg px-3.5 py-2.5 text-left text-[0.78em] font-semibold uppercase tracking-widest text-black border-b border-black/[0.08] ${header.className}`}>
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(row => {
              const isActive = row.diag === hoveredRow?.diag;
              return (
                <tr key={row.diag} className={`align-top text-[.86em] ${isActive ? 'bg-black/[0.04]' : 'bg-te-row-even'}`} onMouseEnter={() => setHoveredDiag(row.diag)}>
                  <td className="px-2 py-3.5 font-semibold text-te-accent whitespace-nowrap">
                    {row.year}
                  </td>
                  <td className="p-3.5 leading-[1.25]">
                    <div className="font-semibold text-te-primary">{row.name}</div>
                  </td>
                  <td className="p-3.5 leading-relaxed">
                    <div className="line-clamp-1">{row.problem}</div>
                  </td>
                  <td className="p-3.5 leading-relaxed text-te-secondary">
                    <div className="line-clamp-1">{row.whyNotSooner}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex-1 sticky top-0 h-screen">
        <div className="flex h-full items-center justify-center px-6 py-8">
          {hoveredRow ? <Diagram type={hoveredRow.diag} /> : null}
        </div>
      </div>
    </div>
  );
};

export default TransformerLineage2;
