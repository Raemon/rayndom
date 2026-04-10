'use client';
import { useState } from 'react';
import { C } from './colors';
import { data } from './data';
import { TransformerCard } from './TransformerCard';
import GlossarySidebar from './GlossarySidebar';

export default function TransformerLineage() {
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [rows, setRows] = useState(data);

  const headers = ["Year", "", "Architecture"];
  const widths = ["5%", "55%", "40%"];

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
        </div>

        {/* Table */}
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 6px" }}>
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} style={{
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
              <TransformerCard key={idx} row={row} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}
