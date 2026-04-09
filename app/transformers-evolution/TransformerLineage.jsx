'use client';
import { useState, useCallback } from 'react';
import { C } from './colors';
import { data } from './data';
import { Diagram } from './diagrams';
import { JargonText } from './JargonText';
import GlossarySidebar from './GlossarySidebar';

export default function TransformerLineage() {
  const [collapsed, setCollapsed] = useState(false);
  const [tip, setTip] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const onTip = useCallback((t) => setTip(t), []);

  const Cell = ({ text, collapsed: c }) => {
    const paragraphs = text.split('\n\n');
    const isLong = text.length > 180;
    return (
      <div style={{ position: "relative" }}>
        <div style={{ overflow: "hidden", maxHeight: c && isLong ? "3.2em" : "none", lineHeight: "1.6" }}>
          {paragraphs.map((p, i) => (
            <div key={i} style={{ marginBottom: i < paragraphs.length - 1 ? '0.6em' : 0 }}>
              <JargonText>{p}</JargonText>
            </div>
          ))}
        </div>
        {c && isLong && (
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "1.8em",
            background: "linear-gradient(transparent, var(--row-bg, #f7f6f4))", pointerEvents: "none",
          }} />
        )}
      </div>
    );
  };

  const headers = ["Year", "Innovation", "Architecture", "Problem Solved", "Why Not Sooner?", "Notable Models"];
  const widths = ["4%", "9%", "17%", "27%", "24%", "13%"];

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "var(--font-cormorant-garamond), Georgia, serif" }}>
      <GlossarySidebar onSelectPost={setSelectedPostId} />
    <div style={{
      flex: 1,
      background: C.bg, color: C.textPrimary,
      height: "100vh", overflow: "auto", position: "relative",
    }}>
      {/* Tooltip */}
      {tip && (
        <div style={{
          position: "fixed",
          left: Math.min(tip.x + 12, window.innerWidth - 320),
          top: Math.max(tip.y - 10, 10),
          background: "#fff", border: "1px solid #ccc", borderRadius: 6,
          padding: "8px 12px", maxWidth: 300, fontSize: "0.85em",
          lineHeight: 1.5, color: "#1a1a1a", zIndex: 1000,
          pointerEvents: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
        }}>
          {tip.text}
        </div>
      )}

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
            {data.map((row, idx) => {
              const bg = idx % 2 === 0 ? C.rowEven : C.rowOdd;
              return (
                <tr key={idx} style={{ "--row-bg": bg, background: bg, verticalAlign: "top" }}>
                  <td style={{
                    padding: "14px", fontWeight: 600, color: C.textAccent,
                    whiteSpace: "nowrap", borderRadius: "6px 0 0 6px", fontSize: "1.05em",
                  }}>
                    {row.year}
                  </td>
                  <td style={{ padding: "14px", fontWeight: 600, color: "#1a1a1a", lineHeight: 1.4 }}>
                    {row.name}
                  </td>
                  <td style={{ padding: "10px", minWidth: 200 }}>
                    <Diagram type={row.diag} onTip={onTip} />
                  </td>
                  <td style={{ padding: "14px", lineHeight: 1.6 }}>
                    <Cell text={row.problem} collapsed={collapsed} />
                  </td>
                  <td style={{ padding: "14px", lineHeight: 1.6, color: C.textSecondary }}>
                    <Cell text={row.whyNotSooner} collapsed={collapsed} />
                  </td>
                  <td style={{
                    padding: "14px", lineHeight: 1.2,
                    borderRadius: "0 6px 6px 0", color: C.textAccent,
                    fontFamily: "system-ui, -apple-system, sans-serif", fontSize: "0.88em",
                  }}>
                    <ul>
                    {row.examples.split(",").map((ex, i) => (
                      <li key={i} style={{ marginBottom: 12 }}>{ex.trim()}</li>
                    ))}</ul>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}
