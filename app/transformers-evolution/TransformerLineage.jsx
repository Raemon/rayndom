'use client';
import { useState, useCallback } from 'react';
import { C } from './colors';
import { data } from './data';
import { TransformerRow } from './TransformerRow';
import GlossarySidebar from './GlossarySidebar';

export default function TransformerLineage() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [rows, setRows] = useState(data);
  const handleRowChange = useCallback((idx, newRow) => {
    setRows(prev => prev.map((r, i) => i === idx ? newRow : r));
  }, []);

  const headers = ["Year", "Innovation", "Architecture", "Problem Solved", "Why Not Sooner?", "Notable Models"];
  const widths = ["4%", "9%", "17%", "27%", "24%", "13%"];

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "var(--font-cormorant-garamond), Georgia, serif" ,  background: C.bg, }}>
      {/* <GlossarySidebar onSelectPost={setSelectedPostId} /> */}
    <div style={{
      flex: 1,
      color: C.textPrimary,
      height: "100vh", overflow: "auto", position: "relative",
    }}>
      <div style={{ maxWidth: 1600, margin: "0 auto", padding: "32px 20px" }}>
        {/* Header */}
        <div style={{
          marginBottom: 32, display: "flex", justifyContent: "space-between",
          alignItems: "flex-end", flexWrap: "wrap", gap: 16,
        }}>
          <div>
            <h1 style={{
              fontFamily: "inherit", fontSize: "2.6em", fontWeight: 400,
              color: "#1a1a1a", letterSpacing: "-0.02em", lineHeight: 1.1,
            }}>
              The Transformer Lineage
            </h1>
            <p style={{ marginTop: 8, maxWidth: 600 }}>
              A technical genealogy of major innovations. Hover over diagram elements for detailed explanations.
            </p>
          </div>
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{
              background: collapsed ? "#e8e5e0" : "#d5d0c8",
              border: "1px solid rgba(0,0,0,0.1)", color: "#1a1a1a",
              padding: "8px 18px", borderRadius: 6, cursor: "pointer",
              fontFamily: "inherit", fontSize: "inherit",
            }}
          >
            {collapsed ? "⤢ Expand All" : "⤡ Collapse All"}
          </button>
        </div>

        {/* Table */}
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 6px" }}>
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={h} style={{
                  textAlign: "left", padding: "10px 14px", fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: "0.1em",
                  color: C.headerText, borderBottom: "1px solid rgba(0,0,0,0.08)",
                  position: "sticky", top: 0, background: C.bg,
                  zIndex: 10, width: widths[i], fontSize: "0.78em",
                }}>
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
                idx={idx}
                collapsed={collapsed}
                onRowChange={newRow => handleRowChange(idx, newRow)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}
