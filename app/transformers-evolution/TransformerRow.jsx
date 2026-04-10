'use client';
import { useState, useRef, useEffect } from 'react';
import { C } from './colors';
import { Diagram } from './diagrams';
import { JargonText } from './JargonText';

const EditableCell = ({ value, onChange, style, children }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef(null);
  useEffect(() => { if (editing && ref.current) ref.current.focus(); }, [editing]);
  if (editing) {
    return (
      <td style={style} onBlur={() => { onChange(draft); setEditing(false); }}>
        <textarea
          ref={ref}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Escape') { setDraft(value); setEditing(false); }
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onChange(draft); setEditing(false); }
          }}
          style={{
            width: "100%", minHeight: 60, padding: 4, fontFamily: "inherit",
            fontSize: "inherit", lineHeight: "inherit", border: "1px solid #ccc",
            background: "rgba(255,255,255,0.9)", resize: "vertical",
          }}
        />
      </td>
    );
  }
  return <td style={{ ...style, cursor: "default" }} onDoubleClick={() => setEditing(true)}>{children}</td>;
};

const Cell = ({ text, collapsed: c }) => {
  const paragraphs = text.split('\n\n');
  const isLong = text.length > 180;
  return (
    <div style={{ overflow: "hidden", maxHeight: c && isLong ? "3.2em" : "none", lineHeight: "1.6" }}>
      {paragraphs.map((p, i) => (
        <div key={i} style={{ marginBottom: i < paragraphs.length - 1 ? '0.6em' : 0 }}>
          <JargonText>{p}</JargonText>
        </div>
      ))}
    </div>
  );
};

export const TransformerRow = ({ row, idx, collapsed, onRowChange }) => {
  const bg = C.rowEven;
  const updateField = (field, val) => {
    onRowChange?.({ ...row, [field]: val });
  };
  return (
    <tr style={{ "--row-bg": bg, background: bg, verticalAlign: "top", fontSize: ".86em" }}>
      <EditableCell
        value={String(row.year)}
        onChange={v => updateField("year", v)}
        style={{ padding: "14px", fontWeight: 600, color: C.textAccent, whiteSpace: "nowrap", borderRadius: "6px 0 0 6px" }}
      >
        {row.year}
      </EditableCell>
      <EditableCell
        value={row.name}
        onChange={v => updateField("name", v)}
        style={{ padding: "14px", fontWeight: 600, color: "#1a1a1a", lineHeight: 1.4 }}
      >
        {row.name}
      </EditableCell>
      <td style={{ padding: "10px", minWidth: 200 }}>
        <Diagram type={row.diag} />
      </td>
      <EditableCell
        value={row.problem}
        onChange={v => updateField("problem", v)}
        style={{ padding: "14px", lineHeight: 1.6 }}
      >
        <Cell text={row.problem} collapsed={collapsed} />
      </EditableCell>
      <EditableCell
        value={row.whyNotSooner}
        onChange={v => updateField("whyNotSooner", v)}
        style={{ padding: "14px", lineHeight: 1.6, color: C.textSecondary }}
      >
        <Cell text={row.whyNotSooner} collapsed={collapsed} />
      </EditableCell>
      <EditableCell
        value={row.examples}
        onChange={v => updateField("examples", v)}
        style={{
          padding: "14px", lineHeight: 1.2,
          borderRadius: "0 6px 6px 0", color: C.textAccent,
          fontFamily: "system-ui, -apple-system, sans-serif", fontSize: "0.88em",
        }}
      >
        <ul>
          {row.examples.split(",").map((ex, i) => (
            <li key={i} style={{ marginBottom: 12, fontSize: "0.88em" }}>{ex.trim()}</li>
          ))}
        </ul>
      </EditableCell>
    </tr>
  );
};
