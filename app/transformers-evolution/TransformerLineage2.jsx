'use client';
import { useState } from 'react';
import { data } from './data';
import { Diagram } from './diagrams';
import { EditableContent } from './EditableContent';

const EditableCell = ({ value, onChange, className }) => {
  return <EditableContent value={value} onChange={onChange} className={className}>{value}</EditableContent>;
};

const tableHeaders = [
  { key: 'year', label: 'Year', className: 'w-[65px] whitespace-nowrap' },
  { key: 'name', label: 'Name', className: 'min-w-[220px]' },
  // { key: 'oneLiner', label: 'One Liner', className: 'min-w-[220px]' },
  { key: 'problem', label: 'Problem', className: 'w-[31%]' },
  // { key: 'whyNotSooner', label: 'Why Not Sooner?', className: 'w-[31%]' },
];

const TransformerLineage2 = () => {
  const [rows, setRows] = useState(data);
  const [hoveredDiag, setHoveredDiag] = useState(rows[0]?.diag ?? null);
  const hoveredRow = rows.find(row => row.diag === hoveredDiag) ?? rows[0];
  const updateHoveredRow = fields => {
    if (!hoveredRow) return;
    setRows(currentRows => currentRows.map(row => row.diag === hoveredRow.diag ? { ...row, ...fields } : row));
  };

  return (
    <div className="flex font-serif text-te-primary">
      <div className="w-[600px] shrink-0 h-[calc(100vh)] overflow-y-auto">
        <table className="w-full table-fixed border-separate border-spacing-y-1">
          {/* <thead>
            <tr>
              {tableHeaders.map(header => (
                <th key={header.key} className={`sticky top-0 z-10 bg-te-bg px-3 py-2 text-left text-xs font-semibold uppercase tracking-widest text-black border-b border-black/[0.08] ${header.className}`}>
                  {header.label}
                </th>
              ))}
            </tr>
          </thead> */}
          <tbody>
            {rows.map(row => {
              return (
                <tr key={row.diag} className={`align-top text-sm font-sans bg-white hover:bg-white/60`} onMouseEnter={() => setHoveredDiag(row.diag)}>
                  <td className="px-5 py-3 font-semibold text-te-accent whitespace-nowrap w-[64px]">
                    {row.year}
                  </td>
                  <td className="px-3 py-3 leading-tight">
                    <div className="font-semibold text-te-primary">{row.name}</div>
                  </td>
                  {/* <td className="px-3 py-3 leading-tight">
                    <div className="text-te-primary">{row.oneLiner}</div>
                  </td> */}
                  <td className="px-3 py-3 leading-normal">
                    <div className="line-clamp-1">{row.problemOneLiner}</div>
                  </td>
                  {/* <td className="px-3 py-3 leading-normal text-te-secondary">
                    <div className="line-clamp-1">{row.whyNotSoonerOneLiner}</div>
                  </td> */}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex-1 sticky top-0 h-screen overflow-y-auto">
        <div className="flex flex-col min-h-full items-stretch justify-start px-6 py-8 w-[600px] mx-auto gap-6 font-sans text-base">
          {hoveredRow?.name ? <div className="text-2xl font-serif text-te-primary text-center shrink-0"><EditableCell value={hoveredRow.name} onChange={v => updateHoveredRow({ name: v })} /></div> : null}
          <Diagram type={hoveredRow.diag} className="w-full shrink-0" />
          {/* <EditableCell value={hoveredRow.oneLiner} onChange={v => updateHoveredRow({ oneLiner: v })} /> */}
          <EditableCell value={hoveredRow.problem} onChange={v => updateHoveredRow({ problem: v })} />
          <EditableCell value={hoveredRow.whyNotSooner} onChange={v => updateHoveredRow({ whyNotSooner: v })} />
          <EditableCell value={hoveredRow.examples} onChange={v => updateHoveredRow({ examples: v })} />
        </div>
      </div>
    </div>
  );
};

export default TransformerLineage2;
